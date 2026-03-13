import type { DecryptAndReconstructParameters, DecryptAndReconstructReturnType, DeserializeTkmsPrivateKeyParameters, DeserializeTkmsPrivateKeyReturnType, GenerateTkmsPrivateKeyReturnType, GetTkmsPublicKeyHexParameters, GetTkmsPublicKeyHexReturnType, SerializeTkmsPrivateKeyParameters, SerializeTkmsPrivateKeyReturnType, VerifyTkmsPrivateKeyParameters } from "../types.js";
import type { FhevmRuntime } from "../../../types/coreFhevmRuntime.js";
export declare function generateTkmsPrivateKey(runtime: FhevmRuntime): Promise<GenerateTkmsPrivateKeyReturnType>;
export declare function decryptAndReconstruct(runtime: FhevmRuntime, parameters: DecryptAndReconstructParameters): Promise<DecryptAndReconstructReturnType>;
export declare function getTkmsPublicKeyHex(runtime: FhevmRuntime, parameters: GetTkmsPublicKeyHexParameters): Promise<GetTkmsPublicKeyHexReturnType>;
export declare function serializeTkmsPrivateKey(runtime: FhevmRuntime, parameters: SerializeTkmsPrivateKeyParameters): Promise<SerializeTkmsPrivateKeyReturnType>;
export declare function deserializeTkmsPrivateKey(runtime: FhevmRuntime, parameters: DeserializeTkmsPrivateKeyParameters): Promise<DeserializeTkmsPrivateKeyReturnType>;
export declare function verifyTkmsPrivateKey(_runtime: FhevmRuntime, parameters: VerifyTkmsPrivateKeyParameters): void;
//# sourceMappingURL=api-p.d.ts.map