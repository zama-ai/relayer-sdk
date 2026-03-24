import type { WithAll } from "../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import type { EncryptActions } from "./decorators/encrypt.js";
import type { GlobalFhePkeActions } from "./decorators/globalFhePke.js";
import type { DecryptActions } from "./decorators/decrypt.js";
import type { Fhevm, NativeClient } from "../types/coreFhevmClient.js";

export type FhevmClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends WithAll = WithAll,
  client extends NativeClient = NativeClient,
> = Fhevm<chain, runtime, client> &
  DecryptActions &
  EncryptActions &
  GlobalFhePkeActions;
