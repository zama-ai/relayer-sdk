import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { BytesHex } from "../types/primitives.js";
import type { FheType } from "../types/fheType.js";
import type { DecryptedFheValue, DecryptedFheValueMap } from "../types/decryptedFheValue.js";
import type { FhevmHandle, FhevmHandleOfType } from "../types/fhevmHandle.js";
import type { DecryptedFhevmHandle, DecryptedFhevmHandleOfType } from "../types/decryptedFhevmHandle.js";
import type { Fhevm } from "../types/coreFhevmClient.js";
/**
 * Returns `true` if `value` was created via {@link createDecryptedFhevmHandle}
 * and its origin matches the given `originToken`.
 *
 * Uses `instanceof` against the non-exported `DecryptedFhevmHandleImpl` class
 * (unforgeable in same-realm contexts), then verifies the origin token.
 *
 * @param value - The value to check
 * @param originToken - Origin symbol held privately by the decrypt flow
 */
export declare function isDecryptedFhevmHandle(value: unknown, originToken: symbol): value is DecryptedFhevmHandle;
/**
 * Asserts that `value` was created via {@link createDecryptedFhevmHandle}
 * and its origin matches the given `originToken`.
 *
 * @throws {InvalidTypeError} If the value is not a `DecryptedFhevmHandle`
 * instance, or if it fails origin verification.
 */
export declare function assertIsDecryptedFhevmHandle(value: unknown, options: {
    subject?: string;
    originToken: symbol;
} & ErrorMetadataParams): asserts value is DecryptedFhevmHandle;
/**
 * Returns `true` if every element was created via
 * {@link createDecryptedFhevmHandle} and its origin matches the given
 * `originToken`.
 */
export declare function isDecryptedFhevmHandleArray(values: readonly unknown[], originToken: symbol): values is readonly DecryptedFhevmHandle[];
/**
 * Asserts that `values` is an array where every element was created via
 * {@link createDecryptedFhevmHandle} and its origin matches the given
 * `originToken`.
 *
 * @throws {InvalidTypeError} If the value is not an array, or if any element
 * is not a `DecryptedFhevmHandle` instance (error includes the index).
 */
export declare function assertIsDecryptedFhevmHandleArray(values: unknown, options: {
    subject?: string;
    originToken: symbol;
} & ErrorMetadataParams): asserts values is readonly DecryptedFhevmHandle[];
/**
 * Creates a validated, immutable {@link DecryptedFhevmHandleOfTypeBase}.
 *
 * The `originToken` parameter acts as access control: only code that holds
 * a private `Symbol` (e.g. `publicDecrypt`, `userDecrypt`) can produce
 * instances that pass {@link isDecryptedFhevmHandle} with origin verification.
 *
 * @param handle - A validated {@link FhevmHandle}
 * @param value - The decrypted plaintext value (validated against `handle.fheType`)
 * @param originToken - Private symbol owned by the calling decrypt flow
 * @returns A frozen `DecryptedFhevmHandle` instance
 * @throws {InvalidTypeError} If the value doesn't match the handle's FHE type
 */
export declare function createDecryptedFhevmHandle<T extends FheType>(handle: FhevmHandleOfType<T>, value: DecryptedFheValueMap[T], originToken: symbol): DecryptedFhevmHandleOfType<T>;
/**
 * Creates an array of {@link DecryptedFhevmHandleOfTypeBase}s from parallel arrays of
 * handles and clear values.
 *
 * @param orderedHandles - Validated FHEVM handles
 * @param orderedClearValues - Corresponding decrypted values (same length & order)
 * @param originToken - Private symbol owned by the calling decrypt flow
 * @returns A frozen array of frozen `DecryptedFhevmHandle` instances
 */
export declare function createDecryptedFhevmHandleArray(orderedHandles: readonly FhevmHandle[], orderedClearValues: readonly DecryptedFheValue[], originToken: symbol): readonly DecryptedFhevmHandle[];
export declare function abiEncodeDecryptedFhevmHandles(fhevm: Fhevm, args: {
    readonly orderedHandles: readonly DecryptedFhevmHandle[];
}): {
    abiTypes: Array<"uint256">;
    abiValues: Array<string | bigint>;
    abiEncodedClearValues: BytesHex;
};
//# sourceMappingURL=DecryptedFhevmHandle.d.ts.map