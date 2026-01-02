import type {
  ChecksummedAddress,
  EncryptionBits,
  ZKProofLike,
  ZKProofType,
  Uint64BigInt,
  Bytes,
} from '@base/types/primitives';
import { assertIsChecksummedAddress } from '@base/address';
import { bytesToHexLarge, hexToBytesFaster, isBytes } from '@base/bytes';
import { assertIsUint64 } from '@base/uint';
import { ZKProofError } from '../errors/ZKProofError';
import { assertIsEncryptionBitsArray } from './FheType';

////////////////////////////////////////////////////////////////////////////////
// ZKProof
////////////////////////////////////////////////////////////////////////////////

export class ZKProof implements ZKProofType, ZKProofLike {
  readonly #chainId: Uint64BigInt;
  readonly #aclContractAddress: ChecksummedAddress;
  readonly #contractAddress: ChecksummedAddress;
  readonly #userAddress: ChecksummedAddress;
  readonly #ciphertextWithZKProof: Bytes; // Never empty
  readonly #encryptionBits: readonly EncryptionBits[]; // Can be empty

  private constructor(params: ZKProofType) {
    this.#chainId = params.chainId;
    this.#aclContractAddress = params.aclContractAddress;
    this.#contractAddress = params.contractAddress;
    this.#userAddress = params.userAddress;
    this.#ciphertextWithZKProof = params.ciphertextWithZKProof;
    this.#encryptionBits = Object.freeze([...params.encryptionBits]);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public get chainId(): Uint64BigInt {
    return this.#chainId;
  }

  public get aclContractAddress(): ChecksummedAddress {
    return this.#aclContractAddress;
  }

  public get contractAddress(): ChecksummedAddress {
    return this.#contractAddress;
  }

  public get userAddress(): ChecksummedAddress {
    return this.#userAddress;
  }

  /** The ciphertext with ZK proof (guaranteed non-empty). */
  public get ciphertextWithZKProof(): Bytes {
    if (this.#ciphertextWithZKProof.length === 0) {
      throw new ZKProofError({
        message:
          'Invalid ZKProof.ciphertextWithZKProof property. Uint8Array cannot be empty.',
      });
    }

    return this.#ciphertextWithZKProof;
  }

  public get encryptionBits(): readonly EncryptionBits[] {
    return this.#encryptionBits;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Static Factory Methods
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Creates a ZKProof from loose input types.
   * Validates and normalizes all fields.
   *
   * If `ciphertextWithZKProof` is a hex string, it will be converted to a new Uint8Array.
   * If it is already a Uint8Array:
   * - By default (`copy: false`), the instance takes ownership — callers must not mutate it afterward.
   * - With `copy: true`, a defensive copy is made, allowing the caller to retain the original.
   *
   * @param zkProofLike - The loose input to validate and normalize (see {@link ZKProofLike}).
   * @param options - Optional settings.
   * @param options.copy - If `true`, copies the `ciphertextWithZKProof` Uint8Array instead of
   *   taking ownership. Defaults to `false`.
   * @throws {ZKProofError} If ciphertextWithZKProof is invalid or empty.
   * @throws {InvalidTypeError} If any field fails validation.
   */
  public static fromComponents(
    zkProofLike: ZKProofLike,
    options?: { copy?: boolean },
  ): ZKProof {
    assertIsUint64(zkProofLike.chainId);
    const chainId = BigInt(zkProofLike.chainId);

    // Validate addresses
    assertIsChecksummedAddress(zkProofLike.aclContractAddress);
    assertIsChecksummedAddress(zkProofLike.contractAddress);
    assertIsChecksummedAddress(zkProofLike.userAddress);
    assertIsEncryptionBitsArray(
      zkProofLike.encryptionBits,
      'zkProofLike.encryptionBits',
    );

    // Validate and normalize ciphertextWithZKProof
    let ciphertextWithZKProof: Uint8Array;
    if (typeof zkProofLike.ciphertextWithZKProof === 'string') {
      ciphertextWithZKProof = hexToBytesFaster(
        zkProofLike.ciphertextWithZKProof,
        { strict: true },
      );
    } else if (isBytes(zkProofLike.ciphertextWithZKProof)) {
      if (options?.copy === true) {
        ciphertextWithZKProof = new Uint8Array(
          zkProofLike.ciphertextWithZKProof,
        );
      } else {
        ciphertextWithZKProof = zkProofLike.ciphertextWithZKProof;
      }
    } else {
      throw new ZKProofError({
        message: 'Invalid ciphertextWithZKProof argument',
      });
    }

    if (ciphertextWithZKProof.length === 0) {
      throw new ZKProofError({
        message: 'ciphertextWithZKProof argument should not be empty',
      });
    }

    return new ZKProof({
      chainId,
      aclContractAddress: zkProofLike.aclContractAddress,
      contractAddress: zkProofLike.contractAddress,
      userAddress: zkProofLike.userAddress,
      ciphertextWithZKProof,
      encryptionBits: zkProofLike.encryptionBits,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // JSON
  //////////////////////////////////////////////////////////////////////////////

  public toJSON(): ZKProofLike {
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
    };
  }
}
