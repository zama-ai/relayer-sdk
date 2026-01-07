import type {
  Bytes65Hex,
  BytesHex,
  FheTypeId,
  SolidityPrimitiveTypeName,
} from '@base/types/primitives';
import type { FhevmHandle } from '@sdk/FhevmHandle';
import type { ClearValueType, PublicDecryptResults } from '../../types/relayer';
import { solidityPacked, concat, AbiCoder } from 'ethers';
import { assertNever } from '../../errors/utils';

export class PublicDecryptionProof {
  // numSigners + KMS signatures + extraData
  readonly #proof: BytesHex;
  readonly #orderedHandles: readonly FhevmHandle[];
  readonly #orderedClearValues: readonly ClearValueType[];
  readonly #extraData: BytesHex;
  readonly #orderedAbiEncodedClearValues: BytesHex;

  private constructor(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedClearValues: readonly ClearValueType[];
    readonly proof: BytesHex;
    readonly extraData: BytesHex;
  }) {
    this.#proof = params.proof;
    this.#orderedClearValues = Object.freeze([...params.orderedClearValues]);
    this.#orderedHandles = Object.freeze([...params.orderedHandles]);
    this.#extraData = params.extraData;

    // once everything is setup, compute the abi data
    this.#orderedAbiEncodedClearValues =
      this._abiEncodeOrderedClearValues().abiEncodedClearValues;
  }

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

  public static from({
    orderedHandles,
    orderedDecryptedResult,
    signatures,
    extraData,
  }: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): PublicDecryptionProof {
    ////////////////////////////////////////////////////////////////////////////
    // Compute the proof as numSigners + KMS signatures + extraData
    ////////////////////////////////////////////////////////////////////////////

    const packedNumSigners = solidityPacked(['uint8'], [signatures.length]);

    const packedSignatures = solidityPacked(
      Array(signatures.length).fill('bytes'),
      signatures,
    );

    const proof: `0x${string}` = concat([
      packedNumSigners,
      packedSignatures,
      extraData,
    ]) as BytesHex;

    ////////////////////////////////////////////////////////////////////////////
    // Deserialize ordered decrypted result
    ////////////////////////////////////////////////////////////////////////////

    const orderedAbiTypes: SolidityPrimitiveTypeName[] = orderedHandles.map(
      (h) => h.solidityPrimitiveTypeName,
    );

    const coder = new AbiCoder();
    const decoded = coder.decode(orderedAbiTypes, orderedDecryptedResult);

    if (decoded.length !== orderedHandles.length) {
      throw new Error('Invalid decrypted result.');
    }

    const orderedClearValues = orderedHandles.map(
      (_, index) => decoded[index] as unknown as ClearValueType,
    );

    return new PublicDecryptionProof({
      orderedHandles,
      orderedClearValues,
      proof,
      extraData,
    });
  }

  private _abiEncodeOrderedClearValues(): {
    abiTypes: Array<'uint256'>;
    abiValues: Array<string | bigint>;
    abiEncodedClearValues: BytesHex;
  } {
    const abiTypes: Array<'uint256'> = [];
    const abiValues: Array<string | bigint> = [];

    for (let i = 0; i < this.#orderedHandles.length; ++i) {
      const handleType: FheTypeId = this.#orderedHandles[i].fheTypeId;

      let clearTextValue: ClearValueType = this.#orderedClearValues[i];
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
    const abiEncodedClearValues: BytesHex = abiCoder.encode(
      abiTypes,
      abiValues,
    ) as BytesHex;

    return {
      abiTypes,
      abiValues,
      abiEncodedClearValues,
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // PublicDecryptResults
  //////////////////////////////////////////////////////////////////////////////

  public toPublicDecryptResults(): PublicDecryptResults {
    const clearValues: Record<string, ClearValueType> = {};

    this.#orderedHandles.forEach(
      (fhevmHandle, idx) =>
        (clearValues[fhevmHandle.toBytes32Hex()] =
          this.#orderedClearValues[idx]),
    );

    Object.freeze(clearValues);

    return Object.freeze({
      clearValues,
      decryptionProof: this.#proof,
      abiEncodedClearValues: this.#orderedAbiEncodedClearValues,
    });
  }
}
