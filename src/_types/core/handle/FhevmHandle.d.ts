import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { Bytes32, Bytes32Hex, Uint64BigInt } from "../types/primitives.js";
import type { ExternalFhevmHandle, FhevmHandleBytes32, FhevmHandleBytes32Hex, FhevmHandleLike, FhevmHandle } from "../types/fhevmHandle.js";
export declare const FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION = 0;
export declare function assertIsFhevmHandleBytes32Hex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmHandleBytes32Hex;
export declare function assertIsFhevmHandleBytes32(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmHandleBytes32;
export declare function assertIsFhevmHandle(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmHandle;
export declare function assertIsExternalFhevmHandle(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): asserts value is ExternalFhevmHandle;
export declare function assertIsFhevmHandleLike(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmHandleLike;
export declare function isFhevmHandleBytes32(value: unknown): value is FhevmHandleBytes32;
export declare function isFhevmHandleBytes32Hex(value: unknown): value is FhevmHandleBytes32Hex;
export declare function isFhevmHandleLike(value: unknown): value is FhevmHandleLike;
/**
 * Checks if a value is a `FhevmHandle` instance.
 *
 * **Same-realm only**: Uses `instanceof` which only works when the value
 * was created in the same JavaScript realm (same module instance).
 * Will return `false` for handles from:
 * - Different package versions (duplicate node_modules)
 * - Different bundler outputs
 * - Cross-realm contexts (iframes, workers)
 *
 * @param value - The value to check
 * @returns `true` if value is a `FhevmHandle` instance from the same realm
 */
export declare function isFhevmHandle(value: unknown): value is FhevmHandle;
export declare function isExternalFhevmHandle(value: unknown): value is ExternalFhevmHandle;
export declare function asFhevmHandle(value: unknown): FhevmHandle;
export declare function asFhevmHandleLike(value: unknown): FhevmHandleLike;
export declare function asFhevmHandleBytes32(value: unknown): FhevmHandleBytes32;
export declare function asFhevmHandleBytes32Hex(value: unknown): FhevmHandleBytes32Hex;
/**
 * [Trusted] Converts a `FhevmHandleBytes32Hex` to a `FhevmHandle`.
 *
 * Trusts the type system for FhevmHandle hex format validation.
 *
 * @param handleBytes32Hex - A valid 32-byte hex string (typed as `FhevmHandleBytes32Hex`)
 * @returns A `FhevmHandle` instance
 */
export declare function fhevmHandleBytes32HexToFhevmHandle(handleBytes32Hex: FhevmHandleBytes32Hex): FhevmHandle;
/**
 * [Trusted] Converts a `Bytes32Hex` to a `FhevmHandle`.
 *
 * Trusts the type system for hex format validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param handleBytes32Hex - A valid 32-byte hex string (typed as `Bytes32Hex`)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export declare function bytes32HexToFhevmHandle(handleBytes32Hex: Bytes32Hex): FhevmHandle;
/**
 * [Trusted] Converts a `Bytes32` to a `FhevmHandle`.
 *
 * Trusts the type system for bytes format validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param bytes - A valid 32-byte array (typed as `Bytes32`)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export declare function bytes32ToFhevmHandle(bytes: Bytes32): FhevmHandle;
/**
 * [Trusted] Converts a `FhevmHandleLike` to a `FhevmHandle`.
 *
 * Trusts the type system for input validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param fhevmHandleLike - A `FhevmHandleLike` (Bytes32, Bytes32Hex, Bytes32HexAble, or FhevmHandle)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export declare function fhevmHandleLikeToFhevmHandle(fhevmHandleLike: FhevmHandleLike): FhevmHandle;
/**
 * [Validated] Converts an unknown value to a `FhevmHandle`.
 *
 * Performs full runtime validation of input format and FHEVM-specific fields.
 *
 * @param value - An unknown value (string, Uint8Array, or object with bytes32Hex)
 * @returns A `FhevmHandle` instance
 * @throws A `InvalidTypeError` If value is not a valid bytes32 hex or bytes32
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export declare function toFhevmHandle(value: unknown): FhevmHandle;
export declare function toExternalFhevmHandle(value: unknown): ExternalFhevmHandle;
/**
 * [Trusted] Compares two `FhevmHandle` instances for equality.
 *
 * @param a - First handle
 * @param b - Second handle
 * @returns `true` if both handles have the same `bytes32Hex` value
 */
export declare function fhevmHandleEquals(a: FhevmHandle, b: FhevmHandle): boolean;
export declare function assertFhevmHandleArrayEquals(actual: readonly FhevmHandle[], expected: readonly FhevmHandleLike[], options?: {
    actualName?: string | undefined;
    expectedName?: string | undefined;
}): void;
export declare function buildFhevmHandle({ index, chainId, hash21, fheTypeId, version, }: {
    index?: number | undefined;
    chainId: number | bigint;
    hash21: string;
    fheTypeId: number;
    version?: number;
}): FhevmHandle;
export declare function assertIsFhevmHandleLikeArray(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmHandleLike[];
export declare function assertFhevmHandlesBelongToSameChainId(fhevmHandles: readonly FhevmHandle[], chainId?: Uint64BigInt): void;
//# sourceMappingURL=FhevmHandle.d.ts.map