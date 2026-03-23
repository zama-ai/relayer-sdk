import type { FhevmRuntime, WithEncrypt } from "../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import type { EncryptActions } from "./decorators/encrypt.js";
import type { GlobalFhePkeActions } from "./decorators/globalFhePke.js";
import type {
  Fhevm,
  NativeClient,
  OptionalNativeClient,
} from "../types/coreFhevmClient.js";
import { asFhevmRuntimeWith } from "../runtime/CoreFhevmRuntime-p.js";

export type FhevmEncryptClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends WithEncrypt = WithEncrypt,
  client extends NativeClient = NativeClient,
> = Fhevm<chain, runtime, client> & EncryptActions & GlobalFhePkeActions;

/**
 * @internal
 */
export function asFhevmEncryptClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends FhevmRuntime = FhevmRuntime,
  client extends OptionalNativeClient = NativeClient,
>(
  fhevm: Fhevm<chain, runtime, client>,
): Fhevm<chain, runtime & WithEncrypt, client> {
  asFhevmRuntimeWith(fhevm.runtime, "encrypt");
  return fhevm as Fhevm<chain, runtime & WithEncrypt, client>;
}
