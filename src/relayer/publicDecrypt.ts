import { fromHexString, toHexString } from '../utils';
import { ethers, Interface } from 'ethers';

const aclABI = new Interface([
  'function isAllowedForDecryption(bytes32 handle) view returns (bool)',
]);

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
        `Duplicate signer address found: ${duplicateValue} appears multiple times in recovered addresses`,
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

export const publicDecryptRequest =
  (
    kmsSigners: string[],
    thresholdSigners: number,
    gatewayChainId: number,
    verifyingContractAddress: string,
    aclContractAddress: string,
    relayerUrl: string,
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
  ) =>
  async (_handles: (Uint8Array | string)[]) => {
    const handles = _handles.map((handle) =>
      typeof handle === 'string'
        ? toHexString(fromHexString(handle), true)
        : toHexString(handle, true),
    );

    const acl = new ethers.Contract(aclContractAddress, aclABI, provider);

    const verifications = handles.map(async (ctHandle) => {
      const isAllowedForDecryption = await acl.isAllowedForDecryption(ctHandle);
      if (!isAllowedForDecryption) {
        throw new Error(
          `Handle ${ctHandle} is not allowed for public decryption!`,
        );
      }
    });

    await Promise.all(verifications).catch((e) => {
      throw e;
    });

    // TODO: check 2048 bits limit

    const payloadForRequest = {
      ciphertextHandles: handles,
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadForRequest),
    };

    let response;
    let json;
    try {
      response = await fetch(`${relayerUrl}/v1/public-decrypt`, options);
      if (!response.ok) {
        throw new Error(
          `User decrypt failed: relayer respond with HTTP code ${response.status}`,
        );
      }
    } catch (e) {
      throw new Error("Public decrypt failed: Relayer didn't respond", {
        cause: e,
      });
    }

    try {
      json = await response.json();
    } catch (e) {
      throw new Error("Public decrypt failed: Relayer didn't return a JSON", {
        cause: e,
      });
    }

    if (json.status === 'failure') {
      throw new Error(
        "Public decrypt failed: the public decrypt didn't succeed for an unknown reason",
        { cause: json },
      );
    }

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
        { ctHandles: handles, decryptedResult: decryptedResult },
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

    // TODO deserialization + abi decoding

    return json;
  };
