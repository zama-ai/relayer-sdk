import type { Bytes65Hex, BytesHex } from '@base/types/primitives';
import type {
  FheTypeId,
  SolidityPrimitiveTypeName,
} from '@fhevm-base/types/public-api';
import type { FhevmHandle } from '@fhevm-base/types/public-api';
import type { ClearValueType, PublicDecryptResults } from './public-api';
import type { ABILib } from '@fhevm-base-types/public-api';
import type { PublicDecryptionProof } from './public-api';
import { assertNever } from '@base/errors/utils';
import { concatBytesHex } from '@base/bytes';

//////////////////////////////////////////////////////////////////////////////
// PublicDecryptionProof class
//////////////////////////////////////////////////////////////////////////////

class PublicDecryptionProofImpl implements PublicDecryptionProof {
  // numSigners + KMS signatures + extraData
  readonly #proof: BytesHex;
  readonly #orderedHandles: readonly FhevmHandle[];
  readonly #orderedClearValues: readonly ClearValueType[];
  readonly #extraData: BytesHex;
  readonly #orderedAbiEncodedClearValues: BytesHex;

  constructor(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedClearValues: readonly ClearValueType[];
    readonly proof: BytesHex;
    readonly extraData: BytesHex;
    readonly orderedAbiEncodedClearValues: BytesHex;
  }) {
    this.#proof = params.proof;
    this.#orderedClearValues = Object.freeze([...params.orderedClearValues]);
    this.#orderedHandles = Object.freeze([...params.orderedHandles]);
    this.#extraData = params.extraData;
    this.#orderedAbiEncodedClearValues = params.orderedAbiEncodedClearValues;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public get proof(): BytesHex {
    return this.#proof;
  }

  public get orderedHandles(): readonly FhevmHandle[] {
    return this.#orderedHandles;
  }

  public get orderedClearValues(): readonly ClearValueType[] {
    return this.#orderedClearValues;
  }

  public get orderedAbiEncodedClearValues(): BytesHex {
    return this.#orderedAbiEncodedClearValues;
  }

  public get extraData(): BytesHex {
    return this.#extraData;
  }

  //////////////////////////////////////////////////////////////////////////////
  // PublicDecryptResults
  //////////////////////////////////////////////////////////////////////////////

  public toPublicDecryptResults(): PublicDecryptResults {
    const clearValues: Record<string, ClearValueType> = {};

    this.#orderedHandles.forEach(
      (fhevmHandle, idx) =>
        (clearValues[fhevmHandle.bytes32Hex] = this.#orderedClearValues[idx]),
    );

    Object.freeze(clearValues);

    return Object.freeze({
      clearValues,
      decryptionProof: this.#proof,
      abiEncodedClearValues: this.#orderedAbiEncodedClearValues,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createPublicDecryptionProof(
  fhevm: { libs: { readonly abiLib: ABILib } },
  {
    orderedHandles,
    orderedDecryptedResult,
    signatures,
    extraData,
  }: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  },
): PublicDecryptionProof {
  ////////////////////////////////////////////////////////////////////////////
  // Compute the proof as numSigners + KMS signatures + extraData
  ////////////////////////////////////////////////////////////////////////////

  const packedNumSigners: BytesHex = fhevm.libs.abiLib.encodePacked({
    types: ['uint8'],
    values: [signatures.length],
  });

  const packedSignatures = fhevm.libs.abiLib.encodePacked({
    types: Array(signatures.length).fill('bytes') as string[],
    values: signatures,
  });

  const proof: BytesHex = concatBytesHex([
    packedNumSigners,
    packedSignatures,
    extraData,
  ]);

  ////////////////////////////////////////////////////////////////////////////
  // Deserialize ordered decrypted result
  ////////////////////////////////////////////////////////////////////////////

  const orderedAbiTypes: SolidityPrimitiveTypeName[] = orderedHandles.map(
    (h) => h.solidityPrimitiveTypeName,
  );

  const decoded = fhevm.libs.abiLib.decode({
    types: orderedAbiTypes,
    encodedData: orderedDecryptedResult,
  });

  if (decoded.length !== orderedHandles.length) {
    throw new Error('Invalid decrypted result.');
  }

  const orderedClearValues = orderedHandles.map(
    (_, index) => decoded[index] as ClearValueType,
  );

  return new PublicDecryptionProofImpl({
    orderedHandles,
    orderedClearValues,
    proof,
    extraData,
    orderedAbiEncodedClearValues: _abiEncodeOrderedClearValues(libs, {
      orderedClearValues,
      orderedHandles,
    }).abiEncodedClearValues,
  });
}

////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////

function _abiEncodeOrderedClearValues(
  fhevm: { libs: { readonly abiLib: ABILib } },
  {
    orderedHandles,
    orderedClearValues,
  }: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedClearValues: readonly ClearValueType[];
  },
): {
  abiTypes: Array<'uint256'>;
  abiValues: Array<string | bigint>;
  abiEncodedClearValues: BytesHex;
} {
  const abiTypes: Array<'uint256'> = [];
  const abiValues: Array<string | bigint> = [];

  for (let i = 0; i < orderedHandles.length; ++i) {
    const handleType: FheTypeId = orderedHandles[i].fheTypeId;

    let clearTextValue: ClearValueType = orderedClearValues[i];
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

  // ABI encode the decryptedResult as done in the KMS, since all decrypted values
  // are native static types, thay have same abi-encoding as uint256:
  const abiEncodedClearValues: BytesHex = libs.abiLib.encode({
    types: abiTypes,
    values: abiValues,
  });

  return {
    abiTypes,
    abiValues,
    abiEncodedClearValues,
  };
}
