import type { WithEncrypt } from "../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import type { EncryptActions } from "./decorators/encrypt.js";
import type { GlobalFhePkeActions } from "./decorators/globalFhePke.js";
import type { Fhevm, NativeClient } from "../types/coreFhevmClient.js";

export type FhevmEncryptClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends WithEncrypt = WithEncrypt,
  client extends NativeClient = NativeClient,
> = Fhevm<chain, runtime, client> & EncryptActions & GlobalFhePkeActions;
