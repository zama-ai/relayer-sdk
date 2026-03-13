import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { DecryptAndReconstructParameters, DecryptAndReconstructReturnType, DeserializeTkmsPrivateKeyParameters, DeserializeTkmsPrivateKeyReturnType, GenerateTkmsPrivateKeyReturnType, GetTkmsPublicKeyHexParameters, GetTkmsPublicKeyHexReturnType, SerializeTkmsPrivateKeyParameters, SerializeTkmsPrivateKeyReturnType, VerifyTkmsPrivateKeyParameters, DecryptModuleFactory, UserDecryptModuleFactory, TkmsKeyModuleFactory } from "./types.js";
export declare function decryptAndReconstruct(_runtime: FhevmRuntime, _parameters: DecryptAndReconstructParameters): Promise<DecryptAndReconstructReturnType>;
export declare function generateTkmsPrivateKey(_runtime: FhevmRuntime): Promise<GenerateTkmsPrivateKeyReturnType>;
export declare function getTkmsPublicKeyHex(_runtime: FhevmRuntime, _parameters: GetTkmsPublicKeyHexParameters): Promise<GetTkmsPublicKeyHexReturnType>;
export declare function serializeTkmsPrivateKey(_runtime: FhevmRuntime, _parameters: SerializeTkmsPrivateKeyParameters): Promise<SerializeTkmsPrivateKeyReturnType>;
export declare function deserializeTkmsPrivateKey(_runtime: FhevmRuntime, _parameters: DeserializeTkmsPrivateKeyParameters): Promise<DeserializeTkmsPrivateKeyReturnType>;
export declare function verifyTkmsPrivateKey(_runtime: FhevmRuntime, _parameters: VerifyTkmsPrivateKeyParameters): void;
export declare const tkmsKeyActions: TkmsKeyModuleFactory;
export declare const decryptActions: DecryptModuleFactory;
export declare const userDecryptActions: UserDecryptModuleFactory;
//# sourceMappingURL=mock.d.ts.map