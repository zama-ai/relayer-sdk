import { TFHE as TFHEModule } from './wasm-modules';
import type { EncryptionBits, FheTypeId } from '@base/types/primitives';
import type { ProvenCompactCiphertextListWasmType } from './public-api';
import { hexToBytesFaster } from '@base/bytes';
import { SERIALIZED_SIZE_LIMIT_CIPHERTEXT } from './constants';
import { encryptionBitsFromFheTypeId, isFheTypeId } from '@sdk/FheType';
import { EncryptionError } from '../../errors/EncryptionError';
import { isNonEmptyString } from '@base/string';
import { getErrorMessage } from '../../errors/utils';

export class TFHEProvenCompactCiphertextList {
  readonly #provenCompactCiphertextListWasm!: ProvenCompactCiphertextListWasmType;
  readonly #fheTypeIds: FheTypeId[];
  readonly #encryptionBits: EncryptionBits[];

  private constructor(params: {
    provenCompactCiphertextListWasm: ProvenCompactCiphertextListWasmType;
    fheTypeIds: FheTypeId[];
    encryptionBits: EncryptionBits[];
  }) {
    this.#provenCompactCiphertextListWasm =
      params.provenCompactCiphertextListWasm;
    this.#encryptionBits = params.encryptionBits;
    this.#fheTypeIds = params.fheTypeIds;

    Object.freeze(this.#fheTypeIds);
    Object.freeze(this.#encryptionBits);
  }

  public get tfheCompactPublicKeyWasm(): ProvenCompactCiphertextListWasmType {
    return this.#provenCompactCiphertextListWasm;
  }

  public get wasmClassName(): string {
    return this.#provenCompactCiphertextListWasm.constructor.name;
  }

  public get count(): number {
    return this.#fheTypeIds.length;
  }

  public get fheTypeIds(): readonly FheTypeId[] {
    return this.#fheTypeIds;
  }

  public get encryptionBits(): readonly EncryptionBits[] {
    return this.#encryptionBits;
  }

  public static fromCiphertextWithZKProof(
    ciphertextWithZKProof: Uint8Array | string,
  ): TFHEProvenCompactCiphertextList {
    if (
      (ciphertextWithZKProof as unknown) === undefined ||
      (ciphertextWithZKProof as unknown) === null
    ) {
      throw new EncryptionError({
        message: `ciphertextWithZKProof argument is null or undefined.`,
      });
    }
    if (
      !(ciphertextWithZKProof instanceof Uint8Array) &&
      !isNonEmptyString(ciphertextWithZKProof)
    ) {
      throw new EncryptionError({
        message: `Invalid ciphertextWithZKProof argument.`,
      });
    }

    const ciphertext: Uint8Array =
      typeof ciphertextWithZKProof === 'string'
        ? hexToBytesFaster(ciphertextWithZKProof, { strict: true })
        : ciphertextWithZKProof;

    let listWasm: ProvenCompactCiphertextListWasmType;
    try {
      listWasm = TFHEModule.ProvenCompactCiphertextList.safe_deserialize(
        ciphertext,
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      );
    } catch (e) {
      throw new EncryptionError({
        message: `Invalid ciphertextWithZKProof bytes. ${getErrorMessage(e)}.`,
      });
    }

    const len = listWasm.len();

    const fheTypeIds: FheTypeId[] = [];
    for (let i = 0; i < len; ++i) {
      const v = listWasm.get_kind_of(i);
      if (!isFheTypeId(v)) {
        throw new EncryptionError({
          message: `Invalid FheTypeId: ${v}`,
        });
      }
      fheTypeIds.push(v);
    }

    const l = new TFHEProvenCompactCiphertextList({
      provenCompactCiphertextListWasm: listWasm,
      encryptionBits: fheTypeIds.map(encryptionBitsFromFheTypeId),
      fheTypeIds,
    });

    return l;
  }
}
