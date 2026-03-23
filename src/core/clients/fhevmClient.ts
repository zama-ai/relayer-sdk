import type {
  FhevmRuntime,
  WithAll,
  WithDecrypt,
  WithEncrypt,
} from "../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import type { EncryptActions } from "./decorators/encrypt.js";
import type { GlobalFhePkeActions } from "./decorators/globalFhePke.js";
import type { DecryptActions } from "./decorators/decrypt.js";
import type {
  Fhevm,
  NativeClient,
  OptionalNativeClient,
} from "../types/coreFhevmClient.js";
import { asFhevmRuntimeWith } from "../runtime/CoreFhevmRuntime-p.js";

export type FhevmClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends WithAll = WithAll,
  client extends NativeClient = NativeClient,
> = Fhevm<chain, runtime, client> &
  DecryptActions &
  EncryptActions &
  GlobalFhePkeActions;

/**
 * @internal
 */
export function asFhevmClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends FhevmRuntime = FhevmRuntime,
  client extends OptionalNativeClient = NativeClient,
>(
  fhevm: Fhevm<chain, runtime, client>,
): Fhevm<chain, runtime & WithAll, client> {
  asFhevmRuntimeWith(fhevm.runtime, "encrypt");
  asFhevmRuntimeWith(fhevm.runtime, "decrypt");
  // Deploy WithAll to raise an error if WithAll definition is changing
  return fhevm as Fhevm<chain, runtime & WithEncrypt & WithDecrypt, client>;
}
