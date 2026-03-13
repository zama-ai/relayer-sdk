import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { DecryptAndReconstructUserModuleFunction, GetTkmsPublicKeyHexUserModuleFunction, WithDecryptModule, WithTkmsKeyModule } from "../modules/decrypt/types.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
import type { Bytes } from "../types/primitives.js";
import type { TkmsPrivateKey } from "../types/tkms-p.js";
export type FhevmDecryptionKey = GetTkmsPublicKeyHexUserModuleFunction & DecryptAndReconstructUserModuleFunction;
/** Type guard: returns true if value was created by {@link createFhevmDecryptionKey}. */
export declare function isFhevmDecryptionKey(value: unknown): value is FhevmDecryptionKey;
/** Throws {@link InvalidTypeError} if value is not a valid {@link FhevmDecryptionKey}. */
export declare function assertIsFhevmDecryptionKey(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmDecryptionKey;
/** Creates a {@link FhevmDecryptionKey} by binding a private key (raw bytes or deserialized) into closures. */
export declare function createFhevmDecryptionKey(fhevmRuntime: FhevmRuntime<WithTkmsKeyModule & WithDecryptModule>, parameters: {
    tkmsPrivateKey: Bytes | TkmsPrivateKey;
}): Promise<FhevmDecryptionKey>;
//# sourceMappingURL=FhevmDecryptionKey-p.d.ts.map