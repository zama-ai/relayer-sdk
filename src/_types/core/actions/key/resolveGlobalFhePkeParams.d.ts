import type { RelayerFetchOptions } from "../../modules/relayer/types.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { WithEncryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParams, GlobalFhePkeParamsBytes } from "../../types/globalFhePkeParams.js";
export type ResolveGlobalFhePkeParamsParameters = {
    readonly globalFheParamsBytes?: GlobalFhePkeParamsBytes;
    readonly options?: RelayerFetchOptions;
    readonly ignoreCache?: boolean;
};
export type ResolveGlobalFhePkeParamsReturnType = GlobalFhePkeParams;
export declare function resolveGlobalFhePkeParams(fhevm: Fhevm<FhevmChain, WithEncryptAndRelayer, OptionalNativeClient>, parameters: ResolveGlobalFhePkeParamsParameters): Promise<ResolveGlobalFhePkeParamsReturnType>;
//# sourceMappingURL=resolveGlobalFhePkeParams.d.ts.map