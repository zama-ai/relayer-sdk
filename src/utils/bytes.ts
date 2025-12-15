import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import {
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
  typeofProperty,
} from './record';

export type Bytes = Uint8Array;
export type Bytes32 = Uint8Array;
export type BytesHex = `0x${string}`;
export type BytesHexNo0x = string;
export type Bytes32Hex = `0x${string}`;
export type Bytes32HexNo0x = string;
export type Bytes65Hex = `0x${string}`;
export type Bytes65HexNo0x = string;

export function isBytesHex(value: unknown): value is BytesHex {
  if (typeof value !== 'string') {
    return false;
  }
  if (!value.startsWith('0x')) {
    return false;
  }
  const hexRegex = /^0x[a-fA-F0-9]*$/;
  if (!hexRegex.test(value)) {
    return false;
  }
  if ((value.length - 2) % 2 !== 0) {
    return false;
  }
  return true;
}

export function isBytesHexNo0x(value: unknown): value is BytesHexNo0x {
  if (typeof value !== 'string') {
    return false;
  }
  if (value.startsWith('0x')) {
    return false;
  }
  const hexRegex = /^[a-fA-F0-9]*$/;
  if (!hexRegex.test(value)) {
    return false;
  }
  if ((value.length - 2) % 2 !== 0) {
    return false;
  }
  return true;
}

export function isBytes32Hex(value: unknown): value is Bytes32Hex {
  if (!isBytesHex(value)) {
    return false;
  }
  if (value.length !== 66) {
    return false;
  }
  return true;
}

export function isBytes65Hex(value: unknown): value is Bytes65Hex {
  if (!isBytesHex(value)) {
    return false;
  }
  if (value.length !== 132) {
    return false;
  }
  return true;
}

export function assertIsBytesHex(value: unknown): asserts value is BytesHex {
  if (!isBytesHex(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'BytesHex',
    });
  }
}

export function assertIsBytesHexNo0x(
  value: unknown,
): asserts value is BytesHexNo0x {
  if (!isBytesHexNo0x(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'BytesHexNo0x',
    });
  }
}

export function assertIsBytes65Hex(
  value: unknown,
): asserts value is Bytes65Hex {
  if (!isBytes65Hex(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Bytes65Hex',
    });
  }
}

export function assertIsBytes32Hex(
  value: unknown,
): asserts value is Bytes32Hex {
  if (!isBytes32Hex(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Bytes32Hex',
    });
  }
}

export function assertIsBytes32HexArray(
  value: unknown,
): asserts value is Bytes32Hex[] {
  if (!Array.isArray(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Bytes32HexArray',
    });
  }
  for (let i = 0; i < value.length; ++i) {
    if (!isBytes32Hex(value[i])) {
      throw new InvalidTypeError({
        type: typeof value[i],
        expectedType: 'Bytes32Hex',
      });
    }
  }
}

export function assertIsBytesHexArray(
  value: unknown,
): asserts value is BytesHex[] {
  if (!Array.isArray(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'BytesHexArray',
    });
  }
  for (let i = 0; i < value.length; ++i) {
    if (!isBytesHex(value[i])) {
      throw new InvalidTypeError({
        type: typeof value[i],
        expectedType: 'BytesHex',
      });
    }
  }
}

export function assertIsBytes65HexArray(
  value: unknown,
): asserts value is Bytes32Hex[] {
  if (!Array.isArray(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Bytes65HexArray',
    });
  }
  for (let i = 0; i < value.length; ++i) {
    if (!isBytes65Hex(value[i])) {
      throw new InvalidTypeError({
        type: typeof value[i],
        expectedType: 'Bytes65Hex',
      });
    }
  }
}

type RecordWithProperty<K extends string, T> = Record<string, unknown> & {
  [P in K]: T;
};

