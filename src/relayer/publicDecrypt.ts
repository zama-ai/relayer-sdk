import { fromHexString, toHexString } from '../utils';
import { ethers, AbiCoder } from 'ethers';
import { DecryptedResults, checkEncryptedBits } from './decryptUtils';
import {
  fetchRelayerJsonRpcPost,
  RelayerPublicDecryptPayload,
} from './fetchRelayer';

const aclABI = [
  'function isAllowedForDecryption(bytes32 handle) view returns (bool)',
];

function isThresholdReached(
  kmsSigners: string[],
  recoveredAddresses: string[],
  threshold: number,
): boolean {
  const addressMap = new Map<string, number>();
  recoveredAddresses.forEach((address, index) => {
    if (addressMap.has(address)) {
      const duplicateValue = address;
      throw new Error(
        `Duplicate KMS signer address found: ${duplicateValue} appears multiple times in recovered addresses`,
      );
    }
    addressMap.set(address, index);
  });

  for (const address of recoveredAddresses) {
    if (!kmsSigners.includes(address)) {
      throw new Error(
        `Invalid address found: ${address} is not in the list of KMS signers`,
      );
    }
  }

  return recoveredAddresses.length >= threshold;
}

const CiphertextType: Record<number, 'bool' | 'uint256' | 'address' | 'bytes'> =
  {
    0: 'bool',
    2: 'uint256',
    3: 'uint256',
    4: 'uint256',
    5: 'uint256',
    6: 'uint256',
    7: 'address',
    8: 'uint256',
  };

function deserializeDecryptedResult(
  handles: string[],
  decryptedResult: string,
): DecryptedResults {
  let typesList: number[] = [];
  for (const handle of handles) {
    const hexPair = handle.slice(-4, -2).toLowerCase();
    const typeDiscriminant = parseInt(hexPair, 16);
    typesList.push(typeDiscriminant);
  }

  const restoredEncoded =
    '0x' +
    '00'.repeat(32) + // dummy requestID (ignored)
    decryptedResult.slice(2) +
    '00'.repeat(32); // dummy empty bytes[] length (ignored)

  const abiTypes = typesList.map((t) => {
    const abiType = CiphertextType[t]; // all types are valid because this was supposedly checked already inside the `checkEncryptedBits` function
    return abiType;
  });

  const coder = new AbiCoder();
  const decoded = coder.decode(
    ['uint256', ...abiTypes, 'bytes[]'],
    restoredEncoded,
  );

  // strip dummy first/last element
  const rawValues = decoded.slice(1, 1 + typesList.length);

  let results: DecryptedResults = {};
  handles.forEach((handle, idx) => (results[handle] = rawValues[idx]));

  return results;
}

export const publicDecryptRequest =
  (
    kmsSigners: string[],
    thresholdSigners: number,
    gatewayChainId: number,
    verifyingContractAddress: string,
    aclContractAddress: string,
    relayerUrl: string,
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
    options?: { apiKey?: string },
  ) =>
  async (_handles: (Uint8Array | string)[]) => {
    const acl = new ethers.Contract(aclContractAddress, aclABI, provider);

    let handles: `0x${string}`[];
    try {
      handles = await Promise.all(
        _handles.map(async (_handle) => {
          const handle =
            typeof _handle === 'string'
              ? toHexString(fromHexString(_handle), true)
              : toHexString(_handle, true);

          const isAllowedForDecryption = await acl.isAllowedForDecryption(
            handle,
          );
          if (!isAllowedForDecryption) {
            throw new Error(
              `Handle ${handle} is not allowed for public decryption!`,
            );
          }
          return handle;
        }),
      );
    } catch (e) {
      throw e;
    }

    // check 2048 bits limit
    checkEncryptedBits(handles);

    const payloadForRequest: RelayerPublicDecryptPayload = {
      ciphertextHandles: handles,
    };

    const json = await fetchRelayerJsonRpcPost(
      'PUBLIC_DECRYPT',
      `${relayerUrl}/v1/public-decrypt`,
      payloadForRequest,
      options,
    );

    // verify signatures on decryption:
    const domain = {
      name: 'Decryption',
      version: '1',
      chainId: gatewayChainId,
      verifyingContract: verifyingContractAddress,
    };
    const types = {
      PublicDecryptVerification: [
        { name: 'ctHandles', type: 'bytes32[]' },
        { name: 'decryptedResult', type: 'bytes' },
      ],
    };
    const result = json.response[0];
    const decryptedResult = result.decrypted_value.startsWith('0x')
      ? result.decrypted_value
      : `0x${result.decrypted_value}`;
    const signatures = result.signatures;

    const recoveredAddresses = signatures.map((signature: string) => {
      const sig = signature.startsWith('0x') ? signature : `0x${signature}`;
      const recoveredAddress = ethers.verifyTypedData(
        domain,
        types,
        { ctHandles: handles, decryptedResult },
        sig,
      );
      return recoveredAddress;
    });

    const thresholdReached = isThresholdReached(
      kmsSigners,
      recoveredAddresses,
      thresholdSigners,
    );

    if (!thresholdReached) {
      throw Error('KMS signers threshold is not reached');
    }

    const results = deserializeDecryptedResult(handles, decryptedResult);

    return results;
  };
