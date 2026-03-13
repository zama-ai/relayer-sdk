import type { RelayerFetchOptions } from "../../modules/relayer/types.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { WithEncryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParamsBytes } from "../../types/globalFhePkeParams.js";
export type FetchGlobalFhePkeParamsBytesParameters = {
    readonly options?: RelayerFetchOptions;
    readonly ignoreCache?: boolean | undefined;
};
export type FetchGlobalFhePkeParamsBytesReturnType = GlobalFhePkeParamsBytes;
/**
 * Clears all entries from the GlobalFhePkeParams cache.
 */
export declare function clearGlobalFhePkeParamsCache(): void;
/**
 * Removes a specific relayer URL entry from the GlobalFhePkeParams cache.
 */
export declare function deleteGlobalFhePkeParamsCache(relayerUrl: string): boolean;
export declare function fetchGlobalFhePkeParamsBytes(fhevm: Fhevm<FhevmChain, WithEncryptAndRelayer, OptionalNativeClient>, parameters: FetchGlobalFhePkeParamsBytesParameters): Promise<FetchGlobalFhePkeParamsBytesReturnType>;
//# sourceMappingURL=fetchGlobalFhePkeParamsBytes.d.ts.map