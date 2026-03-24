import type { WithDecrypt } from "../types/coreFhevmRuntime.js";
import type { DecryptActions } from "./decorators/decrypt.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import type { Fhevm, NativeClient } from "../types/coreFhevmClient.js";

export type FhevmDecryptClient<
  chain extends FhevmChain = FhevmChain,
  runtime extends WithDecrypt = WithDecrypt,
  client extends NativeClient = NativeClient,
> = Fhevm<chain, runtime, client> & DecryptActions;
