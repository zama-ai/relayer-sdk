import type { TkmsPrivateKey } from "../../types/tkms-p.js";
import type { KmsSigncryptedShares } from "../../types/kms.js";
import type { DecryptedFhevmHandle } from "../../types/decryptedFhevmHandle.js";
import type { Bytes, BytesHex } from "../../types/primitives.js";
import type { Prettify } from "../../types/utils.js";
import type { Logger } from "../../types/logger.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
export type TkmsModuleConfig = {
    readonly locateFile?: ((file: string) => URL) | undefined;
    readonly logger?: Logger | undefined;
};
export type InitTkmsModuleFunction = {
    initTkmsModule(): Promise<void>;
};
type WithTkmsPrivateKey = {
    readonly tkmsPrivateKey: TkmsPrivateKey;
};
type DecryptAndReconstructBaseParameters = {
    readonly shares: KmsSigncryptedShares;
};
export type DecryptAndReconstructParameters = WithTkmsPrivateKey & DecryptAndReconstructBaseParameters;
export type DecryptAndReconstructReturnType = readonly DecryptedFhevmHandle[];
export type DecryptAndReconstructModuleFunction = {
    decryptAndReconstruct(parameters: DecryptAndReconstructParameters): Promise<DecryptAndReconstructReturnType>;
};
export type DecryptAndReconstructUserParameters = DecryptAndReconstructBaseParameters;
export type DecryptAndReconstructUserModuleFunction = {
    decryptAndReconstruct(parameters: DecryptAndReconstructUserParameters): Promise<DecryptAndReconstructReturnType>;
};
export type GenerateTkmsPrivateKeyReturnType = TkmsPrivateKey;
export type GenerateTkmsPrivateKeyModuleFunction = {
    generateTkmsPrivateKey(): Promise<GenerateTkmsPrivateKeyReturnType>;
};
export type GetTkmsPublicKeyHexParameters = WithTkmsPrivateKey;
export type GetTkmsPublicKeyHexReturnType = BytesHex;
export type GetTkmsPublicKeyHexModuleFunction = {
    getTkmsPublicKeyHex(parameters: GetTkmsPublicKeyHexParameters): Promise<GetTkmsPublicKeyHexReturnType>;
};
export type GetTkmsPublicKeyHexUserModuleFunction = {
    getTkmsPublicKeyHex(): Promise<GetTkmsPublicKeyHexReturnType>;
};
export type SerializeTkmsPrivateKeyParameters = {
    readonly tkmsPrivateKey: TkmsPrivateKey;
};
export type SerializeTkmsPrivateKeyReturnType = Bytes;
export type SerializeTkmsPrivateKeyModuleFunction = {
    serializeTkmsPrivateKey(parameters: SerializeTkmsPrivateKeyParameters): Promise<SerializeTkmsPrivateKeyReturnType>;
};
export type SerializeTkmsPrivateKeyUserModuleFunction = {
    serializeTkmsPrivateKey(): Promise<SerializeTkmsPrivateKeyReturnType>;
};
export type DeserializeTkmsPrivateKeyParameters = {
    readonly tkmsPrivateKeyBytes: Bytes;
};
export type DeserializeTkmsPrivateKeyReturnType = TkmsPrivateKey;
export type DeserializeTkmsPrivateKeyModuleFunction = {
    deserializeTkmsPrivateKey(parameters: DeserializeTkmsPrivateKeyParameters): Promise<DeserializeTkmsPrivateKeyReturnType>;
};
export type VerifyTkmsPrivateKeyParameters = {
    readonly tkmsPrivateKey: TkmsPrivateKey;
};
export type VerifyTkmsPrivateKeyModuleFunction = {
    verifyTkmsPrivateKey(parameters: VerifyTkmsPrivateKeyParameters): void;
};
export type WithTkmsKeyModule = {
    readonly tkmsKey: TkmsKeyModule;
};
export type TkmsKeyModule = Prettify<InitTkmsModuleFunction & GenerateTkmsPrivateKeyModuleFunction & SerializeTkmsPrivateKeyModuleFunction & DeserializeTkmsPrivateKeyModuleFunction & VerifyTkmsPrivateKeyModuleFunction>;
export type TkmsKeyModuleFactory = (runtime: FhevmRuntime) => {
    readonly tkmsKey: TkmsKeyModule;
};
export type WithDecryptModule = {
    readonly decrypt: DecryptModule;
};
export type DecryptModule = Prettify<InitTkmsModuleFunction & DecryptAndReconstructModuleFunction & GetTkmsPublicKeyHexModuleFunction & SerializeTkmsPrivateKeyModuleFunction>;
export type DecryptModuleFactory = (runtime: FhevmRuntime) => {
    readonly decrypt: DecryptModule;
};
export type WithUserDecryptModule = {
    readonly userDecrypt: UserDecryptModule;
};
export type UserDecryptModuleParameters = {
    readonly privateKey: TkmsPrivateKey;
};
export type UserDecryptModule = Prettify<InitTkmsModuleFunction & DecryptAndReconstructUserModuleFunction & GetTkmsPublicKeyHexUserModuleFunction & SerializeTkmsPrivateKeyUserModuleFunction>;
export type UserDecryptModuleFactory = (runtime: FhevmRuntime, parameters: UserDecryptModuleParameters) => {
    readonly userDecrypt: UserDecryptModule;
};
export {};
//# sourceMappingURL=types.d.ts.map