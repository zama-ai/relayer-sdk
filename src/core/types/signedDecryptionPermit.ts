import type {
  KmsDelegatedUserDecryptEIP712,
  KmsUserDecryptEIP712,
} from "./kms.js";
import type { Bytes65Hex, BytesHex, ChecksummedAddress } from "./primitives.js";

/**
 * A signed EIP-712 authorization that allows the signer's ephemeral key
 * to request decryption of the signer's own FHE handles from the KMS.
 *
 * Created once, serializable, and reusable across multiple decrypt calls.
 */
export type SignedDecryptionPermitBase = {
  /** The EIP-712 signature. */
  readonly signature: Bytes65Hex;
  /** The account that signed the permit. */
  readonly signerAddress: ChecksummedAddress;
  /**
   * The account whose encrypted values can be decrypted.
   * - Self permit: equals `signerAddress` (the signer decrypts their own values).
   *   e.g. Alice (`signerAddress` = `userAddress`) decrypts her own encrypted values.
   * - Delegated permit: differs from `signerAddress` (the signer decrypts on behalf of this account).
   *   e.g. Alice (`signerAddress`) can decrypt Bob's (`userAddress`) encrypted values.
   */
  readonly userAddress: ChecksummedAddress;
  /** The E2E transport public key embedded in the EIP-712 message. */
  readonly e2eTransportPublicKey: BytesHex;

  /** @throws If the permit has expired based on `startTimestamp` + `durationDays`. */
  assertNotExpired(): void;
};

export type SignedSelfDecryptionPermit = SignedDecryptionPermitBase & {
  readonly eip712: KmsUserDecryptEIP712;
  /** Always `false` for non-delegated permits. `userAddress === signerAddress`. */
  readonly isDelegated: false;
};

export type SignedDelegatedDecryptionPermit = SignedDecryptionPermitBase & {
  readonly eip712: KmsDelegatedUserDecryptEIP712;
  /** Always `true` for delegated permits. `userAddress` is the delegated account. (see `SenderCannotBeDelegate` is ACL.sol) */
  readonly isDelegated: true;
};

export type SignedDecryptionPermit =
  | SignedSelfDecryptionPermit
  | SignedDelegatedDecryptionPermit;
