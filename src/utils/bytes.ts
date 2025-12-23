import {
  Bytes,
  Bytes32,
  Bytes32Hex,
  Bytes32HexNo0x,
  Bytes65,
  Bytes65Hex,
  Bytes65HexNo0x,
  BytesHex,
  BytesHexNo0x,
} from '../types/primitives';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import {
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
  typeofProperty,
} from './record';
import { is0x, isNo0x, remove0x } from './string';

export function isBytes(value: unknown, bytewidth?: 32 | 65): value is Bytes {
  if (!value) {
    return false;
  }
  if (!(value instanceof Uint8Array)) {
    return false;
  }
  return bytewidth ? value.length === bytewidth : true;
}

export function isBytesHex(
  value: unknown,
  bytewidth?: 21 | 32 | 65,
): value is BytesHex {
  if (!is0x(value)) {
    return false;
  }

  if (bytewidth !== undefined && value.length !== 2 * bytewidth + 2) {
    return false;
  }

  if ((value.length - 2) % 2 !== 0) {
    return false;
  }

  const hexRegex = /^0x[a-fA-F0-9]*$/;
  if (!hexRegex.test(value)) {
    return false;
  }

  return true;
}

export function isBytesHexNo0x(
  value: unknown,
  bytewidth?: 32 | 65,
): value is BytesHexNo0x {
  if (!isNo0x(value)) {
    return false;
  }

  if (bytewidth !== undefined && value.length !== 2 * bytewidth) {
    return false;
  }

  if ((value.length - 2) % 2 !== 0) {
    return false;
  }

  const hexRegex = /^[a-fA-F0-9]*$/;
  if (!hexRegex.test(value)) {
    return false;
  }

  return true;
}

export function isBytes32Hex(value: unknown): value is Bytes32Hex {
  return isBytesHex(value, 32);
}

export function isBytes32HexNo0x(value: unknown): value is Bytes32HexNo0x {
  return isBytesHexNo0x(value, 32);
}

export function isBytes65Hex(value: unknown): value is Bytes65Hex {
  return isBytesHex(value, 65);
}

export function isBytes65HexNo0x(value: unknown): value is Bytes65HexNo0x {
  return isBytesHexNo0x(value, 65);
}

export function isBytes32(value: unknown): value is Bytes32 {
  return isBytes(value, 32);
}

export function isBytes65(value: unknown): value is Bytes65 {
  return isBytes(value, 65);
}

////////////////////////////////////////////////////////////////////////////////
// assert
////////////////////////////////////////////////////////////////////////////////

export function assertIsBytesHex(
  value: unknown,
  bytewidth?: 32 | 65,
): asserts value is BytesHex {
  if (!isBytesHex(value, bytewidth)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: `Bytes${bytewidth ?? ''}Hex` as
        | 'BytesHex'
        | 'Bytes32Hex'
        | 'Bytes65Hex',
    });
  }
}

export function assertIsBytesHexNo0x(
  value: unknown,
  bytewidth?: 32 | 65,
): asserts value is BytesHexNo0x {
  if (!isBytesHexNo0x(value, bytewidth)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: `Bytes${bytewidth ?? ''}HexNo0x` as
        | 'BytesHexNo0x'
        | 'Bytes32HexNo0x'
        | 'Bytes65HexNo0x',
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

export function assertIsBytes32(value: unknown): asserts value is Bytes32 {
  if (!isBytes32(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Bytes32',
    });
  }
}

export function assertIsBytes65(value: unknown): asserts value is Bytes65 {
  if (!isBytes65(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Bytes65',
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

////////////////////////////////////////////////////////////////////////////////
// Hex
////////////////////////////////////////////////////////////////////////////////

const HEX_CHARS: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
} as const;
Object.freeze(HEX_CHARS);

const HEX_BYTES: string[] = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0'),
);
Object.freeze(HEX_BYTES);

const HEX_CHARS_CODES = new Uint8Array([
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57, // '0'-'9'
  97,
  98,
  99,
  100,
  101,
  102, // 'a'-'f'
]);

/**
 * Convert a Uint8Array to a hex string (without 0x prefix).
 */
export function bytesToHexNo0x(bytes: Uint8Array | undefined): BytesHexNo0x {
  if (!bytes || bytes?.length === 0) {
    return '';
  }
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Convert a Uint8Array to a 0x prefixed hex string
 */
export function bytesToHex(bytes: Uint8Array | undefined): BytesHex {
  return `0x${bytesToHexNo0x(bytes)}`;
}

export function bytesToHexLarge(bytes: Uint8Array): BytesHex {
  const out = new Uint8Array(2 + bytes.length * 2);
  out[0] = 48; // '0'
  out[1] = 120; // 'x'

  for (let i = 0; i < bytes.length; i++) {
    const j = 2 + i * 2;
    out[j] = HEX_CHARS_CODES[bytes[i] >> 4];
    out[j + 1] = HEX_CHARS_CODES[bytes[i] & 0xf];
  }

  return new TextDecoder().decode(out) as BytesHex;
}

/**
 * Convert a hex string prefixed by 0x or not to a Uint8Array
 * Any invalid byte string is converted to 0
 * "0xzzff" = [0, 255]
 * "0xzfff" = [0, 255]
 */
export function hexToBytes(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  const arr = hexString.replace(/^(0x)/, '').match(/.{1,2}/g);
  if (!arr) return new Uint8Array();
  return Uint8Array.from(arr.map((byte) => parseInt(byte, 16)));
}

export function hexToBytes8(hexString: string): Uint8Array {
  return hexToBytes('0x' + remove0x(hexString).padStart(64, '0'));
}

export function hexToBytesFaster(
  hexString: string,
  strict: boolean = false,
): Uint8Array {
  const offset = hexString[0] === '0' && hexString[1] === 'x' ? 2 : 0;
  const len = hexString.length - offset;

  if (len % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }

  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < bytes.length; i++) {
    const hi = HEX_CHARS[hexString[offset + i * 2]];
    const lo = HEX_CHARS[hexString[offset + i * 2 + 1]];
    if ((hi === undefined || lo === undefined) && strict) {
      throw new Error(`Invalid hex character at position ${offset + i * 2}`);
    }
    bytes[i] = (hi << 4) | lo;
  }

  return bytes;
}

/**
 * Convert a Uint8Array to a bigint
 */
export function bytesToBigInt(byteArray: Uint8Array | undefined): bigint {
  if (!byteArray || byteArray.length === 0) {
    return BigInt(0);
  }
  let result = BigInt(0);
  for (let i = 0; i < byteArray.length; i++) {
    result = (result << BigInt(8)) | BigInt(byteArray[i]);
  }
  return result;
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

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

export function bytesEquals(a: Bytes, b: Bytes): boolean {
  if (!isBytes(a) || !isBytes(b)) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
