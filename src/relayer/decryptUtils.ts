import { FhevmHandle } from '@sdk/FhevmHandle';

export function check2048EncryptedBits(handles: `0x${string}`[]) {
  let total = 0;

  for (const handle of handles) {
    const fhevmHandle = FhevmHandle.fromBytes32Hex(handle);
    total += fhevmHandle.encryptionBits;

    // enforce 2048‑bit limit
    if (total > 2048) {
      throw new Error(
        'Cannot decrypt more than 2048 encrypted bits in a single request',
      );
    }
  }
  return total;
}

export function fhevmHandleCheck2048EncryptedBits(fhevmHandles: FhevmHandle[]) {
  let total = 0;

  for (const fhevmHandle of fhevmHandles) {
    total += fhevmHandle.encryptionBits;

    // enforce 2048‑bit limit
    if (total > 2048) {
      throw new Error(
        'Cannot decrypt more than 2048 encrypted bits in a single request',
      );
    }
  }
  return total;
}
