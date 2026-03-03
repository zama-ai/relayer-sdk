import type {
  Bytes21Hex,
  Bytes32Hex,
  ChecksummedAddress,
  EncryptionBits,
  FheTypeId,
  Uint64,
} from '@base/types/primitives';
import { FhevmHandle } from '@sdk/FhevmHandle';
import { keccak256, AbiCoder } from 'ethers';
import { checksummedAddressToBytes20 } from '@base/address';
import { concatBytes, hexToBytes } from '@base/bytes';
import { uint64ToBytes32 } from '@base/uint';
import { fheTypeIdFromEncryptionBits } from '@sdk/FheType';

/**
 * Builds a deterministic "fake ciphertext" from plaintext values.
 * The encoding is: "CLEARTEXT" marker + ABI-encoded uint256 values.
 * This produces the same blob hash for the same inputs, ensuring
 * deterministic handle generation.
 */
function buildFakeCiphertext(values: bigint[]): Uint8Array {
  const marker = new TextEncoder().encode('CLEARTEXT');
  const abiCoder = AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(
    values.map(() => 'uint256'),
    values,
  );
  return concatBytes(marker, hexToBytes(encoded));
}

/**
 * Compute handle hash21 using the same algorithm as production:
 *   hash21 = keccak256("ZK-w_hdl" + blobHash + index + aclAddr + chainId)[0:21]
 */
function computeInputHash21(
  blobHashBytes32Hex: Bytes32Hex,
  aclAddress: ChecksummedAddress,
  chainId: Uint64,
  index: number,
): Bytes21Hex {
  const encoder = new TextEncoder();
  const domainSepBytes = encoder.encode(
    FhevmHandle.HANDLE_HASH_DOMAIN_SEPARATOR,
  );
  const indexByte = new Uint8Array([index]);
  const aclBytes20 = checksummedAddressToBytes20(aclAddress);
  const chainIdBytes32 = uint64ToBytes32(BigInt(chainId));

  const hashHex = keccak256(
    concatBytes(
      domainSepBytes,
      hexToBytes(blobHashBytes32Hex),
      indexByte,
      aclBytes20,
      chainIdBytes32,
    ),
  ) as Bytes32Hex;

  // Truncate to 21 bytes (0x + 42 hex chars)
  return hashHex.slice(0, 2 + 2 * 21) as Bytes21Hex;
}

/**
 * Generates deterministic FhevmHandles from plaintext values.
 * Uses the same domain separators as production (ZK-w_rct, ZK-w_hdl)
 * but with a cleartext-encoded "ciphertext".
 */
export function computeCleartextHandles(params: {
  values: bigint[];
  encryptionBits: EncryptionBits[];
  aclContractAddress: ChecksummedAddress;
  chainId: Uint64;
}): { handles: FhevmHandle[]; fakeCiphertext: Uint8Array } {
  const { values, encryptionBits, aclContractAddress, chainId } = params;

  if (values.length !== encryptionBits.length) {
    throw new Error('values and encryptionBits must have the same length');
  }

  const fakeCiphertext = buildFakeCiphertext(values);

  // blobHash = keccak256("ZK-w_rct" + ciphertext)
  const domainSep = new TextEncoder().encode(
    FhevmHandle.RAW_CT_HASH_DOMAIN_SEPARATOR,
  );
  const blobHashHex = keccak256(
    concatBytes(domainSep, fakeCiphertext),
  ) as Bytes32Hex;

  const handles: FhevmHandle[] = [];
  for (let i = 0; i < values.length; i++) {
    const fheTypeId: FheTypeId = fheTypeIdFromEncryptionBits(encryptionBits[i]);
    const hash21 = computeInputHash21(
      blobHashHex,
      aclContractAddress,
      chainId,
      i,
    );

    handles.push(
      FhevmHandle.fromComponents({
        hash21,
        chainId,
        fheTypeId,
        version: FhevmHandle.CURRENT_CIPHERTEXT_VERSION,
        computed: false,
        index: i,
      }),
    );
  }

  return { handles, fakeCiphertext };
}
