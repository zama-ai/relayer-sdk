import type {
  ChecksummedAddress,
  Uint64BigInt,
  Bytes,
  Bytes32Hex,
  Bytes32,
  Uint64,
  Bytes21Hex,
  Uint8Number,
} from '@base/types/primitives';
import type { EncryptionBits, FheTypeId } from '@fhevm-base/types/public-api';
import type { ZKProofLike, ZKProof } from '../types/public-api';
import type { FhevmHandle } from '@fhevm-base/index';
import type { FHELib } from '@fhevm-base/types/libs';
import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import {
  assertIsChecksummedAddress,
  checksummedAddressToBytes20,
} from '@base/address';
import {
  bytes32ToHex,
  bytesToHexLarge,
  concatBytes,
  hexToBytes32,
  toBytes,
} from '@base/bytes';
import {
  assertIsUint64,
  assertIsUint8,
  asUint64BigInt,
  uint64ToBytes32,
} from '@base/uint';
import { ZKProofError } from '../errors/ZKProofError';
import {
  assertIsEncryptionBitsArray,
  fheTypeIdFromEncryptionBits,
} from '@fhevm-base/FheType';
import { buildFhevmHandle } from '@fhevm-base/index';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { InvalidTypeError } from '@base/errors/InvalidTypeError';

////////////////////////////////////////////////////////////////////////////////
// ZKProof
////////////////////////////////////////////////////////////////////////////////

export const FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR = 'ZK-w_rct';
export const FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR = 'ZK-w_hdl';

/**
 * Module-scoped symbol used as the method key for origin verification.
 * Never exported — invisible to IDE autocomplete and external code.
 * @internal
 */
const GET_UNSAFE_RAW_BYTES_FUNC = Symbol('ZKProof.getUnsafeRawBytes');
const PRIVATE_ZKPROOF_TOKEN = Symbol('ZKProof.token');

class ZKProofImpl implements ZKProof {
  readonly #chainId: Uint64BigInt;
  readonly #aclContractAddress: ChecksummedAddress;
  readonly #contractAddress: ChecksummedAddress;
  readonly #userAddress: ChecksummedAddress;
  readonly #ciphertextWithZKProof: Bytes; // Never empty
  readonly #encryptionBits: readonly EncryptionBits[]; // Can be empty
  readonly #fheTypeIds: readonly FheTypeId[]; // Can be empty
  #fhevmHandles: FhevmHandle[] | undefined;

  constructor(params: {
    readonly chainId: Uint64BigInt;
    readonly aclContractAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
    readonly userAddress: ChecksummedAddress;
    readonly ciphertextWithZKProof: Bytes;
    readonly encryptionBits: readonly EncryptionBits[];
  }) {
    this.#chainId = params.chainId;
    this.#aclContractAddress = params.aclContractAddress;
    this.#contractAddress = params.contractAddress;
    this.#userAddress = params.userAddress;
    this.#ciphertextWithZKProof = params.ciphertextWithZKProof;
    this.#encryptionBits = Object.freeze([...params.encryptionBits]);
    this.#fheTypeIds = Object.freeze(
      this.#encryptionBits.map(fheTypeIdFromEncryptionBits),
    );
    Object.freeze(this);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Instance Getters
  //////////////////////////////////////////////////////////////////////////////

  /** The chain ID where this proof is valid. */
  public get chainId(): Uint64BigInt {
    return this.#chainId;
  }

  /** The ACL contract address associated with this proof. */
  public get aclContractAddress(): ChecksummedAddress {
    return this.#aclContractAddress;
  }

  /** The target contract address associated with this proof. */
  public get contractAddress(): ChecksummedAddress {
    return this.#contractAddress;
  }

  /** The user address associated with this proof. */
  public get userAddress(): ChecksummedAddress {
    return this.#userAddress;
  }

