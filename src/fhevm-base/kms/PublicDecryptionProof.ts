import type { Bytes65Hex, BytesHex } from '@base/types/primitives';
import type {
  PublicDecryptionProof,
  FhevmHandle,
  SolidityPrimitiveTypeName,
  DecryptedFhevmHandle,
  FhevmConfig,
  DecryptedFheValue,
} from '../types/public-api';
import type { ABILib, EIP712Lib } from '@fhevm-base-types/public-api';
import { concatBytesHex } from '@base/bytes';
import { verifyKmsPublicDecryptEIP712 } from './KmsEIP712';
import { toDecryptedFheValue } from '@fhevm-base/FheType';
import {
  abiEncodeDecryptedFhevmHandles,
  createDecryptedFhevmHandleArray,
} from '@fhevm-base/DecryptedFhevmHandle';

//////////////////////////////////////////////////////////////////////////////
// PublicDecryptionProof class
//////////////////////////////////////////////////////////////////////////////

class PublicDecryptionProofImpl implements PublicDecryptionProof {
  // numSigners + KMS signatures + extraData
  readonly #decryptionProof: BytesHex;
  readonly #orderedDecryptedHandles: readonly DecryptedFhevmHandle[];
  readonly #orderedAbiEncodedClearValues: BytesHex;
  readonly #extraData: BytesHex;

  constructor(params: {
    readonly decryptionProof: BytesHex;
    readonly orderedDecryptedHandles: readonly DecryptedFhevmHandle[];
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly extraData: BytesHex;
  }) {
    this.#decryptionProof = params.decryptionProof;
    this.#orderedDecryptedHandles = Object.freeze([
      ...params.orderedDecryptedHandles,
    ]);
    this.#extraData = params.extraData;
    this.#orderedAbiEncodedClearValues = params.orderedAbiEncodedClearValues;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public get decryptionProof(): BytesHex {
    return this.#decryptionProof;
  }

  public get orderedDecryptedHandles(): readonly DecryptedFhevmHandle[] {
    return this.#orderedDecryptedHandles;
  }

  public get orderedAbiEncodedClearValues(): BytesHex {
    return this.#orderedAbiEncodedClearValues;
  }

  public get extraData(): BytesHex {
    return this.#extraData;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // // PublicDecryptResults
  // //////////////////////////////////////////////////////////////////////////////

  // public toPublicDecryptResults(): PublicDecryptResults {
  //   const clearValues: Record<string, ClearValueType> = {};

  //   this.#orderedHandles.forEach(
  //     (fhevmHandle, idx) =>
  //       (clearValues[fhevmHandle.bytes32Hex] = this.#orderedClearValues[idx]),
  //   );

  //   Object.freeze(clearValues);

  //   return Object.freeze({
  //     clearValues,
  //     decryptionProof: this.#proof,
  //     abiEncodedClearValues: this.#orderedAbiEncodedClearValues,
  //   });
  // }
}

Object.freeze(PublicDecryptionProofImpl.prototype);

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function isPublicDecryptionProof(
  value: unknown,
): value is PublicDecryptionProof {
  return value instanceof PublicDecryptionProofImpl;
}

export async function createPublicDecryptionProof(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib; readonly abiLib: ABILib };
    readonly config: FhevmConfig;
  },
  args: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly kmsPublicDecryptEIP712Signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  },
): Promise<PublicDecryptionProof> {
  await verifyKmsPublicDecryptEIP712(fhevm, args);

  const {
    orderedHandles,
    orderedAbiEncodedClearValues,
    kmsPublicDecryptEIP712Signatures,
    extraData,
  } = args;

  //////////////////////////////////////////////////////////////////////////////
  // Compute the proof as numSigners + KMS signatures + extraData
  //////////////////////////////////////////////////////////////////////////////

  const packedNumSigners: BytesHex = fhevm.libs.abiLib.encodePacked({
    types: ['uint8'],
    values: [kmsPublicDecryptEIP712Signatures.length],
  });

  const packedSignatures = fhevm.libs.abiLib.encodePacked({
    types: Array(kmsPublicDecryptEIP712Signatures.length).fill(
      'bytes',
    ) as string[],
    values: kmsPublicDecryptEIP712Signatures,
  });

  const decryptionProof: BytesHex = concatBytesHex([
    packedNumSigners,
    packedSignatures,
    extraData,
  ]);

  //////////////////////////////////////////////////////////////////////////////
  // Deserialize ordered decrypted result
  //////////////////////////////////////////////////////////////////////////////

  const orderedAbiTypes: SolidityPrimitiveTypeName[] = orderedHandles.map(
    (h) => h.solidityPrimitiveTypeName,
  );

  const decoded = fhevm.libs.abiLib.decode({
    types: orderedAbiTypes,
    encodedData: orderedAbiEncodedClearValues,
  });

  if (decoded.length !== orderedHandles.length) {
    throw new Error('Invalid decrypted result.');
  }

  const orderedClearValues: DecryptedFheValue[] = orderedHandles.map(
    (h, index) => toDecryptedFheValue(h.fheTypeName, decoded[index]),
  );

  const originToken: symbol = Symbol('asasa');
  const orderedDecryptedFhevmHandles = createDecryptedFhevmHandleArray(
    orderedHandles,
    orderedClearValues,
    originToken,
  );

  const orderedAbiEncodedDecryptedFhevmHandles = abiEncodeDecryptedFhevmHandles(
    fhevm,
    {
      orderedHandles: orderedDecryptedFhevmHandles,
    },
  );

  return new PublicDecryptionProofImpl({
    decryptionProof: decryptionProof,
    orderedDecryptedHandles: orderedDecryptedFhevmHandles,
    orderedAbiEncodedClearValues:
      orderedAbiEncodedDecryptedFhevmHandles.abiEncodedClearValues,
    extraData,
  });
}
