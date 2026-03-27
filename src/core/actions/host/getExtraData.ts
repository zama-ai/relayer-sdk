import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { BytesHex } from "../../types/primitives.js";
import { asBytesHex } from "../../base/bytes.js";
import type { FhevmChain } from "../../types/fhevmChain.js";

////////////////////////////////////////////////////////////////////////////////
// getExtraData
//
// Returns the extraData bytes needed for KMS context in decrypt operations.
//
// Related:
// - Used in createDecryptPermit() for EIP-712 message
// - Used in encrypt() operations for coprocessor signing
////////////////////////////////////////////////////////////////////////////////

export type GetExtraDataParameters = Record<string, never>;

export type GetExtraDataReturnType = BytesHex;

/**
 * Gets the extraData bytes for KMS context.
 *
 * Current behavior: returns "0x00" (empty context for backward compatibility).
 *
 * @param fhevm - The FHEVM client
 * @param _parameters - Reserved for future use
 * @returns The extraData as a hex string
 */
export function getExtraData(
  _fhevm: Fhevm<FhevmChain>,
  _parameters: GetExtraDataParameters,
): GetExtraDataReturnType {
  return asBytesHex("0x00");
}
