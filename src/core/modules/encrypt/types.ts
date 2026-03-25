import type { TypedValue } from "../../types/primitives.js";
import type { EncryptionBits, FheTypeId } from "../../types/fheType.js";
import type {
  GlobalFheCrs,
  GlobalFheCrsBytes,
  GlobalFhePkeParams,
  GlobalFhePkeParamsBytes,
  GlobalFhePublicKey,
  GlobalFhePublicKeyBytes,
} from "../../types/globalFhePkeParams.js";
import type { Prettify } from "../../types/utils.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";

////////////////////////////////////////////////////////////////////////////////
//
// EncryptModule
//
////////////////////////////////////////////////////////////////////////////////

/*

WASM compilation (how to get WebAssembly.Module):

| wasmUrl   | Result                                                         |
|-----------|----------------------------------------------------------------|
| defined   | Compile from URL (isomorphicCompileWasm)                       |
| undefined | Compile from embedded base64 (isomorphicCompileWasmFromBase64) |

Worker creation (how to spawn thread pool workers):

| workerUrl | Result                                    |
|-----------|-------------------------------------------|
| defined   | Direct URL → fetch+blob → embedded base64 |
| undefined | Embedded base64 worker                    |

*/

////////////////////////////////////////////////////////////////////////////////
// initTfheModuleFunction
////////////////////////////////////////////////////////////////////////////////

export type InitTfheModuleFunction = {
  initTfheModule(): Promise<void>;
};

////////////////////////////////////////////////////////////////////////////////
// getTfheModuleInfoFunction
////////////////////////////////////////////////////////////////////////////////

/**
 * Information about the running TFHE module configuration.
 */
export type TfheModuleInfo = {
  /**
   * Number of WASM worker threads.
   * `0` means single-threaded mode.
   */
  readonly numberOfThreads: number;
  /**
   * URL used to fetch the TFHE WASM binary.
   * `undefined` means the base64-embedded fallback is used.
   */
  readonly wasmUrl: URL | undefined;
  /**
   * URL used to load the TFHE worker script.
   * `undefined` means the base64-embedded fallback is used.
   */
  readonly workerUrl: URL | undefined;
  /**
   * Whether the environment supports multi-threading.
   * - `undefined` — user explicitly requested single-threaded mode.
   * - `true` — multi-threading is supported and active.
   * - `false` — multi-threading was requested but unavailable; fell back to single-threaded.
   */
  readonly threadsAvailable: boolean | undefined;
};

export type GetTfheModuleInfoReturnType = TfheModuleInfo | undefined;

export type GetTfheModuleInfoFunction = {
  /**
   * Returns {@link TfheModuleInfo} when the module is initialized,
   * or `undefined` if the module has not completed initialization.
   */
  getTfheModuleInfo(): GetTfheModuleInfoReturnType;
};

////////////////////////////////////////////////////////////////////////////////
// 1. parseTFHEProvenCompactCiphertextList
////////////////////////////////////////////////////////////////////////////////

export type ParseTFHEProvenCompactCiphertextListParameters = {
  readonly ciphertextWithZkProof: Uint8Array | string;
};

export type ParseTFHEProvenCompactCiphertextListReturnType = {
  fheTypeIds: FheTypeId[];
  encryptionBits: EncryptionBits[];
};

export type ParseTFHEProvenCompactCiphertextListModuleFunction = {
  parseTFHEProvenCompactCiphertextList(
    parameters: ParseTFHEProvenCompactCiphertextListParameters,
  ): Promise<ParseTFHEProvenCompactCiphertextListReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 2. buildWithProofPacked
////////////////////////////////////////////////////////////////////////////////

export type BuildWithProofPackedReturnTypeParameters = {
  readonly publicEncryptionParams: GlobalFhePkeParams;
  readonly typedValues: TypedValue[];
  readonly metaData: Uint8Array;
};

export type BuildWithProofPackedReturnType = Uint8Array;

export type BuildWithProofPackedModuleFunction = {
  buildWithProofPacked(
    parameters: BuildWithProofPackedReturnTypeParameters,
  ): Promise<BuildWithProofPackedReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 3. serializeGlobalFhePkeParams
////////////////////////////////////////////////////////////////////////////////

export type SerializeGlobalFhePkeParamsParameters = {
  readonly globalFhePkeParams: GlobalFhePkeParams;
};

export type SerializeGlobalFhePkeParamsReturnType = GlobalFhePkeParamsBytes;

export type SerializeGlobalFhePkeParamsModuleFunction = {
  serializeGlobalFhePkeParams(
    parameters: SerializeGlobalFhePkeParamsParameters,
  ): Promise<SerializeGlobalFhePkeParamsReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 4. serializeGlobalFhePublicKey
////////////////////////////////////////////////////////////////////////////////

export type SerializeGlobalFhePublicKeyParameters = {
  readonly globalFhePublicKey: GlobalFhePublicKey;
};

export type SerializeGlobalFhePublicKeyReturnType = GlobalFhePublicKeyBytes;

export type SerializeGlobalFhePublicKeyModuleFunction = {
  serializeGlobalFhePublicKey(
    parameters: SerializeGlobalFhePublicKeyParameters,
  ): Promise<SerializeGlobalFhePublicKeyReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 5. serializeGlobalFheCrs
////////////////////////////////////////////////////////////////////////////////

export type SerializeGlobalFheCrsParameters = {
  readonly globalFheCrs: GlobalFheCrs;
};

export type SerializeGlobalFheCrsReturnType = GlobalFheCrsBytes;

export type SerializeGlobalFheCrsModuleFunction = {
  serializeGlobalFheCrs(
    parameters: SerializeGlobalFheCrsParameters,
  ): Promise<SerializeGlobalFheCrsReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 6. deserializeGlobalFhePublicKey
////////////////////////////////////////////////////////////////////////////////

export type DeserializeGlobalFhePublicKeyParameters = {
  readonly globalFhePublicKeyBytes: GlobalFhePublicKeyBytes;
};

export type DeserializeGlobalFhePublicKeyReturnType = GlobalFhePublicKey;

export type DeserializeGlobalFhePublicKeyModuleFunction = {
  deserializeGlobalFhePublicKey(
    parameters: DeserializeGlobalFhePublicKeyParameters,
  ): Promise<DeserializeGlobalFhePublicKeyReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 6. deserializeGlobalFheCrs
////////////////////////////////////////////////////////////////////////////////

export type DeserializeGlobalFheCrsParameters = {
  readonly globalFheCrsBytes: GlobalFheCrsBytes;
};

export type DeserializeGlobalFheCrsReturnType = GlobalFheCrs;

export type DeserializeGlobalFheCrsModuleFunction = {
  deserializeGlobalFheCrs(
    parameters: DeserializeGlobalFheCrsParameters,
  ): Promise<DeserializeGlobalFheCrsReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// EncryptModule
////////////////////////////////////////////////////////////////////////////////

export type WithEncryptModule = {
  readonly encrypt: EncryptModule;
};

export type EncryptModule = Prettify<
  InitTfheModuleFunction &
    GetTfheModuleInfoFunction &
    ParseTFHEProvenCompactCiphertextListModuleFunction &
    BuildWithProofPackedModuleFunction &
    SerializeGlobalFhePkeParamsModuleFunction &
    SerializeGlobalFhePublicKeyModuleFunction &
    SerializeGlobalFheCrsModuleFunction &
    DeserializeGlobalFhePublicKeyModuleFunction &
    DeserializeGlobalFheCrsModuleFunction
>;

export type EncryptModuleFactory = (runtime: FhevmRuntime) => {
  readonly encrypt: EncryptModule;
};
