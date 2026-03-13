import type { ErrorMetadataParams } from "./errors/ErrorBase.js";
/**
 * Asserts that `value` is a `boolean`. Throws {@link InvalidTypeError} otherwise.
 *
 * @param value - The value to check.
 * @param options - Error context (optional `subject` label and metadata).
 * @throws {InvalidTypeError} If `value` is not a `boolean`.
 */
export declare function assertIsBoolean(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is boolean;
/**
 * Returns `value` if it is a `boolean`. Throws {@link InvalidTypeError} otherwise.
 *
 * Unlike {@link toBoolean}, no coercion is performed — the value must already
 * be a `boolean`.
 *
 * @param value - The value to validate.
 * @param options - Error context (optional `subject` label and metadata).
 * @returns The validated `boolean`.
 * @throws {InvalidTypeError} If `value` is not a `boolean`.
 */
export declare function asBoolean(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): boolean;
/**
 * Coerces `value` to a `boolean`.
 *
 * Accepted inputs:
 * - `boolean` — returned as-is.
 * - `number` — `1` → `true`, `0` → `false`.
 * - `bigint` — `1n` → `true`, `0n` → `false`.
 * - `string` — `"true"` → `true`, `"false"` → `false`.
 *
 * Any other value or representation throws {@link InvalidTypeError}.
 *
 * @param value - The value to coerce.
 * @param options - Error context (optional `subject` label and metadata).
 * @returns The coerced `boolean`.
 * @throws {InvalidTypeError} If `value` cannot be coerced to a `boolean`.
 */
export declare function toBoolean(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): boolean;
//# sourceMappingURL=boolean.d.ts.map