/**
 * Type guard that checks if a property exists on an object and is a valid hex bytes string.
 * A valid BytesHex string starts with "0x" followed by an even number of hexadecimal characters.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to check (can be any type)
 * @param property - The property name to check for
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
export function isRecordBytesHexProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordWithProperty<K, BytesHex> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return isBytesHex(o[property]);
}

/**
 * Assertion function that validates a property exists on an object and is a valid hex bytes string.
 * A valid BytesHex string must start with "0x" followed by an even number of hexadecimal characters.
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param objName - The name of the object being validated (used in error messages)
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
export function assertRecordBytesHexProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, BytesHex> {
  if (!isRecordBytesHexProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'BytesHex',
      type: typeofProperty(o, property),
    });
  }
}

export function isRecordBytesHexNo0xProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordWithProperty<K, BytesHexNo0x> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return isBytesHexNo0x(o[property]);
}

export function assertRecordBytesHexNo0xProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, BytesHexNo0x> {
  if (!isRecordBytesHexNo0xProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'BytesHexNo0x',
      type: typeofProperty(o, property),
    });
  }
}

export function isRecordBytes32HexProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordWithProperty<K, Bytes32Hex> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return isBytes32Hex(o[property]);
}

export function assertRecordBytes32HexProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, Bytes32Hex> {
  if (!isRecordBytes32HexProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'Bytes32Hex',
      type: typeofProperty(o, property),
    });
  }
}

export function assertRecordBytes32HexArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, Array<Bytes32Hex>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytes32Hex(arr[i])) {
      throw new InvalidPropertyError({
        objName,
        property: `${property}[${i}]`,
        expectedType: 'Bytes32Hex',
        type: typeof arr[i],
      });
    }
  }
}

export function assertRecordBytes65HexArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, Array<Bytes65Hex>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytes65Hex(arr[i])) {
      throw new InvalidPropertyError({
        objName,
        property: `${property}[${i}]`,
        expectedType: 'Bytes65Hex',
        type: typeof arr[i],
      });
    }
  }
}

/**
 * Assertion function that validates a property exists on an object, is an array,
 * and every element is a valid hex bytes string (with "0x" prefix).
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param objName - The name of the object being validated (used in error messages)
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
export function assertRecordBytesHexArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, Array<BytesHex>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytesHex(arr[i])) {
      throw new InvalidPropertyError({
        objName,
        property: `${property}[${i}]`,
        expectedType: 'BytesHex',
        type: typeof arr[i],
      });
    }
  }
}

/**
 * Assertion function that validates a property exists on an object, is an array,
 * and every element is a valid hex bytes string (without "0x" prefix).
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param objName - The name of the object being validated (used in error messages)
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
export function assertRecordBytesHexNo0xArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, Array<BytesHexNo0x>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytesHexNo0x(arr[i])) {
      throw new InvalidPropertyError({
        objName,
        property: `${property}[${i}]`,
        expectedType: 'BytesHexNo0x',
        type: typeof arr[i],
      });
    }
  }
}

type RecordUint8ArrayProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<Uint8Array>;
};

export function isRecordUint8ArrayProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordUint8ArrayProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return o[property] instanceof Uint8Array;
}

export function assertUint8ArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, Uint8Array> {
  if (!isRecordUint8ArrayProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'Uint8Array',
      type: typeofProperty(o, property),
    });
  }
}

/**
 * Convert a Uint8Array to a hex string (without 0x prefix).
 */
export function bytesToHexNo0x(bytes: Uint8Array): BytesHexNo0x {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Convert a Uint8Array to a hex string (with 0x prefix).
 */
export function bytesToHex(bytes: Uint8Array): BytesHex {
  return `0x${bytesToHexNo0x(bytes)}`;
}

export async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} on ${response.url}`,
    );
  }

  // Warning : bytes is not widely supported yet!
  const bytes: Uint8Array =
    typeof response.bytes === 'function'
      ? await response.bytes()
      : new Uint8Array(await response.arrayBuffer());

  return bytes;
}
