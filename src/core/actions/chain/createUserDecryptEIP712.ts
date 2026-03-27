import type { FhevmChain } from "../../types/fhevmChain.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
import type {
  KmsUserDecryptEIP712,
  KmsDelegatedUserDecryptEIP712,
} from "../../types/kms.js";
import { createKmsUserDecryptEIP712 } from "../../kms/createKmsUserDecryptEIP712.js";
import { createKmsDelegatedUserDecryptEIP712 } from "../../kms/createKmsDelegatedUserDecryptEIP712.js";
import { getExtraData } from "../host/getExtraData.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";

////////////////////////////////////////////////////////////////////////////////

export type CreateUserDecryptEIP712Parameters = {
  /**
   * The end-to-end transport public key for encrypted communication with the KMS.
   * This is the public key from the key pair generated via generateE2eTransportKeyPair().
   */
  readonly e2eTransportPublicKey: string;
  readonly contractAddresses: readonly string[];
  readonly startTimestamp: number;
  readonly durationDays: number;
  /** Optional extraData for KMS context. If not provided, fetched automatically via getExtraData(). */
  readonly extraData?: string | undefined;
  /**
   * Optional address to decrypt on behalf of (delegated decrypt).
   *
   * When provided, creates a delegated decrypt permit that allows the signer
   * to decrypt values on behalf of another account. This is useful for:
   * - Backend services decrypting on behalf of users
   * - Multi-party computation scenarios
   * - Delegated access patterns
   *
   * When omitted, creates a standard user decrypt permit.
   */
  readonly onBehalfOf?: string | undefined;
};
export type CreateUserDecryptEIP712ReturnType =
  | KmsUserDecryptEIP712
  | KmsDelegatedUserDecryptEIP712;

/**
 * Creates an EIP-712 user decryption permit.
 *
 * This function is now async and automatically fetches extraData if not provided.
 * Supports both standard and delegated decrypt modes via the optional `onBehalfOf` parameter.
 *
 * @param fhevm - The FHEVM client
 * @param parameters - Permit parameters
 * @returns EIP-712 typed data for user to sign
 *
 * @example Standard decrypt permit
 * ```ts
 * const permit = await createUserDecryptEIP712(client, {
 *   e2eTransportPublicKey: e2eTransportKeyPair.publicKey,
 *   contractAddresses: ["0x..."],
 *   startTimestamp: Math.floor(Date.now() / 1000),
 *   durationDays: 7,
 * });
 * ```
 *
 * @example Delegated decrypt permit
 * ```ts
 * const permit = await createUserDecryptEIP712(client, {
 *   e2eTransportPublicKey: e2eTransportKeyPair.publicKey,
 *   contractAddresses: ["0x..."],
 *   startTimestamp: Math.floor(Date.now() / 1000),
 *   durationDays: 7,
 *   onBehalfOf: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 * });
 * ```
 */
export function createUserDecryptEIP712(
  fhevm: Fhevm<FhevmChain>,
  parameters: CreateUserDecryptEIP712Parameters,
): CreateUserDecryptEIP712ReturnType {
  // Fetch extraData if not provided
  const extraData =
    parameters.extraData ?? getExtraData(fhevm, {});

  const baseParams = {
    verifyingContractAddressDecryption: fhevm.chain.fhevm.gateway.contracts
      .decryption.address as ChecksummedAddress,
    chainId: fhevm.chain.id,
    contractAddresses: parameters.contractAddresses,
    durationDays: parameters.durationDays,
    startTimestamp: parameters.startTimestamp,
    extraData: extraData,
    publicKey: parameters.e2eTransportPublicKey,
  };

  // Delegated mode: create permit with onBehalfOf address
  if (parameters.onBehalfOf !== undefined) {
    return createKmsDelegatedUserDecryptEIP712({
      ...baseParams,
      delegatedAccount: parameters.onBehalfOf,
    });
  }

  // Standard mode: create regular user decrypt permit
  return createKmsUserDecryptEIP712(baseParams);
}

////////////////////////////////////////////////////////////////////////////////