  /** The ciphertext with ZK proof (guaranteed non-empty). Returns a copy. */
  public get ciphertextWithZKProof(): Bytes {
    return new Uint8Array(this.#ciphertextWithZKProof) as Bytes;
  }

  /** The encryption bit sizes for each encrypted value in the proof. */
  public get encryptionBits(): readonly EncryptionBits[] {
    return this.#encryptionBits;
  }

  /** The FHE type IDs corresponding to each encrypted value. */
  public get fheTypeIds(): readonly FheTypeId[] {
    return this.#fheTypeIds;
  }

  /**
   * Returns the raw internal bytes without copying.
   * WARNING: Do not mutate the returned array - this would violate immutability.
   * Use `ciphertextWithZKProof` getter if you need a safe copy.
   */
  public [GET_UNSAFE_RAW_BYTES_FUNC](token: symbol): Bytes {
    if (token !== PRIVATE_ZKPROOF_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#ciphertextWithZKProof;
  }

  /**
   * Returns a safe string representation for debugging.
   * Does not expose ciphertext content - only metadata.
   */
  public toString(): string {
    return `ZKProof(chainId=${String(this.#chainId)}, contract=${this.#contractAddress}, user=${this.#userAddress}, types=${this.#fheTypeIds.length}, bytes=${String(this.#ciphertextWithZKProof.length)})`;
  }

  public getFhevmHandles(): readonly FhevmHandle[] {
    if (this.#fhevmHandles === undefined) {
      this.#fhevmHandles = _zkProofToFhevmHandles({
        ciphertextWithZKProof: this.#ciphertextWithZKProof,
        aclContractAddress: this.#aclContractAddress,
        fheTypeIds: this.#fheTypeIds,
        chainId: this.#chainId,
      });
      Object.freeze(this.#fhevmHandles);
    }
    return this.#fhevmHandles;
  }

  //////////////////////////////////////////////////////////////////////////////
  // JSON
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Serializes the ZKProof to a JSON-compatible object.
   * Ciphertext is hex-encoded, chainId is converted to number if safe.
   * @returns A plain object suitable for JSON.stringify.
   */
  public toJSON(): Omit<ZKProofLike, 'encryptionBits'> & {
    fheTypeIds: readonly FheTypeId[];
    encryptionBits: readonly EncryptionBits[];
  } {
    return {
      chainId:
        this.#chainId <= Number.MAX_SAFE_INTEGER
          ? Number(this.#chainId)
          : this.#chainId,
      aclContractAddress: this.#aclContractAddress,
      contractAddress: this.#contractAddress,
      userAddress: this.#userAddress,
      ciphertextWithZKProof: bytesToHexLarge(this.#ciphertextWithZKProof),
      encryptionBits: this.#encryptionBits,
      fheTypeIds: this.#fheTypeIds,
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// Freeze
////////////////////////////////////////////////////////////////////////////////

Object.freeze(ZKProofImpl);
Object.freeze(ZKProofImpl.prototype);

////////////////////////////////////////////////////////////////////////////////
// Public API: createZKProof
////////////////////////////////////////////////////////////////////////////////

export function isZKProof(value: unknown): value is ZKProof {
  return value instanceof ZKProofImpl;
}

export function assertIsZKProof(
  value: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts value is ZKProof {
  if (!isZKProof(value)) {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof value,
        expectedType: 'Custom',
        expectedCustomType: 'ZKProof',
      },
      options,
    );
  }
}

/**
 * @internal
 * Creates a ZKProof from loose input types.
 * Validates and normalizes all fields.
 *
 * If `ciphertextWithZKProof` is a hex string, it will be converted to a new Uint8Array.
 * If it is already a Uint8Array:
 * - By default, a defensive copy is made, allowing the caller to retain the original.
 * - With `noCopy: true`, the instance takes ownership — callers must not mutate it afterward.
 * @param zkProofLike - The loose input to validate and normalize (see {@link ZKProofLike}).
 * @param options - Optional settings. Set `options.copy` to `false` to skip copying the
 *   `ciphertextWithZKProof` Uint8Array (takes ownership). Defaults to `true` (copy by default).
 * @throws A {@link ZKProofError} if ciphertextWithZKProof is invalid or empty.
 * @throws A {@link InvalidTypeError} if any field fails validation.
 */
export function createZKProofInternal(
  zkProofLike: ZKProofLike,
  options?: {
    readonly fheLib?: FHELib;
    readonly copy?: boolean;
  },
): ZKProof {
  if (zkProofLike instanceof ZKProofImpl) {
    return zkProofLike;
  }

  // Validate arguments
  assertIsUint64(zkProofLike.chainId, {});
  const chainId = BigInt(zkProofLike.chainId) as Uint64BigInt;

  assertIsChecksummedAddress(zkProofLike.aclContractAddress, {});
  assertIsChecksummedAddress(zkProofLike.contractAddress, {});
  assertIsChecksummedAddress(zkProofLike.userAddress, {});

  // Validate and normalize ciphertextWithZKProof
  const ciphertextWithZKProof = toBytes(zkProofLike.ciphertextWithZKProof, {
    subject: 'ciphertextWithZKProof',
    copy: options?.copy !== false,
  });

  if (ciphertextWithZKProof.length === 0) {
    throw new ZKProofError({
      message: 'ciphertextWithZKProof argument should not be empty',
    });
  }

  // Validation of packed variable count and total bits is handled by
  // parseTFHEProvenCompactCiphertextList, which deserializes and validates
  // the ciphertext structure via the TFHE WASM module.
  const encryptionBits = _getOrParseEncryptionBits(
    zkProofLike.encryptionBits,
    ciphertextWithZKProof,
    options?.fheLib,
  );

  return new ZKProofImpl({
    chainId,
    aclContractAddress: zkProofLike.aclContractAddress,
    contractAddress: zkProofLike.contractAddress,
    userAddress: zkProofLike.userAddress,
    ciphertextWithZKProof,
    encryptionBits,
  });
}

////////////////////////////////////////////////////////////////////////////////
// Public API: zkProofToFhevmHandles
////////////////////////////////////////////////////////////////////////////////

export function zkProofToFhevmHandles(
  zkProofLike: ZKProofLike,
  options?: {
    readonly version?: number;
    readonly fheLib?: FHELib;
  },
): readonly FhevmHandle[] {
  if (zkProofLike instanceof ZKProofImpl) {
    return zkProofLike.getFhevmHandles();
  }

  assertIsChecksummedAddress(zkProofLike.aclContractAddress, {
    subject: 'aclContractAddress',
  });

  const encryptionBits = _getOrParseEncryptionBits(
    zkProofLike.encryptionBits,
    zkProofLike.ciphertextWithZKProof,
    options?.fheLib,
  );

  const ciphertextWithZKProof = toBytes(zkProofLike.ciphertextWithZKProof, {
    subject: 'ciphertextWithZKProof',
  });

  const fheTypeIds = encryptionBits.map((w) => fheTypeIdFromEncryptionBits(w));

  assertIsUint8(fheTypeIds.length, {});

  return _zkProofToFhevmHandles({
    ciphertextWithZKProof,
    aclContractAddress: zkProofLike.aclContractAddress,
    fheTypeIds,
    chainId: asUint64BigInt(zkProofLike.chainId, { subject: 'chainId' }),
  });
}

////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////

/**
 * Asserts that two encryption bits arrays are equal (same length and values).
 * @param actual - The actual encryption bits array.
 * @param expected - The expected encryption bits array.
 * @throws ZKProofError if there's a count or type mismatch.
 */
function _assertEncryptionBitsMatch(
  actual: readonly EncryptionBits[],
  expected: readonly EncryptionBits[],
): void {
  if (actual.length !== expected.length) {
    throw new ZKProofError({
      message: `Encryption count mismatch, expected ${expected.length}, got ${actual.length}.`,
    });
  }

  for (let i = 0; i < actual.length; ++i) {
    if (actual[i] !== expected[i]) {
      throw new ZKProofError({
        message: `Encryption type mismatch at index ${i}.`,
      });
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function _zkProofToFhevmHandles(
  args: {
    readonly ciphertextWithZKProof: Bytes;
    readonly aclContractAddress: ChecksummedAddress;
    readonly fheTypeIds: readonly FheTypeId[];
    readonly chainId: Uint64BigInt;
  },
  options?: {
    readonly version?: number;
  },
): FhevmHandle[] {
  const encoder = new TextEncoder();
  const domainSepBytes = encoder.encode(
    FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR,
  );

  const blobHashBytes32Hex: Bytes32Hex = bytes32ToHex(
    keccak_256(concatBytes(domainSepBytes, args.ciphertextWithZKProof)),
  );

  const handles: FhevmHandle[] = [];
  for (let i = 0; i < args.fheTypeIds.length; ++i) {
    const hash21 = _computeInputHash21(
      hexToBytes32(blobHashBytes32Hex),
      args.aclContractAddress,
      args.chainId,
      i,
    );

    handles.push(
      buildFhevmHandle({
        hash21,
        chainId: args.chainId,
        fheTypeId: args.fheTypeIds[i],
        ...(options?.version !== undefined ? { version: options.version } : {}),
        index: i as Uint8Number,
      }),
    );
  }

  return handles;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Returns the encryption bits from a ZKProofLike.
 * If `encryptionBits` is provided, validates and returns it.
 * Otherwise, parses the ciphertext to extract the encryption bits.
 */
function _getOrParseEncryptionBits(
  encryptionBits: readonly number[] | undefined,
  ciphertextWithZKProof: Uint8Array | string,
  fheLib?: FHELib,
): readonly EncryptionBits[] {
  // Case 1: encryptionBits provided — validate, and verify against parsed if possible
  if (encryptionBits != null) {
    assertIsEncryptionBitsArray(encryptionBits, {
      subject: 'encryptionBits',
    });

    if (fheLib != null) {
      const parsed = fheLib.parseTFHEProvenCompactCiphertextList(
        ciphertextWithZKProof,
      );
      _assertEncryptionBitsMatch(parsed.encryptionBits, encryptionBits);
    }

    return encryptionBits;
  }

  // Case 2: encryptionBits not provided — extract if parse function available
  if (fheLib != null) {
    const parsed = fheLib.parseTFHEProvenCompactCiphertextList(
      ciphertextWithZKProof,
    );
    return parsed.encryptionBits;
  }

  // Case 3: no encryptionBits and no way to extract them
  throw new ZKProofError({ message: 'Missing encryption bits' });
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Computes the 21-byte handle hash for an encrypted input.
 *
 * handle_hash = "ZK-w_hdl" (8 bytes) + blobHash (32 bytes) + index (1 byte) + aclAddress (20 bytes) + chainId (32 bytes)
 *
 * Reference implementation (Rust):
 * ```rust
 * const HANDLE_HASH_DOMAIN_SEPARATOR: [u8; 8] = *b"ZK-w_hdl";
 *
 * let mut handle_hash = Keccak256::new();
 * handle_hash.update(HANDLE_HASH_DOMAIN_SEPARATOR);
 * handle_hash.update(blob_hash);
 * handle_hash.update([ct_idx as u8]);
 * handle_hash.update(
 *     Address::from_str(&aux_data.acl_contract_address)
 *         .expect("valid acl_contract_address")
 *         .into_array(),
 * );
 * handle_hash.update(chain_id_bytes);
 * let mut handle = handle_hash.finalize().to_vec();
 * assert_eq!(handle.len(), 32);
 * ```
 *
 * @see https://github.com/zama-ai/fhevm/blob/8ffbd5906ab3d57af178e049930e3fc065c9d4b3/coprocessor/fhevm-engine/zkproof-worker/src/verifier.rs#L431
 * @internal
 */
function _computeInputHash21(
  blobHashBytes32: Bytes32,
  aclAddress: ChecksummedAddress,
  chainId: Uint64,
  index: number,
): Bytes21Hex {
  const encryptionIndexByte1 = new Uint8Array([index]);
  const aclContractAddressBytes20 = checksummedAddressToBytes20(aclAddress);
  const chainIdBytes32 = uint64ToBytes32(chainId);

  const encoder = new TextEncoder();
  const domainSepBytes = encoder.encode(FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR);

  const hashBytes32Hex = bytes32ToHex(
    keccak_256(
      concatBytes(
        domainSepBytes,
        blobHashBytes32,
        encryptionIndexByte1,
        aclContractAddressBytes20,
        chainIdBytes32,
      ),
    ),
  );

  // Truncate to 21 bytes (0x + 42 hex chars)
  return hashBytes32Hex.slice(0, 2 + 2 * 21) as Bytes21Hex;
}

/**
 * @internal
 */
export function zkProofGetUnsafeRawBytesInternal(zkProof: ZKProof): Bytes {
  if (!(zkProof instanceof ZKProofImpl)) {
    throw new Error('Unauthorized');
  }
  return zkProof[GET_UNSAFE_RAW_BYTES_FUNC](PRIVATE_ZKPROOF_TOKEN);
}
