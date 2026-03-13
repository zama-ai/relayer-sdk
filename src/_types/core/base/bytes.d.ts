import type { Bytes, Bytes20, Bytes20Hex, Bytes20HexNo0x, Bytes21, Bytes21Hex, Bytes21HexNo0x, Bytes32, Bytes32Hex, Bytes32HexNo0x, Bytes65, Bytes65Hex, Bytes65HexNo0x, Bytes8, Bytes8Hex, Bytes8HexNo0x, BytesHex, BytesHexNo0x, BytesTypeNameToByteLengthMap, BytesTypeNameToTypeMap, ByteLength, Uint8Number, Uint64BigInt, UintNumber, Bytes1Hex, Bytes1, Bytes1HexNo0x, UintBigInt, BytesTypeName, BytesNMap } from "../types/primitives.js";
import type { RecordUint8ArrayPropertyType, RecordWithPropertyType } from "../types/record-p.js";
import type { ErrorMetadataParams } from "./errors/ErrorBase.js";
/**
 * Maps BytesXX type names to their corresponding byte lengths.
 * Type is derived from BytesTypeNameToByteLengthMap to ensure consistency.
 */
export declare const ByteLengthForType: BytesTypeNameToByteLengthMap;
export declare function isBytes(value: unknown, byteLength?: ByteLength): value is Bytes;
export declare function isBytesForType<T extends BytesTypeName>(value: unknown, typeName?: T): value is BytesTypeNameToTypeMap[T];
export declare function isBytes1(value: unknown): value is Bytes1;
export declare function isBytes8(value: unknown): value is Bytes8;
export declare function isBytes20(value: unknown): value is Bytes20;
export declare function isBytes21(value: unknown): value is Bytes21;
export declare function isBytes32(value: unknown): value is Bytes32;
export declare function isBytes65(value: unknown): value is Bytes65;
export declare function isBytesHex(value: unknown, byteLength?: ByteLength): value is BytesHex;
export declare function isBytes1Hex(value: unknown): value is Bytes1Hex;
export declare function isBytes8Hex(value: unknown): value is Bytes8Hex;
export declare function isBytes20Hex(value: unknown): value is Bytes20Hex;
export declare function isBytes21Hex(value: unknown): value is Bytes21Hex;
export declare function isBytes32Hex(value: unknown): value is Bytes32Hex;
export declare function isBytes65Hex(value: unknown): value is Bytes65Hex;
export declare function isBytesHexNo0x(value: unknown, byteLength?: ByteLength): value is BytesHexNo0x;
export declare function isBytes1HexNo0x(value: unknown): value is Bytes1HexNo0x;
export declare function isBytes8HexNo0x(value: unknown): value is Bytes8HexNo0x;
export declare function isBytes20HexNo0x(value: unknown): value is Bytes20HexNo0x;
export declare function isBytes21HexNo0x(value: unknown): value is Bytes21HexNo0x;
export declare function isBytes32HexNo0x(value: unknown): value is Bytes32HexNo0x;
export declare function isBytes65HexNo0x(value: unknown): value is Bytes65HexNo0x;
export declare function assertIsBytes(value: unknown, options?: {
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes;
export declare function assertIsBytesForType<T extends BytesTypeName>(value: unknown, options?: {
    typeName: T;
    subject?: string;
} & ErrorMetadataParams): asserts value is BytesNMap[T];
export declare function assertIsBytes1(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes1;
export declare function assertIsBytes8(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes8;
export declare function assertIsBytes20(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes20;
export declare function assertIsBytes21(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes21;
export declare function assertIsBytes32(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes32;
export declare function assertIsBytes65(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes65;
export declare function asBytesForType(value: unknown, options?: {
    typeName: BytesTypeName;
    subject?: string;
} & ErrorMetadataParams): Bytes;
export declare function asBytes(value: unknown, options?: {
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): Bytes;
export declare function asBytes1(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes1;
export declare function asBytes8(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes8;
export declare function asBytes20(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes20;
export declare function asBytes21(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes21;
export declare function asBytes32(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes32;
export declare function asBytes65(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes65;
/**
 * Assertion function that validates a value is a valid hex bytes string.
 * A valid BytesHex string must start with "0x" followed by an even number of hexadecimal characters.
 * Throws an `InvalidTypeError` if validation fails.
 *
 * @param value - The value to validate (can be any type)
 * @param options - Validation options
 * @param options.byteLength - Optional expected byte length (e.g., 8, 20, 32)
 * @param options.subject - Optional name of the value being validated (used in error messages)
 * @throws {InvalidTypeError} When the value is not a string or not valid BytesHex format
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processHash(hash: unknown) {
 *   assertIsBytesHex(hash, { byteLength: 32, subject: 'hash' });
 *   console.log(hash); // TypeScript now knows hash is BytesHex
 * }
 * ```
 */
export declare function assertIsBytesHex(value: unknown, options: {
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): asserts value is BytesHex;
export declare function assertIsBytes1Hex(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes1Hex;
export declare function assertIsBytes8Hex(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes8Hex;
export declare function assertIsBytes20Hex(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes20Hex;
export declare function assertIsBytes21Hex(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes21Hex;
export declare function assertIsBytes32Hex(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes32Hex;
export declare function assertIsBytes65Hex(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes65Hex;
export declare function asBytesHex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): BytesHex;
export declare function asBytes1Hex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes1Hex;
export declare function asBytes8Hex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes8Hex;
export declare function asBytes20Hex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes20Hex;
export declare function asBytes21Hex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes21Hex;
export declare function asBytes32Hex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes32Hex;
export declare function asBytes65Hex(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes65Hex;
/**
 * Assertion function that validates a value is a valid hex bytes string without "0x" prefix.
 * A valid BytesHexNo0x string must contain only hexadecimal characters (no "0x" prefix).
 * Throws an `InvalidTypeError` if validation fails.
 *
 * @param value - The value to validate (can be any type)
 * @param options - Validation options
 * @param options.byteLength - Optional expected byte length (e.g., 8, 20, 32)
 * @param options.subject - Optional name of the value being validated (used in error messages)
 * @throws {InvalidTypeError} When the value is not a string or not valid BytesHexNo0x format
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processSignature(sig: unknown) {
 *   assertIsBytesHexNo0x(sig, { byteLength: 65, subject: 'signature' });
 *   console.log(sig); // TypeScript now knows sig is BytesHexNo0x
 * }
 * ```
 */
export declare function assertIsBytesHexNo0x(value: unknown, options: {
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): asserts value is BytesHexNo0x;
export declare function assertIsBytes1HexNo0x(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes1HexNo0x;
export declare function assertIsBytes8HexNo0x(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes8HexNo0x;
export declare function assertIsBytes20HexNo0x(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes20HexNo0x;
export declare function assertIsBytes21HexNo0x(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes21HexNo0x;
export declare function assertIsBytes32HexNo0x(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes32HexNo0x;
export declare function assertIsBytes65HexNo0x(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes65HexNo0x;
export declare function asBytesHexNo0x(value: unknown, options?: {
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): BytesHexNo0x;
export declare function asBytes1HexNo0x(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes1HexNo0x;
export declare function asBytes8HexNo0x(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes8HexNo0x;
export declare function asBytes20HexNo0x(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes20HexNo0x;
export declare function asBytes21HexNo0x(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes21HexNo0x;
export declare function asBytes32HexNo0x(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes32HexNo0x;
export declare function asBytes65HexNo0x(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Bytes65HexNo0x;
/**
 * Assertion function that validates a value is an array of valid hex bytes strings.
 * Each element must start with "0x" followed by hexadecimal characters.
 * Throws an `InvalidTypeError` if validation fails.
 *
 * @param value - The value to validate (can be any type)
 * @param options - Validation options
 * @param options.byteLength - Optional expected byte length for each element (e.g., 8, 20, 32)
 * @param options.subject - Optional name of the value being validated (used in error messages)
 * @throws {InvalidTypeError} When the value is not an array or any element is not valid BytesHex format
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processHashes(hashes: unknown) {
 *   assertIsBytesHexArray(hashes, { byteLength: 32, subject: 'hashes' });
 *   hashes.forEach(hash => console.log(hash)); // TypeScript knows each is BytesHex
 * }
 * ```
 */
export declare function assertIsBytesHexArray(value: unknown, options: {
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): asserts value is BytesHex[];
export declare function assertIsBytesArray(value: unknown, options: {
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes[];
export declare function assertIsBytes1HexArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes1Hex[];
export declare function assertIsBytes8HexArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes8Hex[];
export declare function assertIsBytes20HexArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes20Hex[];
export declare function assertIsBytes21HexArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes21Hex[];
export declare function assertIsBytes32HexArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes32Hex[];
export declare function assertIsBytes65HexArray(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes65Hex[];
export declare function assertIsBytes32Array(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Bytes32[];
/**
 * Type guard that checks if a property exists on an object and is a valid hex bytes string.
 * A valid BytesHex string starts with "0x" followed by an even number of hexadecimal characters.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to check (can be any type)
 * @param property - The property name to check for
 * @param byteLength - Optional byte length (e.g., 8, 20, 32)
 * @returns True if `o` is an object with the specified property that is a valid BytesHex string
 *
 * @example
 * ```typescript
 * const data: unknown = { hash: "0x1234abcd", value: 42 };
 * if (isRecordBytesHexProperty(data, 'hash')) {
 *   console.log(data.hash); // "0x1234abcd"
 * }
 * ```
 */
export declare function isRecordBytesHexProperty<K extends string>(record: unknown, property: K, byteLength?: ByteLength): record is RecordWithPropertyType<K, BytesHex>;
export declare function isRecordBytes1HexProperty<K extends string>(record: unknown, property: K): record is RecordWithPropertyType<K, Bytes1Hex>;
export declare function isRecordBytes8HexProperty<K extends string>(record: unknown, property: K): record is RecordWithPropertyType<K, Bytes8Hex>;
export declare function isRecordBytes20HexProperty<K extends string>(record: unknown, property: K): record is RecordWithPropertyType<K, Bytes20Hex>;
export declare function isRecordBytes21HexProperty<K extends string>(record: unknown, property: K): record is RecordWithPropertyType<K, Bytes21Hex>;
export declare function isRecordBytes32HexProperty<K extends string>(record: unknown, property: K): record is RecordWithPropertyType<K, Bytes32Hex>;
export declare function isRecordBytes65HexProperty<K extends string>(record: unknown, property: K): record is RecordWithPropertyType<K, Bytes65Hex>;
/**
 * Assertion function that validates a property exists on an object and is a valid hex bytes string.
 * A valid BytesHex string must start with "0x" followed by an even number of hexadecimal characters.
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param recordName - The name of the object being validated (used in error messages)
 * @throws {InvalidPropertyError} When the property is missing, not a string, or not valid BytesHex format
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processTransaction(data: unknown) {
 *   assertRecordBytesHexProperty(data, 'txHash', 'transaction');
 *   console.log(data.txHash); // e.g., "0x1234..."
 * }
 * ```
 */
export declare function assertRecordBytesHexProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    byteLength?: ByteLength;
} & ErrorMetadataParams): asserts record is RecordWithPropertyType<K, BytesHex>;
export declare function assertRecordBytes1HexProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes1Hex>;
export declare function assertRecordBytes8HexProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes8Hex>;
export declare function assertRecordBytes20HexProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes20Hex>;
export declare function assertRecordBytes21HexProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes21Hex>;
export declare function assertRecordBytes32HexProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes32Hex>;
export declare function assertRecordBytes65HexProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes65Hex>;
/**
 * Type guard that checks if a property exists on an object and is a valid hex bytes string without "0x" prefix.
 * A valid BytesHexNo0x string contains only hexadecimal characters (no "0x" prefix).
 *
 * @template K - The property key type (string literal)
 * @param record - The value to check (can be any type)
 * @param property - The property name to check for
 * @param byteLength - Optional byte length (e.g., 8, 20, 32)
 * @returns True if `o` is an object with the specified property that is a valid BytesHexNo0x string
 *
 * @example
 * ```typescript
 * const data: unknown = { signature: "1234abcd", value: 42 };
 * if (isRecordBytesHexNo0xProperty(data, 'signature')) {
 *   console.log(data.signature); // "1234abcd"
 * }
 * ```
 */
export declare function isRecordBytesHexNo0xProperty<K extends string>(record: unknown, property: K, byteLength?: ByteLength): record is RecordWithPropertyType<K, BytesHexNo0x>;
/**
 * Assertion function that validates a property exists on an object and is a valid hex bytes string without "0x" prefix.
 * A valid BytesHexNo0x string contains only hexadecimal characters (no "0x" prefix).
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param recordName - The name of the object being validated (used in error messages)
 * @param options - Validation options
 * @param options.byteLength - Optional expected byte length (e.g., 8, 20, 32)
 * @throws {InvalidPropertyError} When the property is missing, not a string, or not valid BytesHexNo0x format
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processData(data: unknown) {
 *   assertRecordBytesHexNo0xProperty(data, 'signature', 'response', {});
 *   console.log(data.signature); // e.g., "1234abcd..."
 * }
 * ```
 */
export declare function assertRecordBytesHexNo0xProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    byteLength?: ByteLength;
} & ErrorMetadataParams): asserts record is RecordWithPropertyType<K, BytesHexNo0x>;
/**
 * Assertion function that validates a property exists on an object, is an array,
 * and every element is a valid hex bytes string (with "0x" prefix).
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param record - The record to validate (can be any type)
 * @param property - The property name to check for
 * @param recordName - The name of the record being validated (used in error messages)
 * @throws {InvalidPropertyError} When the property is missing, not an array, or any element is not valid BytesHex
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processHashes(data: unknown) {
 *   assertRecordBytesHexArrayProperty(data, 'txHashes', 'transaction');
 *   data.txHashes.forEach(hash => {
 *     console.log(hash); // e.g., "0x1234abcd..."
 *   });
 * }
 * ```
 */
export declare function assertRecordBytesHexArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    byteLength?: ByteLength;
} & ErrorMetadataParams): asserts record is RecordWithPropertyType<K, BytesHex[]>;
export declare function assertRecordBytes1HexArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes1Hex[]>;
export declare function assertRecordBytes8HexArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes8Hex[]>;
export declare function assertRecordBytes20HexArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes20Hex[]>;
export declare function assertRecordBytes21HexArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes21Hex[]>;
export declare function assertRecordBytes32HexArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes32Hex[]>;
export declare function assertRecordBytes65HexArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Bytes65Hex[]>;
/**
 * Assertion function that validates a property exists on an object, is an array,
 * and every element is a valid hex bytes string (without "0x" prefix).
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param record - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param recordName - The name of the object being validated (used in error messages)
 * @throws {InvalidPropertyError} When the property is missing, not an array, or any element is not valid BytesHexNo0x
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processSignatures(data: unknown) {
 *   assertRecordBytesHexNo0xArrayProperty(data, 'signatures', 'response');
 *   data.signatures.forEach(sig => {
 *     console.log(sig); // e.g., "1234abcd..." (no 0x prefix)
 *   });
 * }
 * ```
 */
export declare function assertRecordBytesHexNo0xArrayProperty<K extends string>(record: unknown, property: K, recordName: string, options: {
    byteLength?: ByteLength;
} & ErrorMetadataParams): asserts record is RecordWithPropertyType<K, BytesHexNo0x[]>;
export declare function isRecordUint8ArrayProperty<K extends string>(o: unknown, property: K): o is RecordUint8ArrayPropertyType<K>;
export declare function assertRecordUint8ArrayProperty<K extends string>(o: unknown, property: K, objName: string, options: ErrorMetadataParams): asserts o is RecordWithPropertyType<K, Uint8Array>;
/**
 * Convert a Uint8Array to a hex string (without 0x prefix).
 *
 * @param bytes - The byte array to convert. If `undefined` or empty, returns `""`.
 * @returns A lowercase hex string with even length (2 chars per byte), without `0x` prefix.
 *
 * @example
 * bytesToHexNo0x(new Uint8Array([0x48, 0x65])) // "4865"
 * bytesToHexNo0x(new Uint8Array([0x0a]))       // "0a"
 * bytesToHexNo0x(undefined)                    // ""
 * bytesToHexNo0x(new Uint8Array([]))           // ""
 */
export declare function bytesToHexNo0x(bytes: Uint8Array | undefined): BytesHexNo0x;
/**
 * Convert a Uint8Array to a `0x`-prefixed hex string.
 *
 * @param bytes - The byte array to convert. If `undefined` or empty, returns `"0x"`.
 * @returns A lowercase `0x`-prefixed hex string with even length (2 chars per byte after prefix).
 *
 * @example
 * bytesToHex(new Uint8Array([0x48, 0x65])) // "0x4865"
 * bytesToHex(new Uint8Array([0x0a]))       // "0x0a"
 * bytesToHex(undefined)                    // "0x"
 * bytesToHex(new Uint8Array([]))           // "0x"
 */
export declare function bytesToHex(bytes: Uint8Array | undefined): BytesHex;
/**
 * Convert a 1-byte long Uint8Array to a 0x prefixed hex string (length=4)
 */
export declare function bytes1ToHex(bytes: unknown): Bytes1Hex;
/**
 * Convert a 8-bytes long Uint8Array to a 0x prefixed hex string (length=18)
 */
export declare function bytes8ToHex(bytes: unknown): Bytes8Hex;
/**
 * Convert a 20-bytes long Uint8Array to a 0x prefixed hex string (length=42)
 */
export declare function bytes20ToHex(bytes: unknown): Bytes20Hex;
/**
 * Convert a 21-bytes long Uint8Array to a 0x prefixed hex string (length=44)
 */
export declare function bytes21ToHex(bytes: unknown): Bytes21Hex;
/**
 * Convert a 32-bytes long Uint8Array to a 0x prefixed hex string (length=66).
 *
 * @param bytes - Input to convert (asserted to be Bytes32)
 * @returns Hex string with 0x prefix
 * @throws Error if bytes is not a valid 32-byte Uint8Array
 */
export declare function bytes32ToHex(bytes: unknown): Bytes32Hex;
/**
 * Convert a 65-bytes long Uint8Array to a 0x prefixed hex string (length=132)
 */
export declare function bytes65ToHex(bytes: Uint8Array | undefined): Bytes65Hex;
/**
 * Converts a Uint8Array to a hex string, optimized for large byte arrays.
 *
 * Unlike {@link bytesToHex}, this function avoids `Array.from` and string
 * concatenation, making it more efficient for large inputs.
 *
 * @param bytes - The byte array to convert
 * @param no0x - If `true`, returns the hex string without the `0x` prefix
 * @returns The hex string representation of the bytes
 * @example bytesToHexLarge(new Uint8Array([255, 0]), false) // '0xff00'
 * @example bytesToHexLarge(new Uint8Array([255, 0]), true) // 'ff00'
 */
export declare function bytesToHexLarge(bytes: Uint8Array, no0x: true): BytesHexNo0x;
export declare function bytesToHexLarge(bytes: Uint8Array, no0x?: false): BytesHex;
/**
 * Convert a hex string prefixed by 0x or not to a Uint8Array
 * Any invalid byte string is converted to 0
 * "0xzzff" = [0, 255]
 * "0xzfff" = [0, 255]
 */
export declare function hexToBytes(hexString: string): Uint8Array;
/**
 * Convert a hex string (with or without 0x prefix) to a 1-byte Uint8Array.
 * Left-pads with zeros if shorter than 1 byte.
 * Empty string or "0x" returns 1 zero byte.
 *
 * @param hexString - Hex string with or without 0x prefix
 * @returns 1-byte Uint8Array
 * @throws Error if hex string has odd length or exceeds 2 hex characters
 *
 * @example
 * // Full 1-byte input
 * hexToBytes1("0xff") // Uint8Array [255]
 *
 * @example
 * // Empty input - returns 1 zero byte
 * hexToBytes1("")   // Uint8Array [0]
 * hexToBytes1("0x") // Uint8Array [0]
 */
export declare function hexToBytes1(hexString: string): Bytes1;
/**
 * Convert a hex string (with or without 0x prefix) to an 8-byte Uint8Array.
 * Left-pads with zeros if shorter than 8 bytes.
 * Empty string or "0x" returns 8 zero bytes.
 *
 * @param hexString - Hex string with or without 0x prefix
 * @returns 8-byte Uint8Array
 * @throws Error if hex string has odd length or exceeds 16 hex characters
 *
 * @example
 * // Full 8-byte input
 * hexToBytes8("0x0102030405060708") // Uint8Array [1,2,3,4,5,6,7,8]
 *
 * @example
 * // Short input - left-padded with zeros
 * hexToBytes8("0x1234") // Uint8Array [0,0,0,0,0,0,0x12,0x34]
 * hexToBytes8("1234")   // Same result, 0x prefix optional
 * hexToBytes8("0xff")   // Uint8Array [0,0,0,0,0,0,0,255]
 *
 * @example
 * // Empty input - returns 8 zero bytes
 * hexToBytes8("")   // Uint8Array [0,0,0,0,0,0,0,0]
 * hexToBytes8("0x") // Uint8Array [0,0,0,0,0,0,0,0]
 */
export declare function hexToBytes8(hexString: string): Bytes8;
/**
 * Convert a hex string (with or without 0x prefix) to a 20-byte Uint8Array.
 * Left-pads with zeros if shorter than 20 bytes.
 * Empty string or "0x" returns 20 zero bytes.
 *
 * @param hexString - Hex string with or without 0x prefix
 * @returns 20-byte Uint8Array (suitable for Ethereum addresses)
 * @throws Error if hex string has odd length or exceeds 40 hex characters
 *
 * @example
 * // Full 20-byte address
 * hexToBytes20("0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00")
 * // Uint8Array [0x74,0x2d,0x35,...,0xf8,0xfe,0x00]
 *
 * @example
 * // Short input - left-padded with zeros
 * hexToBytes20("0x1234") // Uint8Array [0,0,...,0,0x12,0x34] (18 zeros + 2 bytes)
 * hexToBytes20("0xff")   // Uint8Array [0,0,...,0,255] (19 zeros + 1 byte)
 *
 * @example
 * // Empty input - returns 20 zero bytes
 * hexToBytes20("")   // Uint8Array [0,0,0,...,0] (20 zeros)
 * hexToBytes20("0x") // Uint8Array [0,0,0,...,0] (20 zeros)
 */
export declare function hexToBytes20(hexString: string): Bytes20;
/**
 * Convert a hex string (with or without 0x prefix) to a 21-byte Uint8Array.
 * Left-pads with zeros if shorter than 21 bytes.
 * Empty string or "0x" returns 21 zero bytes.
 *
 * @param hexString - Hex string with or without 0x prefix
 * @returns 21-byte Uint8Array
 * @throws Error if hex string has odd length or exceeds 42 hex characters
 *
 * @example
 * // Full 21-byte input
 * hexToBytes21("0x01" + "00".repeat(20)) // Uint8Array [1,0,0,...,0] (21 bytes)
 *
 * @example
 * // Short input - left-padded with zeros
 * hexToBytes21("0x1234") // Uint8Array [0,0,...,0,0x12,0x34] (19 zeros + 2 bytes)
 * hexToBytes21("0xff")   // Uint8Array [0,0,...,0,255] (20 zeros + 1 byte)
 *
 * @example
 * // Empty input - returns 21 zero bytes
 * hexToBytes21("")   // Uint8Array [0,0,0,...,0] (21 zeros)
 * hexToBytes21("0x") // Uint8Array [0,0,0,...,0] (21 zeros)
 */
export declare function hexToBytes21(hexString: string): Bytes21;
/**
 * Convert a hex string (with or without 0x prefix) to a 32-byte Uint8Array.
 * Left-pads with zeros if shorter than 32 bytes.
 * Empty string or "0x" returns 32 zero bytes.
 *
 * @param hexString - Hex string with or without 0x prefix
 * @returns 32-byte Uint8Array (suitable for hashes, private keys, etc.)
 * @throws Error if hex string has odd length or exceeds 64 hex characters
 *
 * @example
 * // Full 32-byte hash
 * hexToBytes32("0xabcdef..." /* 64 hex chars *\/) // Uint8Array [0xab,0xcd,0xef,...]
 *
 * @example
 * // Short input - left-padded with zeros (useful for encoding small numbers)
 * hexToBytes32("0x1234") // Uint8Array [0,0,...,0,0x12,0x34] (30 zeros + 2 bytes)
 * hexToBytes32("0x01")   // Uint8Array [0,0,...,0,1] (31 zeros + 1 byte)
 * hexToBytes32("0xff")   // Uint8Array [0,0,...,0,255] (31 zeros + 1 byte)
 *
 * @example
 * // Empty input - returns 32 zero bytes
 * hexToBytes32("")   // Uint8Array [0,0,0,...,0] (32 zeros)
 * hexToBytes32("0x") // Uint8Array [0,0,0,...,0] (32 zeros)
 */
export declare function hexToBytes32(hexString: string): Bytes32;
/**
 * Convert a hex string (with or without 0x prefix) to a 65-byte Uint8Array.
 * Left-pads with zeros if shorter than 65 bytes.
 * Empty string or "0x" returns 65 zero bytes.
 *
 * @param hexString - Hex string with or without 0x prefix
 * @returns 65-byte Uint8Array (suitable for ECDSA signatures with recovery byte)
 * @throws Error if hex string has odd length or exceeds 130 hex characters
 *
 * @example
 * // Full 65-byte signature (r + s + v)
 * hexToBytes65("0x" + "ab".repeat(65)) // Uint8Array [0xab,0xab,...] (65 bytes)
 *
 * @example
 * // Short input - left-padded with zeros
 * hexToBytes65("0x1234") // Uint8Array [0,0,...,0,0x12,0x34] (63 zeros + 2 bytes)
 * hexToBytes65("0xff")   // Uint8Array [0,0,...,0,255] (64 zeros + 1 byte)
 *
 * @example
 * // Empty input - returns 65 zero bytes
 * hexToBytes65("")   // Uint8Array [0,0,0,...,0] (65 zeros)
 * hexToBytes65("0x") // Uint8Array [0,0,0,...,0] (65 zeros)
 */
export declare function hexToBytes65(hexString: string): Bytes65;
/**
 * Convert a hex string prefixed by 0x or not to a Uint8Array
 */
export declare function hexToBytesFaster(hexString: string, options?: {
    strict?: boolean;
    byteLength?: ByteLength;
    subject?: string;
} & ErrorMetadataParams): Uint8Array;
/**
 * Convert a Uint8Array to a bigint (big-endian interpretation).
 * The most significant byte is at index 0.
 *
 * @param byteArray - The byte array to convert (big-endian)
 * @returns The bigint representation of the bytes
 *
 * @example
 * // Standard conversion (big-endian)
 * bytesToBigInt(new Uint8Array([0x01, 0x00])) // 256n (0x0100)
 * bytesToBigInt(new Uint8Array([0xff]))       // 255n
 * bytesToBigInt(new Uint8Array([0x01, 0x02, 0x03])) // 66051n (0x010203)
 *
 * @example
 * // Edge cases
 * bytesToBigInt(new Uint8Array([]))  // 0n
 * bytesToBigInt(new Uint8Array([0])) // 0n
 * bytesToBigInt(undefined)           // 0n
 *
 * @example
 * // 32-byte value (e.g., uint256)
 * const bytes32 = new Uint8Array(32);
 * bytes32[31] = 0x2a; // 42 in last byte
 * bytesToBigInt(bytes32) // 42n
 */
export declare function bytesToBigInt(byteArray: Uint8Array | undefined): UintBigInt;
/**
 * Converts a non-negative bigint to a `0x`-prefixed hex string.
 *
 * When `byteLength` is provided, the output is zero-padded to exactly
 * that many bytes and an overflow check is performed.
 * When omitted, the output is the minimal even-length hex representation.
 *
 * @param value - Non-negative bigint to convert
 * @param options.byteLength - Fixed byte width (enables zero-padding and overflow check)
 * @param options.subject - Name used in error messages
 * @returns `0x`-prefixed hex string
 * @throws {InvalidTypeError} If value is negative or exceeds the byte length
 *
 * @example
 * ```typescript
 * bigIntToBytesHex(0n)                          // '0x00'
 * bigIntToBytesHex(255n)                        // '0xff'
 * bigIntToBytesHex(256n)                        // '0x0100'
 * bigIntToBytesHex(1n, { byteLength: 4 })      // '0x00000001'
 * bigIntToBytesHex(255n, { byteLength: 1 })    // '0xff'
 * bigIntToBytesHex(256n, { byteLength: 1 })    // throws (overflow)
 * bigIntToBytesHex(-1n)                         // throws (negative)
 * ```
 */
export declare function bigIntToBytesHex(value: bigint, options: {
    byteLength: 1;
    subject?: string;
} & ErrorMetadataParams): Bytes1Hex;
export declare function bigIntToBytesHex(value: bigint, options: {
    byteLength: 8;
    subject?: string;
} & ErrorMetadataParams): Bytes8Hex;
export declare function bigIntToBytesHex(value: bigint, options: {
    byteLength: 20;
    subject?: string;
} & ErrorMetadataParams): Bytes20Hex;
export declare function bigIntToBytesHex(value: bigint, options: {
    byteLength: 32;
    subject?: string;
} & ErrorMetadataParams): Bytes32Hex;
export declare function bigIntToBytesHex(value: bigint, options?: {
    byteLength?: 1 | 2 | 4 | 8 | 16 | 20 | 32;
    subject?: string;
} & ErrorMetadataParams): BytesHex;
/**
 * Converts an array of Bytes32 or Bytes32Hex values to a uniform Bytes32Hex array.
 * Accepts mixed input: both 32-byte Uint8Arrays and hex strings are normalized to Bytes32Hex.
 *
 * @param arr - Array of Bytes32 (Uint8Array) or Bytes32Hex (string) or Bytes32HexAble values.
 * @returns Array of Bytes32Hex strings.
 */
export declare function toBytes32HexArray(arr: readonly unknown[]): Bytes32Hex[];
/**
 * Converts a Bytes32 or Bytes32Hex values to a Bytes32.
 * Accepts mixed input: both 32-byte Uint8Arrays and hex strings are normalized to Bytes32.
 */
export declare function toBytes32(value: unknown): Bytes32;
/**
 * Converts a Bytes or BytesHex values to a Bytes.
 * Accepts mixed input: both n-byte Uint8Arrays and hex strings are normalized to Bytes.
 */
export declare function toBytes(value: unknown, options?: {
    byteLength?: ByteLength;
    subject?: string;
    copy?: boolean;
} & ErrorMetadataParams): Bytes;
export declare function concatBytes(...arrays: Uint8Array[]): Uint8Array;
export declare function concatBytesHex(values: BytesHex[]): BytesHex;
/**
 * Compares two byte arrays for equality.
 *
 * **⚠️ WARNING: NOT TIMING-SAFE**
 *
 * This function uses early-exit comparison which leaks timing information
 * about where the first difference occurs. Do NOT use for comparing:
 * - Secret keys or passwords
 * - HMACs or authentication tags
 * - Any security-sensitive data
 *
 * For security-sensitive comparisons, use a timing-safe equals function instead.
 *
 * @param a - First byte array
 * @param b - Second byte array
 * @returns true if arrays are equal, false otherwise
 */
export declare function unsafeBytesEquals(a: unknown, b: unknown): boolean;
/**
 * Normalizes byte-like values to a Uint8Array.
 *
 * Handles both same-realm and cross-realm inputs (e.g., from iframes or
 * different JavaScript contexts).
 *
 * Supported input types:
 * - `Uint8Array` - returned as-is (same-realm) or re-wrapped (cross-realm)
 * - `ArrayBuffer` - wrapped in a new Uint8Array
 *
 * Other TypedArray types (Uint16Array, Int32Array, etc.) are explicitly
 * rejected to prevent silent endianness-dependent byte reinterpretation.
 *
 * @param value - The value to normalize
 * @returns A `Uint8Array` representing the bytes
 * @throws `TypeError` If the value is not a Uint8Array or ArrayBuffer
 *
 * @example
 * ```ts
 * normalizeBytes(new Uint8Array([1, 2, 3]));        // ✅ returns as-is
 * normalizeBytes(new ArrayBuffer(8));               // ✅ wraps in Uint8Array
 * normalizeBytes(new Uint16Array([1, 2]));          // ❌ throws TypeError
 * normalizeBytes(iframeUint8Array);                 // ✅ cross-realm supported
 * ```
 */
export declare function normalizeBytes(value: unknown): Bytes;
/**
 * Extracts a single byte from a bytes array at the given byte position.
 * @param bytes - The bytes array (Uint8Array)
 * @param position - Byte position (0-indexed)
 * @returns The byte value as Uint8Number (0-255)
 * @throws RangeError if position is out of bounds
 */
export declare function bytesUint8At(bytes: Bytes, position: Uint8Number): Uint8Number;
/**
 * Extracts a single byte from a 0x-hex string at the given byte position.
 * @param bytesHex - The hex string (0x-prefixed)
 * @param position - Byte position (0-indexed)
 * @throws `RangeError` if position is out of bounds
 */
export declare function bytesHexUint8At(bytesHex: BytesHex, position: Uint8Number): Uint8Number;
/**
 * Extracts a Uint64 (8 bytes) from a 0x-hex string at the given byte position.
 * @param bytesHex - The hex string (0x-prefixed)
 * @param position - Byte position (0-indexed)
 * @throws `RangeError` if position is out of bounds
 */
export declare function bytesHexUint64At(bytesHex: BytesHex, position: Uint8Number): Uint64BigInt;
/**
 * Extracts a slice of bytes from a hex string starting at the given byte position.
 * @param bytesHex - The hex string (0x-prefixed)
 * @param position - Starting byte position (0-indexed)
 * @param length - Number of bytes to extract (1, 8, 20, 21, 32, 65 for typed result, or any number for BytesHex)
 * @throws `RangeError` if position + length is out of bounds
 */
export declare function bytesHexSlice(bytesHex: BytesHex, position: Uint8Number, length: 1): Bytes1Hex;
export declare function bytesHexSlice(bytesHex: BytesHex, position: Uint8Number, length: 8): Bytes8Hex;
export declare function bytesHexSlice(bytesHex: BytesHex, position: Uint8Number, length: 20): Bytes20Hex;
export declare function bytesHexSlice(bytesHex: BytesHex, position: Uint8Number, length: 21): Bytes21Hex;
export declare function bytesHexSlice(bytesHex: BytesHex, position: Uint8Number, length: 32): Bytes32Hex;
export declare function bytesHexSlice(bytesHex: BytesHex, position: Uint8Number, length: 65): Bytes65Hex;
export declare function bytesHexSlice(bytesHex: BytesHex, position: Uint8Number, length: UintNumber): BytesHex;
//# sourceMappingURL=bytes.d.ts.map