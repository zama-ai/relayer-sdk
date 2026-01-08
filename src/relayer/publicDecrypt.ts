import type {
  RelayerPublicDecryptOptionsType,
  RelayerPublicDecryptPayload,
  RelayerPublicDecryptResult,
} from '@relayer-provider/types/public-api';
import type {
  Bytes32Hex,
  ChecksummedAddress,
  FheTypeId,
} from '@base/types/primitives';
import type {
  ClearValues,
  ClearValueType,
  FhevmInstanceOptions,
  PublicDecryptResults,
} from '../types/relayer';
import type { Provider as EthersProviderType } from 'ethers';
import { solidityPacked, concat, AbiCoder, verifyTypedData } from 'ethers';
import { ensure0x } from '@base/string';
import { assertNever } from '../errors/utils';
import { AbstractRelayerProvider } from '@relayer-provider/AbstractRelayerProvider';
import { solidityPrimitiveTypeNameFromFheTypeId } from '@sdk/FheType';
import { FhevmHandle } from '@sdk/FhevmHandle';
import { fhevmHandleCheck2048EncryptedBits } from './decryptUtils';
import { ACL } from '@sdk/ACL';

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

function abiEncodeClearValues(
  handlesBytes32Hex: `0x${string}`[],
  clearValues: ClearValues,
) {
  const abiTypes: string[] = [];
  const abiValues: (string | bigint)[] = [];

  for (let i = 0; i < handlesBytes32Hex.length; ++i) {
    const handle = handlesBytes32Hex[i];
    const handleType: FheTypeId = FhevmHandle.from(handle).fheTypeId;

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
        assertNever(
          handleType,
          `Unsupported Fhevm primitive type id: ${handleType}`,
        );
      }
    }
  }

  const abiCoder = AbiCoder.defaultAbiCoder();

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

////////////////////////////////////////////////////////////////////////////////

function buildDecryptionProof(
  kmsSignatures: `0x${string}`[],
  extraData: `0x${string}`,
): `0x${string}` {
  // Build the decryptionProof as numSigners + KMS signatures + extraData
  const packedNumSigners = solidityPacked(['uint8'], [kmsSignatures.length]);
  const packedSignatures = solidityPacked(
    Array(kmsSignatures.length).fill('bytes'),
    kmsSignatures,
  );
  const decryptionProof: `0x${string}` = concat([
    packedNumSigners,
    packedSignatures,
    extraData,
  ]) as `0x${string}`;
  return decryptionProof;
}

////////////////////////////////////////////////////////////////////////////////

function deserializeClearValues(
  orderedFhevmHandles: FhevmHandle[],
  decryptedResult: `0x${string}`,
): ClearValues {
  let fheTypeIdList: FheTypeId[] = [];
  for (const fhevmHandle of orderedFhevmHandles) {
    fheTypeIdList.push(fhevmHandle.fheTypeId);
  }

  const restoredEncoded =
    '0x' +
    '00'.repeat(32) + // dummy requestID (ignored)
    decryptedResult.slice(2) +
    '00'.repeat(32); // dummy empty bytes[] length (ignored)

  const abiTypes = fheTypeIdList.map((t: FheTypeId) => {
    const abiType = solidityPrimitiveTypeNameFromFheTypeId(t); // all types are valid because this was supposedly checked already inside the `checkEncryptedBits` function
    return abiType;
  });

  const coder = new AbiCoder();
  const decoded = coder.decode(
    ['uint256', ...abiTypes, 'bytes[]'],
    restoredEncoded,
  );

  // strip dummy first/last element
  const rawValues = decoded.slice(1, 1 + fheTypeIdList.length);

  const results: Record<string, ClearValueType> = {};

  orderedFhevmHandles.forEach(
    (fhevmHandle, idx) =>
      (results[fhevmHandle.toBytes32Hex()] = rawValues[idx]),
  );

  return results;
}

////////////////////////////////////////////////////////////////////////////////

