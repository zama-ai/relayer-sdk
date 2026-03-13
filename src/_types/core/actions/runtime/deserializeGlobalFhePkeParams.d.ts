import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { WithEncrypt } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParams, GlobalFhePkeParamsBytes, GlobalFhePkeParamsBytesHex } from "../../types/globalFhePkeParams.js";
export type DeserializeGlobalFhePkeParamsParameters = GlobalFhePkeParamsBytes;
export type DeserializeGlobalFhePkeParamsReturnType = GlobalFhePkeParams;
export declare function deserializeGlobalFhePkeParams(fhevm: Fhevm<FhevmChain | undefined, WithEncrypt, OptionalNativeClient>, parameters: DeserializeGlobalFhePkeParamsParameters): Promise<DeserializeGlobalFhePkeParamsReturnType>;
export type DeserializeGlobalFhePkeParamsFromHexParameters = GlobalFhePkeParamsBytesHex;
export type DeserializeGlobalFhePkeParamsFromHexReturnType = GlobalFhePkeParams;
export declare function deserializeGlobalFhePkeParamsFromHex(fhevm: Fhevm<FhevmChain | undefined, WithEncrypt, OptionalNativeClient>, parameters: DeserializeGlobalFhePkeParamsFromHexParameters): Promise<DeserializeGlobalFhePkeParamsFromHexReturnType>;
//# sourceMappingURL=deserializeGlobalFhePkeParams.d.ts.map