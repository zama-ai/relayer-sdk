import type { BuildWithProofPackedReturnTypeParameters, BuildWithProofPackedReturnType, ParseTFHEProvenCompactCiphertextListParameters, ParseTFHEProvenCompactCiphertextListReturnType, SerializeGlobalFheCrsParameters, SerializeGlobalFheCrsReturnType, SerializeGlobalFhePkeParamsParameters, SerializeGlobalFhePkeParamsReturnType, SerializeGlobalFhePublicKeyParameters, SerializeGlobalFhePublicKeyReturnType, DeserializeGlobalFheCrsParameters, DeserializeGlobalFheCrsReturnType, DeserializeGlobalFhePublicKeyParameters, DeserializeGlobalFhePublicKeyReturnType } from "../types.js";
import type { FhevmRuntime } from "../../../types/coreFhevmRuntime.js";
export declare const SERIALIZED_SIZE_LIMIT_CIPHERTEXT: bigint;
export declare const SERIALIZED_SIZE_LIMIT_PK: bigint;
export declare const SERIALIZED_SIZE_LIMIT_CRS: bigint;
export declare function parseTFHEProvenCompactCiphertextList(runtime: FhevmRuntime, parameters: ParseTFHEProvenCompactCiphertextListParameters): Promise<ParseTFHEProvenCompactCiphertextListReturnType>;
export declare function buildWithProofPacked(runtime: FhevmRuntime, parameters: BuildWithProofPackedReturnTypeParameters): Promise<BuildWithProofPackedReturnType>;
export declare function serializeGlobalFhePkeParams(runtime: FhevmRuntime, parameters: SerializeGlobalFhePkeParamsParameters): Promise<SerializeGlobalFhePkeParamsReturnType>;
export declare function serializeGlobalFhePublicKey(runtime: FhevmRuntime, parameters: SerializeGlobalFhePublicKeyParameters): Promise<SerializeGlobalFhePublicKeyReturnType>;
export declare function serializeGlobalFheCrs(runtime: FhevmRuntime, parameters: SerializeGlobalFheCrsParameters): Promise<SerializeGlobalFheCrsReturnType>;
export declare function deserializeGlobalFheCrs(runtime: FhevmRuntime, parameters: DeserializeGlobalFheCrsParameters): Promise<DeserializeGlobalFheCrsReturnType>;
export declare function deserializeGlobalFhePublicKey(runtime: FhevmRuntime, parameters: DeserializeGlobalFhePublicKeyParameters): Promise<DeserializeGlobalFhePublicKeyReturnType>;
//# sourceMappingURL=api-p.d.ts.map