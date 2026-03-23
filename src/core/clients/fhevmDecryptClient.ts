import type { FhevmRuntime, WithDecrypt } from "../types/coreFhevmRuntime.js";
import type { DecryptActions } from "./decorators/decrypt.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import type {
  Fhevm,
  NativeClient,
  OptionalNativeClient,
} from "../types/coreFhevmClient.js";
import { asFhevmRuntimeWith } from "../runtime/CoreFhevmRuntime-p.js";

export type FhevmDecryptClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends WithDecrypt = WithDecrypt,
  client extends NativeClient = NativeClient,
> = Fhevm<chain, runtime, client> & DecryptActions;

/**
 * @internal
 */
export function asFhevmDecryptClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends FhevmRuntime = FhevmRuntime,
  client extends OptionalNativeClient = NativeClient,
>(
  fhevm: Fhevm<chain, runtime, client>,
): Fhevm<chain, runtime & WithDecrypt, client> {
  asFhevmRuntimeWith(fhevm.runtime, "decrypt");
  return fhevm as Fhevm<chain, runtime & WithDecrypt, client>;
}
