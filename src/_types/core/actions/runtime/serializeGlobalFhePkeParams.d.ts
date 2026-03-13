import type { WithEncryptModule } from "../../modules/encrypt/types.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { FhevmRuntime, WithEncrypt } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import { type GlobalFhePkeParams, type GlobalFhePkeParamsBytes, type GlobalFhePkeParamsBytesHex } from "../../types/globalFhePkeParams.js";
export type SerializeGlobalFhePkeParamsParameters = GlobalFhePkeParams;
export type SerializeGlobalFhePkeParamsReturnType = GlobalFhePkeParamsBytes;
export declare function serializeGlobalFhePkeParams(fhevmRuntime: FhevmRuntime<WithEncryptModule>, parameters: SerializeGlobalFhePkeParamsParameters): Promise<SerializeGlobalFhePkeParamsReturnType>;
export type SerializeGlobalFhePkeParamsToHexParameters = GlobalFhePkeParams;
export type SerializeGlobalFhePkeParamsToHexReturnType = GlobalFhePkeParamsBytesHex;
export declare function serializeGlobalFhePkeParamsToHex(fhevm: Fhevm<FhevmChain | undefined, WithEncrypt, OptionalNativeClient>, parameters: SerializeGlobalFhePkeParamsToHexParameters): Promise<SerializeGlobalFhePkeParamsToHexReturnType>;
//# sourceMappingURL=serializeGlobalFhePkeParams.d.ts.map