export const publicDecryptRequest =
  ({
    kmsSigners,
    thresholdSigners,
    gatewayChainId,
    verifyingContractAddressDecryption,
    aclContractAddress,
    relayerProvider,
    provider,
    defaultOptions,
  }: {
    kmsSigners: ChecksummedAddress[];
    thresholdSigners: number;
    gatewayChainId: number;
    verifyingContractAddressDecryption: ChecksummedAddress;
    aclContractAddress: ChecksummedAddress;
    relayerProvider: AbstractRelayerProvider;
    provider: EthersProviderType;
    defaultOptions?: FhevmInstanceOptions;
  }) =>
  async (
    _handles: (Uint8Array | string)[],
    options?: RelayerPublicDecryptOptionsType,
  ): Promise<PublicDecryptResults> => {
    const extraData: `0x${string}` = '0x00';

    const orderedFhevmHandles: FhevmHandle[] = _handles.map(FhevmHandle.from);
    const orderedHandlesBytes32Hex: Bytes32Hex[] = orderedFhevmHandles.map(
      (h) => h.toBytes32Hex(),
    );

    // Check 2048 bits limit
    fhevmHandleCheck2048EncryptedBits(orderedFhevmHandles);

    // Check ACL permissions
    const acl = new ACL({
      aclContractAddress: aclContractAddress as ChecksummedAddress,
      provider,
    });
    await acl.checkAllowedForDecryption(orderedFhevmHandles);

    // Call relayer
    const payloadForRequest: RelayerPublicDecryptPayload = {
      ciphertextHandles: orderedHandlesBytes32Hex,
      extraData,
    };

    const json: RelayerPublicDecryptResult =
      await relayerProvider.fetchPostPublicDecrypt(payloadForRequest, {
        ...defaultOptions,
        ...options,
      });

    // Sanitize relayer response
    const decryptedResult: `0x${string}` = ensure0x(json.decryptedValue);
    const kmsSignatures: `0x${string}`[] = json.signatures.map(ensure0x);

    ////////////////////////////////////////////////////////////////////////////
    //
    // Warning!!!! Do not use '0x00' here!! Only '0x' is permitted!
    //
    ////////////////////////////////////////////////////////////////////////////
    const signedExtraData = '0x';

    ////////////////////////////////////////////////////////////////////////////
    // Compute the PublicDecryptionProof
    ////////////////////////////////////////////////////////////////////////////

    /*
    const kmsVerifier = KmsSignersVerifier.fromAddresses({
      chainId: BigInt(gatewayChainId),
      kmsSigners,
      threshold: thresholdSigners,
      verifyingContractAddressDecryption,
    });

    const publicDecryptionProof: PublicDecryptionProof =
      kmsVerifier.verifyAndComputePublicDecryptionProof({
        orderedHandles: orderedFhevmHandles,
        orderedDecryptedResult: decryptedResult as BytesHex,
        signatures: kmsSignatures,
        extraData: signedExtraData,
      });
    */

    ////////////////////////////////////////////////////////////////////////////

    // verify signatures on decryption:
    const domain = {
      name: 'Decryption',
      version: '1',
      chainId: gatewayChainId,
      verifyingContract: verifyingContractAddressDecryption,
    };
    const types = {
      PublicDecryptVerification: [
        { name: 'ctHandles', type: 'bytes32[]' },
        { name: 'decryptedResult', type: 'bytes' },
        { name: 'extraData', type: 'bytes' },
      ],
    };

    const recoveredAddresses: `0x${string}`[] = kmsSignatures.map(
      (kmsSignature: `0x${string}`) => {
        const recoveredAddress = verifyTypedData(
          domain,
          types,
          {
            ctHandles: orderedHandlesBytes32Hex,
            decryptedResult,
            extraData: signedExtraData,
          },
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
      orderedFhevmHandles,
      decryptedResult,
    );

    const abiEnc = abiEncodeClearValues(orderedHandlesBytes32Hex, clearValues);
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
