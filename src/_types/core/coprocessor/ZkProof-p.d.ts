import type { Bytes } from "../types/primitives.js";
import type { ZkProofLike, ZkProof } from "../types/zkProof.js";
import type { FhevmHandle } from "../types/fhevmHandle.js";
import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { ParseTFHEProvenCompactCiphertextListModuleFunction } from "../modules/encrypt/types.js";
export declare const FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR = "ZK-w_rct";
export declare const FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR = "ZK-w_hdl";
export declare function isZkProof(value: unknown): value is ZkProof;
export declare function assertIsZkProof(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is ZkProof;
/**
 * @internal
 * Creates a ZkProof from loose input types.
 * Validates and normalizes all fields.
 *
 * If `ciphertextWithZkProof` is a hex string, it will be converted to a new Uint8Array.
 * If it is already a Uint8Array:
 * - By default, a defensive copy is made, allowing the caller to retain the original.
 * - With `noCopy: true`, the instance takes ownership — callers must not mutate it afterward.
 * @param zkProofLike - The loose input to validate and normalize (see {@link ZkProofLike}).
 * @param options - Optional settings. Set `options.copy` to `false` to skip copying the
 *   `ciphertextWithZkProof` Uint8Array (takes ownership). Defaults to `true` (copy by default).
 * @throws A {@link ZkProofError} if ciphertextWithZkProof is invalid or empty.
 * @throws A {@link InvalidTypeError} if any field fails validation.
 */
export declare function toZkProof(zkProofLike: ZkProofLike, options?: {
    readonly zkProofParser?: ParseTFHEProvenCompactCiphertextListModuleFunction;
    readonly copy?: boolean;
}): Promise<ZkProof>;
export declare function zkProofToFhevmHandles(zkProofLike: ZkProofLike, options?: {
    readonly version?: number;
    readonly zkProofParser?: ParseTFHEProvenCompactCiphertextListModuleFunction;
}): Promise<readonly FhevmHandle[]>;
/**
 * @internal
 */
export declare function zkProofGetUnsafeRawBytes(zkProof: ZkProof): Bytes;
//# sourceMappingURL=ZkProof-p.d.ts.map