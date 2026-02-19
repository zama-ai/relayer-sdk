import { TFHE as TFHEModule } from './wasm-modules';
import type { EncryptionBits, FheTypeId } from '@fhevm-base/types/public-api';
import type { ProvenCompactCiphertextListWasmType } from './public-api';
import { hexToBytesFaster } from '@base/bytes';
import { encryptionBitsFromFheTypeId, isFheTypeId } from '@fhevm-base/FheType';
import { isNonEmptyString } from '@base/string';
import { getErrorMessage } from '@base/errors/utils';
import { SERIALIZED_SIZE_LIMIT_CIPHERTEXT } from './constants';
import { EncryptionError } from '../errors/EncryptionError';

////////////////////////////////////////////////////////////////////////////////
// TFHEProvenCompactCiphertextList
////////////////////////////////////////////////////////////////////////////////

export function parseTFHEProvenCompactCiphertextList(
  ciphertextWithZKProof: Uint8Array | string,
): { fheTypeIds: FheTypeId[]; encryptionBits: EncryptionBits[] } {
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

  const fheTypeIds: FheTypeId[] = [];

  try {
    const len = listWasm.len();

    for (let i = 0; i < len; ++i) {
      const v = listWasm.get_kind_of(i);
      if (!isFheTypeId(v)) {
        throw new EncryptionError({
          message: `Invalid FheTypeId: ${v}`,
        });
      }
      fheTypeIds.push(v);
    }

    return {
      fheTypeIds,
      encryptionBits: fheTypeIds.map(encryptionBitsFromFheTypeId),
    };
  } finally {
    listWasm.free();
  }
}
