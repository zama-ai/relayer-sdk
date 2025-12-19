import { hexToBytes, toHexString } from '../utils/bytes';
import { ethers, AbiCoder } from 'ethers';
import { checkEncryptedBits } from './decryptUtils';
import type {
  ClearValues,
  ClearValueType,
  FhevmInstanceOptions,
  PublicDecryptResults,
  RelayerPublicDecryptPayload,
} from '../types/relayer';
import { ensure0x } from '../utils/string';
import { AbstractRelayerProvider } from '../relayer-provider/AbstractRelayerProvider';
import type { RelayerV2PublicDecryptOptions } from '../relayer-provider/v2/types/types';
import { FhevmHandle } from 'src/sdk/FhevmHandle';
import { Bytes32Hex, FheTypeId } from 'src/types/primitives';
import { assertRelayer } from 'src/errors/InternalError';

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

function abiEncodeClearValues(clearValues: ClearValues) {
  const handlesBytes32Hex = Object.keys(clearValues) as `0x${string}`[];

  const abiTypes: string[] = [];
  const abiValues: (string | bigint)[] = [];

  for (let i = 0; i < handlesBytes32Hex.length; ++i) {
    const handle = handlesBytes32Hex[i];
    const handleType = FhevmHandle.getFheTypeId(handle);

    let clearTextValue: ClearValueType =
      clearValues[handle as keyof typeof clearValues];
    if (typeof clearTextValue === 'boolean') {
      clearTextValue = clearTextValue ? '0x01' : '0x00';
    }

    const clearTextValueBigInt = BigInt(clearTextValue);

    //abiTypes.push(fhevmTypeInfo.solidityTypeName);
    abiTypes.push('uint256');

    switch (handleType) {
      // eaddress
      case 7: {
        // string
        abiValues.push(
          `0x${clearTextValueBigInt.toString(16).padStart(40, '0')}`,
        );
        break;
      }
      // ebool
      case 0: {
        // bigint (0 or 1)
        if (
          clearTextValueBigInt !== BigInt(0) &&
          clearTextValueBigInt !== BigInt(1)
        ) {
          throw new Error(
            `Invalid ebool clear text value ${clearTextValueBigInt}. Expecting 0 or 1.`,
          );
        }
        abiValues.push(clearTextValueBigInt);
        break;
      }
      case 2: //euint8
      case 3: //euint16
      case 4: //euint32
      case 5: //euint64
      case 6: //euint128
      case 8: {
        //euint256
        // bigint
        abiValues.push(clearTextValueBigInt);
        break;
      }
      default: {
        throw new Error(`Unsupported Fhevm primitive type id: ${handleType}`);
      }
    }
  }

  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  // ABI encode the decryptedResult as done in the KMS, since all decrypted values
  // are native static types, thay have same abi-encoding as uint256:
  const abiEncodedClearValues: `0x${string}` = abiCoder.encode(
    abiTypes,
    abiValues,
  ) as `0x${string}`;

  return {
    abiTypes,
    abiValues,
    abiEncodedClearValues,
  };
}

function buildDecryptionProof(
  kmsSignatures: `0x${string}`[],
  extraData: `0x${string}`,
): `0x${string}` {
  // Build the decryptionProof as numSigners + KMS signatures + extraData
  const packedNumSigners = ethers.solidityPacked(
    ['uint8'],
    [kmsSignatures.length],
  );
  const packedSignatures = ethers.solidityPacked(
    Array(kmsSignatures.length).fill('bytes'),
    kmsSignatures,
  );
  const decryptionProof: `0x${string}` = ethers.concat([
    packedNumSigners,
    packedSignatures,
    extraData,
  ]) as `0x${string}`;
  return decryptionProof;
}

function deserializeClearValues(
  handles: Bytes32Hex[],
  decryptedResult: `0x${string}`,
): ClearValues {
  let typesList: FheTypeId[] = [];
  for (const handle of handles) {
    const typeDiscriminant = FhevmHandle.getFheTypeId(handle);
    assertRelayer(FhevmHandle.isFheTypeId(typeDiscriminant));
    typesList.push(typeDiscriminant as FheTypeId);
  }

  const restoredEncoded =
    '0x' +
    '00'.repeat(32) + // dummy requestID (ignored)
    decryptedResult.slice(2) +
    '00'.repeat(32); // dummy empty bytes[] length (ignored)

  const abiTypes = typesList.map((t) => {
    const abiType = FhevmHandle.FheTypeIdToSolidityPrimitiveType[t]; // all types are valid because this was supposedly checked already inside the `checkEncryptedBits` function
    return abiType;
  });

  const coder = new AbiCoder();
  const decoded = coder.decode(
    ['uint256', ...abiTypes, 'bytes[]'],
    restoredEncoded,
  );

  // strip dummy first/last element
  const rawValues = decoded.slice(1, 1 + typesList.length);

  const results: ClearValues = {};
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
    relayerProvider: AbstractRelayerProvider,
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
    defaultOptions?: FhevmInstanceOptions,
  ) =>
  async (
    _handles: (Uint8Array | string)[],
    options?: RelayerV2PublicDecryptOptions,
  ): Promise<PublicDecryptResults> => {
    const extraData: `0x${string}` = '0x00';
    const acl = new ethers.Contract(aclContractAddress, aclABI, provider);

    let handles: `0x${string}`[];
    try {
      handles = await Promise.all(
        _handles.map(async (_handle) => {
          const handle =
            typeof _handle === 'string'
              ? toHexString(hexToBytes(_handle), true)
              : toHexString(_handle, true);

          const isAllowedForDecryption =
            await acl.isAllowedForDecryption(handle);
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
      extraData,
    };

    const json = await relayerProvider.fetchPostPublicDecrypt(
      payloadForRequest,
      {
        ...defaultOptions,
        ...options,
      },
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
        { name: 'extraData', type: 'bytes' },
      ],
    };
    //const result = json.response[0];
    const result = json;
    const decryptedResult: `0x${string}` = ensure0x(result.decryptedValue);
    const kmsSignatures: `0x${string}`[] = result.signatures.map(ensure0x);

    // TODO result.extraData (RelayerPublicDecryptJsonResponse)
    const signedExtraData = '0x';

    const recoveredAddresses: `0x${string}`[] = kmsSignatures.map(
      (kmsSignature: `0x${string}`) => {
        const recoveredAddress = ethers.verifyTypedData(
          domain,
          types,
          { ctHandles: handles, decryptedResult, extraData: signedExtraData },
          kmsSignature,
        ) as `0x${string}`;
        return recoveredAddress;
      },
    );

    const thresholdReached = isThresholdReached(
      kmsSigners,
      recoveredAddresses,
      thresholdSigners,
    );

    if (!thresholdReached) {
      throw Error('KMS signers threshold is not reached');
    }

    const clearValues: ClearValues = deserializeClearValues(
      handles,
      decryptedResult,
    );

    const abiEnc = abiEncodeClearValues(clearValues);
    const decryptionProof = buildDecryptionProof(
      kmsSignatures,
      signedExtraData,
    );

    return {
      clearValues,
      abiEncodedClearValues: abiEnc.abiEncodedClearValues,
      decryptionProof,
    };
  };
