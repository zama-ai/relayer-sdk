import { type FetchGlobalFhePkeParamsParameters, type FetchGlobalFhePkeParamsReturnType } from "../../actions/key/fetchGlobalFhePkeParams.js";
import { type FetchGlobalFhePkeParamsBytesParameters, type FetchGlobalFhePkeParamsBytesReturnType } from "../../actions/key/fetchGlobalFhePkeParamsBytes.js";
import { type ResolveGlobalFhePkeParamsParameters, type ResolveGlobalFhePkeParamsReturnType } from "../../actions/key/resolveGlobalFhePkeParams.js";
import { type DeserializeGlobalFhePkeParamsFromHexParameters, type DeserializeGlobalFhePkeParamsFromHexReturnType } from "../../actions/runtime/deserializeGlobalFhePkeParams.js";
import { type SerializeGlobalFhePkeParamsToHexParameters, type SerializeGlobalFhePkeParamsToHexReturnType } from "../../actions/runtime/serializeGlobalFhePkeParams.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { WithEncryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
export type GlobalFhePkeActions = {
    readonly fetchGlobalFhePkeParams: (parameters: FetchGlobalFhePkeParamsParameters) => Promise<FetchGlobalFhePkeParamsReturnType>;
    readonly fetchGlobalFhePkeParamsBytes: (parameters: FetchGlobalFhePkeParamsBytesParameters) => Promise<FetchGlobalFhePkeParamsBytesReturnType>;
    readonly deserializeGlobalFhePkeParamsFromHex: (parameters: DeserializeGlobalFhePkeParamsFromHexParameters) => Promise<DeserializeGlobalFhePkeParamsFromHexReturnType>;
    readonly serializeGlobalFhePkeParamsToHex: (parameters: SerializeGlobalFhePkeParamsToHexParameters) => Promise<SerializeGlobalFhePkeParamsToHexReturnType>;
    readonly resolveGlobalFhePkeParams: (parameters: ResolveGlobalFhePkeParamsParameters) => Promise<ResolveGlobalFhePkeParamsReturnType>;
};
export declare function globalFhePkeActions(fhevm: Fhevm<FhevmChain, WithEncryptAndRelayer, OptionalNativeClient>): GlobalFhePkeActions;
//# sourceMappingURL=globalFhePke.d.ts.map