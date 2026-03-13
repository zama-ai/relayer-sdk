import type { RelayerFetchOptions } from "../../modules/relayer/types.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { WithEncryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParams } from "../../types/globalFhePkeParams.js";
export type FetchGlobalFhePkeParamsParameters = {
    readonly options?: RelayerFetchOptions;
    readonly ignoreCache?: boolean | undefined;
};
export type FetchGlobalFhePkeParamsReturnType = GlobalFhePkeParams;
export declare function fetchGlobalFhePkeParams(fhevm: Fhevm<FhevmChain, WithEncryptAndRelayer, OptionalNativeClient>, parameters: FetchGlobalFhePkeParamsParameters): Promise<FetchGlobalFhePkeParamsReturnType>;
//# sourceMappingURL=fetchGlobalFhePkeParams.d.ts.map