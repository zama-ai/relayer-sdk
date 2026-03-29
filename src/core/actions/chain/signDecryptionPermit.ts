import type {
  SignDecryptionPermitParameters,
  SignSelfDecryptionPermitParameters,
  SignDelegatedDecryptionPermitParameters,
} from "../../kms/SignedDecryptionPermit-p.js";
import { signDecryptionPermit as signDecryptionPermit_ } from "../../kms/SignedDecryptionPermit-p.js";
import type {
  Fhevm,
  OptionalNativeClient,
} from "../../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type {
  SignedDecryptionPermit,
  SignedDelegatedDecryptionPermit,
  SignedSelfDecryptionPermit,
} from "../../types/signedDecryptionPermit.js";

export type {
  SignDecryptionPermitParameters,
  SignSelfDecryptionPermitParameters,
  SignDelegatedDecryptionPermitParameters,
};
export type SignDecryptionPermitReturnType = SignedDecryptionPermit;

export async function signDecryptionPermit(
  fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>,
  parameters: SignSelfDecryptionPermitParameters,
): Promise<SignedSelfDecryptionPermit>;
export async function signDecryptionPermit(
  fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>,
  parameters: SignDelegatedDecryptionPermitParameters,
): Promise<SignedDelegatedDecryptionPermit>;
export async function signDecryptionPermit(
  fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>,
  parameters: SignDecryptionPermitParameters,
): Promise<SignedDecryptionPermit> {
  // The public overloads guarantee the correct pairing.
  // The if/else narrows parameters via onBehalfOf, so TS can match each branch
  // to the correct overload of signDecryptionPermit_ without any casts.
  if (parameters.onBehalfOf !== undefined) {
    return signDecryptionPermit_(fhevm, parameters);
  }
  return signDecryptionPermit_(fhevm, parameters);
}
