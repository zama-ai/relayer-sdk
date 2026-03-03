import type {
  Bytes32Hex,
  ChecksummedAddress,
} from '@base/types/primitives';
import type {
  ClearValueType,
  HandleContractPair,
  PublicDecryptResults,
  UserDecryptResults,
} from '../types/relayer';
import { FhevmHandle } from '@sdk/FhevmHandle';
import { ACL } from '@sdk/ACL';
import { bytesToHex } from '@base/bytes';
import { getAddress, AbiCoder } from 'ethers';
import { CleartextExecutor } from './CleartextExecutor';

/**
 * Converts a raw bigint plaintext to the proper ClearValueType
 * based on the handle's FHE type discriminant.
 */
function formatPlaintext(value: bigint, fheTypeId: number): ClearValueType {
  switch (fheTypeId) {
    case 0: // ebool
      return value === 1n;
    case 7: // eaddress
      return getAddress(
        '0x' + value.toString(16).padStart(40, '0'),
      ) as `0x${string}`;
    case 2: // euint8
    case 3: // euint16
    case 4: // euint32
    case 5: // euint64
    case 6: // euint128
    case 8: // euint256
      return value;
    default:
      throw new Error(`Unsupported FHE type id: ${fheTypeId}`);
  }
}

/**
 * Public decryption in cleartext mode.
 * Checks ACL permissions, then reads plaintext values directly from
 * the CleartextFHEVMExecutor contract.
 */
export async function cleartextPublicDecrypt(
  handles: (Uint8Array | string)[],
  executor: CleartextExecutor,
  acl: ACL,
): Promise<PublicDecryptResults> {
  const fhevmHandles = handles.map(FhevmHandle.from);
  const handlesHex: Bytes32Hex[] = fhevmHandles.map((h) => h.toBytes32Hex());

  // Same ACL check as production — throws ACLPublicDecryptionError if any
  // handle lacks public decryption permission
  await acl.checkAllowedForDecryption(fhevmHandles);

  const rawValues = await executor.getPlaintexts(handlesHex);

  const clearValues: Record<`0x${string}`, ClearValueType> = {};
  fhevmHandles.forEach((handle, idx) => {
    clearValues[handle.toBytes32Hex()] = formatPlaintext(
      rawValues[idx],
      handle.fheTypeId,
    );
  });

  // Build dummy abiEncodedClearValues and decryptionProof
  const abiCoder = AbiCoder.defaultAbiCoder();
  const abiEncodedClearValues = abiCoder.encode(
    fhevmHandles.map(() => 'uint256'),
    rawValues,
  ) as `0x${string}`;

  return {
    clearValues,
    abiEncodedClearValues,
    decryptionProof: '0x00' as `0x${string}`,
  };
}

/**
 * User decryption in cleartext mode.
 * Checks ACL permissions (user + contract for each handle), then reads
 * plaintext values from chain. Skips TKMS/ML-KEM entirely.
 */
export async function cleartextUserDecrypt(
  handleContractPairs: HandleContractPair[],
  userAddress: ChecksummedAddress,
  executor: CleartextExecutor,
  acl: ACL,
): Promise<UserDecryptResults> {
  const fhevmHandles = handleContractPairs.map((h) => {
    if (typeof h.handle === 'string') {
      return FhevmHandle.from(h.handle);
    }
    return FhevmHandle.from(bytesToHex(h.handle));
  });

  // Same ACL check as production — verifies both user and contract have
  // persistAllowed permission, throws ACLUserDecryptionError on failure
  await acl.checkUserAllowedForDecryption({
    userAddress,
    handleContractPairs: handleContractPairs.map((pair, idx) => ({
      contractAddress: pair.contractAddress as ChecksummedAddress,
      handle: fhevmHandles[idx],
    })),
  });

  const handlesHex: Bytes32Hex[] = fhevmHandles.map((h) => h.toBytes32Hex());
  const rawValues = await executor.getPlaintexts(handlesHex);

  const results: Record<`0x${string}`, ClearValueType> = {};
  fhevmHandles.forEach((handle, idx) => {
    results[handle.toBytes32Hex()] = formatPlaintext(
      rawValues[idx],
      handle.fheTypeId,
    );
  });

  return results;
}
