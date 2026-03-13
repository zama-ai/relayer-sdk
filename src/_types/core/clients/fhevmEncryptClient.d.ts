import type { WithEncryptAndRelayer } from "../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import { type EncryptActions } from "./decorators/encrypt.js";
import { type CreateCoreFhevmParameters } from "../runtime/CoreFhevm-p.js";
import { type GlobalFhePkeActions } from "./decorators/globalFhePke.js";
import type { Fhevm, NativeClient } from "../types/coreFhevmClient.js";
export type FhevmEncryptClient<chain extends FhevmChain = FhevmChain, runtime extends WithEncryptAndRelayer = WithEncryptAndRelayer, client extends NativeClient = NativeClient> = Fhevm<chain, runtime, client> & EncryptActions & GlobalFhePkeActions;
export declare function createFhevmEncryptClient<chain extends FhevmChain = FhevmChain, runtime extends WithEncryptAndRelayer = WithEncryptAndRelayer, client extends NativeClient = NativeClient>(ownerToken: symbol, parameters: CreateCoreFhevmParameters<chain, runtime, client>): FhevmEncryptClient<chain, runtime, client>;
//# sourceMappingURL=fhevmEncryptClient.d.ts.map