import type { RecordArrayPropertyType, RecordBooleanPropertyType, RecordNonNullablePropertyType } from "../types/record-p.js";
import type { ErrorMetadataParams } from "./errors/ErrorBase.js";
/**
 * Type guard that checks if a property exists on an object and is non-null/non-undefined.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to check (can be any type)
 * @param property - The property name to check for
 * @returns True if `o` is an object with the specified property that is not null or undefined
 *
 * @example
 * ```typescript
 * const data: unknown = { name: "Alice", age: 30 };
 * if (isRecordNonNullableProperty(data, 'name')) {
 *   console.log(data.name); // OK
 * }
 * ```
 */
export declare function isRecordNonNullableProperty<K extends string>(o: unknown, property: K): o is RecordNonNullablePropertyType<K>;
/**
 * Assertion function that validates a property exists on an object and is non-null/non-undefined.
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param recordName - The name of the object being validated (used in error messages)
 * @throws {InvalidPropertyError} When the property is missing, null, or undefined
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processUser(data: unknown) {
 *   assertRecordNonNullableProperty(data, 'userId', 'user');
 *   console.log(data.userId);
 * }
 * ```
 */
export declare function assertRecordNonNullableProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    expectedType?: string;
} & ErrorMetadataParams): asserts record is RecordNonNullablePropertyType<K>;
/**
 * Type guard that checks if a property exists on an object and is an array.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to check (can be any type)
 * @param property - The property name to check for
 * @returns True if `o` is an object with the specified property that is a non-null array
 *
 * @example
 * ```typescript
 * const data: unknown = { items: [1, 2, 3], count: 42 };
 * if (isRecordArrayProperty(data, 'items')) {
 *   console.log(data.items.length); // OK
 *   data.items.forEach(item => console.log(item)); // OK
 * }
 * ```
 */
export declare function isRecordArrayProperty<K extends string>(record: unknown, property: K): record is RecordArrayPropertyType<K>;
/**
 * Assertion function that validates a property exists on an object and is an array.
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param recordName - The name of the object being validated (used in error messages)
 * @throws {InvalidPropertyError} When the property is missing, null, or not an array
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processResults(data: unknown) {
 *   assertRecordArrayProperty(data, 'results', 'response');
 *   console.log(`Found ${data.results.length} results`);
 *   data.results.forEach(result => processResult(result));
 * }
 * ```
 */
export declare function assertRecordArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    expectedType?: string;
} & ErrorMetadataParams): asserts record is RecordArrayPropertyType<K>;
export declare function isRecordBooleanProperty<K extends string>(record: unknown, property: K): record is RecordBooleanPropertyType<K>;
export declare function assertRecordBooleanProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    expectedValue?: boolean;
} & ErrorMetadataParams): asserts record is RecordBooleanPropertyType<K>;
export declare function typeofProperty(o: unknown, property: string): string;
//# sourceMappingURL=record.d.ts.map