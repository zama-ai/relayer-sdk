import type { UintNumber } from '@base/types/primitives';
import type { FhevmHandle } from '../types/public-api';

const MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT = 2048 as UintNumber;

/**
 * Asserts that the total encrypted bits across the given handles does not
 * exceed the maximum number of bits the KMS is able to decrypt in a single call.
 *
 * @param fhevmHandles - Handles to sum encrypted bits for
 * @returns The total encrypted bits across all handles
 * @throws {Error} If the total exceeds the limit
 */
export function assertKmsDecryptionBitLimit(
  fhevmHandles: readonly FhevmHandle[],
): UintNumber {
  let total: number = 0;

  for (const fhevmHandle of fhevmHandles) {
    total += fhevmHandle.encryptionBits;

    if (total > MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT) {
      throw new Error(
        `Cannot decrypt more than ${MAX_KMS_DECRYPT_DECRYPTION_BIT_LIMIT} encrypted bits in a single request`,
      );
    }
  }

  return total as UintNumber;
}
