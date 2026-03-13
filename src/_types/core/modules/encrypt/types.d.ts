import type { TypedValue } from "../../types/primitives.js";
import type { EncryptionBits, FheTypeId } from "../../types/fheType.js";
import type { GlobalFheCrs, GlobalFheCrsBytes, GlobalFhePkeParams, GlobalFhePkeParamsBytes, GlobalFhePublicKey, GlobalFhePublicKeyBytes } from "../../types/globalFhePkeParams.js";
import type { Prettify } from "../../types/utils.js";
import type { Logger } from "../../types/logger.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
export type TfheModuleConfig = {
    readonly singleThread?: boolean | undefined;
    readonly numberOfThreads?: number | undefined;
    readonly locateFile?: ((file: string) => URL) | undefined;
    readonly logger?: Logger | undefined;
};
export type InitTfheModuleFunction = {
    initTfheModule(): Promise<void>;
};
export type ParseTFHEProvenCompactCiphertextListParameters = {
    readonly ciphertextWithZkProof: Uint8Array | string;
};
export type ParseTFHEProvenCompactCiphertextListReturnType = {
    fheTypeIds: FheTypeId[];
    encryptionBits: EncryptionBits[];
};
export type ParseTFHEProvenCompactCiphertextListModuleFunction = {
    parseTFHEProvenCompactCiphertextList(parameters: ParseTFHEProvenCompactCiphertextListParameters): Promise<ParseTFHEProvenCompactCiphertextListReturnType>;
};
export type BuildWithProofPackedReturnTypeParameters = {
    readonly publicEncryptionParams: GlobalFhePkeParams;
    readonly typedValues: TypedValue[];
    readonly metaData: Uint8Array;
};
export type BuildWithProofPackedReturnType = Uint8Array;
export type BuildWithProofPackedModuleFunction = {
    buildWithProofPacked(parameters: BuildWithProofPackedReturnTypeParameters): Promise<BuildWithProofPackedReturnType>;
};
export type SerializeGlobalFhePkeParamsParameters = {
    readonly globalFhePkeParams: GlobalFhePkeParams;
};
export type SerializeGlobalFhePkeParamsReturnType = GlobalFhePkeParamsBytes;
export type SerializeGlobalFhePkeParamsModuleFunction = {
    serializeGlobalFhePkeParams(parameters: SerializeGlobalFhePkeParamsParameters): Promise<SerializeGlobalFhePkeParamsReturnType>;
};
export type SerializeGlobalFhePublicKeyParameters = {
    readonly globalFhePublicKey: GlobalFhePublicKey;
};
export type SerializeGlobalFhePublicKeyReturnType = GlobalFhePublicKeyBytes;
export type SerializeGlobalFhePublicKeyModuleFunction = {
    serializeGlobalFhePublicKey(parameters: SerializeGlobalFhePublicKeyParameters): Promise<SerializeGlobalFhePublicKeyReturnType>;
};
export type SerializeGlobalFheCrsParameters = {
    readonly globalFheCrs: GlobalFheCrs;
};
export type SerializeGlobalFheCrsReturnType = GlobalFheCrsBytes;
export type SerializeGlobalFheCrsModuleFunction = {
    serializeGlobalFheCrs(parameters: SerializeGlobalFheCrsParameters): Promise<SerializeGlobalFheCrsReturnType>;
};
export type DeserializeGlobalFhePublicKeyParameters = {
    readonly globalFhePublicKeyBytes: GlobalFhePublicKeyBytes;
};
export type DeserializeGlobalFhePublicKeyReturnType = GlobalFhePublicKey;
export type DeserializeGlobalFhePublicKeyModuleFunction = {
    deserializeGlobalFhePublicKey(parameters: DeserializeGlobalFhePublicKeyParameters): Promise<DeserializeGlobalFhePublicKeyReturnType>;
};
export type DeserializeGlobalFheCrsParameters = {
    readonly globalFheCrsBytes: GlobalFheCrsBytes;
};
export type DeserializeGlobalFheCrsReturnType = GlobalFheCrs;
export type DeserializeGlobalFheCrsModuleFunction = {
    deserializeGlobalFheCrs(parameters: DeserializeGlobalFheCrsParameters): Promise<DeserializeGlobalFheCrsReturnType>;
};
export type WithEncryptModule = {
    readonly encrypt: EncryptModule;
};
export type EncryptModule = Prettify<InitTfheModuleFunction & ParseTFHEProvenCompactCiphertextListModuleFunction & BuildWithProofPackedModuleFunction & SerializeGlobalFhePkeParamsModuleFunction & SerializeGlobalFhePublicKeyModuleFunction & SerializeGlobalFheCrsModuleFunction & DeserializeGlobalFhePublicKeyModuleFunction & DeserializeGlobalFheCrsModuleFunction>;
export type EncryptModuleFactory = (runtime: FhevmRuntime) => {
    readonly encrypt: EncryptModule;
};
//# sourceMappingURL=types.d.ts.map