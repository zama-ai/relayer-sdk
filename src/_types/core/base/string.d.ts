import type { RecordStringArrayPropertyType, RecordStringPropertyType } from "../types/record-p.js";
import type { ErrorMetadataParams } from "./errors/ErrorBase.js";
export declare function removeSuffix(s: string | undefined, suffix: string): string;
export declare function is0x(s: unknown): s is `0x${string}`;
export declare function isNo0x(s: unknown): s is string;
export declare function ensure0x(s: string): `0x${string}`;
export declare function remove0x(s: string): string;
export declare function assertIs0xString(s: unknown): asserts s is `0x${string}`;
export declare function isNonEmptyString(s: unknown): s is string;
/**
 * Type guard that checks if a property exists on an object and is a string.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to check (can be any type)
 * @param property - The property name to check for
 * @returns True if `o` is an object with the specified property that is a non-null string
 *
 * @example
 * ```typescript
 * const data: unknown = { status: "active", count: 42 };
 * if (isRecordStringProperty(data, 'status')) {
 *   console.log(data.status.toUpperCase()); // OK
 * }
 * ```
 */
export declare function isRecordStringProperty<K extends string>(o: unknown, property: K): o is RecordStringPropertyType<K>;
/**
 * Assertion function that validates a property exists on an object, is a string,
 * and optionally matches specific expected value(s).
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param recordName - The name of the object being validated (used in error messages)
 * @param expectedValue - Optional specific string value or array of allowed values to match against
 * @throws {InvalidPropertyError} When the property is missing, not a string, or doesn't match expectedValue
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * // Check property is a string (any value)
 * assertRecordStringProperty(data, 'name', 'user');
 *
 * // Check property equals a specific value
 * assertRecordStringProperty(data, 'status', 'response', 'active');
 *
 * // Check property is one of multiple allowed values
 * assertRecordStringProperty(data, 'status', 'response', ['queued', 'processing', 'completed']);
 * ```
 */
export declare function assertRecordStringProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    expectedValue?: string | string[];
} & ErrorMetadataParams): asserts record is RecordStringPropertyType<K>;
export declare function assertRecordStringArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordStringArrayPropertyType<K>;
/**
 * Capitalizes the first letter of a string.
 */
export declare function capitalizeFirstLetter(s: string): string;
export declare function safeJSONstringify(o: unknown, space?: string | number): string;
//# sourceMappingURL=string.d.ts.map