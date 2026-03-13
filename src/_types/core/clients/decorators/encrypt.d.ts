import { type EncryptParameters, type EncryptReturnType } from "../../actions/encrypt/encrypt.js";
import { type FetchGlobalFhePkeParamsParameters, type FetchGlobalFhePkeParamsReturnType } from "../../actions/key/fetchGlobalFhePkeParams.js";
import { type FetchGlobalFhePkeParamsBytesParameters, type FetchGlobalFhePkeParamsBytesReturnType } from "../../actions/key/fetchGlobalFhePkeParamsBytes.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { WithEncryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
export type EncryptActions = {
    readonly encrypt: (parameters: EncryptParameters) => Promise<EncryptReturnType>;
    readonly fetchGlobalFhePkeParams: (parameters: FetchGlobalFhePkeParamsParameters) => Promise<FetchGlobalFhePkeParamsReturnType>;
    readonly fetchGlobalFhePkeParamsBytes: (parameters: FetchGlobalFhePkeParamsBytesParameters) => Promise<FetchGlobalFhePkeParamsBytesReturnType>;
};
export declare function encryptActions(fhevm: Fhevm<FhevmChain, WithEncryptAndRelayer>): EncryptActions;
//# sourceMappingURL=encrypt.d.ts.map