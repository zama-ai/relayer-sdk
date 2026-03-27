import type { Bytes65Hex } from "../../types/primitives.js";
import type { KmsUserDecryptEIP712 } from "../../types/kms.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
import { asChecksummedAddress } from "../../base/address.js";

////////////////////////////////////////////////////////////////////////////////

/**
 * A signed decrypt permit — bundles an EIP-712 permit with its signature.
 *
 * This object can be reused across multiple decrypt operations without
 * re-signing, as long as the permit remains valid (within its time window
 * and for the specified contracts).
 *
 * The signer is the wallet address that signed the EIP-712 message.
 */
export type SignedPermit = Readonly<{
  /** The EIP-712 permit message and types */
  readonly permit: KmsUserDecryptEIP712;
  /** The EIP-65 signature (r, s, v) */
  readonly signature: Bytes65Hex;
  /** The wallet address that signed the permit */
  readonly signer: ChecksummedAddress;
}>;

////////////////////////////////////////////////////////////////////////////////

export type CreateSignedPermitReturnType = SignedPermit;

/**
 * Creates a signed decrypt permit by bundling an EIP-712 permit with its signature.
 *
 * This utility function packages a permit, signature, and signer address together
 * for reuse across multiple decrypt operations. The signed permit can be stored
 * and reused as long as it remains valid (within its time window).
 *
 * @param permit - The EIP-712 permit from createDecryptPermit()
 * @param signature - The EIP-65 signature from the user's wallet
 * @param signer - The wallet address that signed the permit
 * @returns A reusable SignedPermit object
 *
 * @example
 * ```ts
 * // Create and sign a permit
 * const permit = await client.createDecryptPermit({
 *   e2eTransportPublicKey: e2eTransportKeyPair.publicKey,
 *   contractAddresses: ["0x..."],
 *   startTimestamp: Math.floor(Date.now() / 1000),
 *   durationDays: 1,
 * });
 *
 * const signature = await signer.signTypedData(
 *   permit.domain,
 *   permit.types,
 *   permit.message,
 * );
 *
 * // Bundle into a reusable signed permit
 * const signedPermit = createSignedPermit(permit, signature, await signer.getAddress());
 *
 * // Reuse across multiple decrypt calls
 * await client.decrypt({ encryptedValues, e2eTransportKeyPair, signedPermit });
 * ```
 */
export function createSignedPermit(
  permit: KmsUserDecryptEIP712,
  signature: Bytes65Hex,
  signer: string,
): CreateSignedPermitReturnType {
  const signedPermit: SignedPermit = Object.freeze({
    permit,
    signature,
    signer: asChecksummedAddress(signer),
  });

  return signedPermit;
}
