import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
} from './record';

export type BytesHex = `0x${string}`;
export type BytesHexNo0x = string;
export type Bytes32Hex = `0x${string}`;

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

export function assertIsBytesHex(value: unknown): asserts value is BytesHex {
  if (!isBytesHex(value)) {
    throw new RangeError('Invalid BytesHex');
  }
}

export function assertIsBytesHexNo0x(
  value: unknown,
): asserts value is BytesHexNo0x {
  if (!isBytesHexNo0x(value)) {
    throw new RangeError('Invalid BytesHex without 0x prefix');
  }
}

export function assertIsBytes32Hex(
  value: unknown,
): asserts value is Bytes32Hex {
  if (!isBytes32Hex(value)) {
    throw new RangeError('Invalid Bytes32Hex');
  }
}

type ObjectWithProperty<K extends string, T> = Record<string, unknown> & {
  [P in K]: T;
};

export function assertBytesHexProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, BytesHex> {
  assertNonNullableRecordProperty(o, property, objName);
  if (!isBytesHex(o[property])) {
    throw new Error(`Invalid bytes hex ${objName}.${property}`);
  }
}

export function assertBytesHexNo0xProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, BytesHexNo0x> {
  assertNonNullableRecordProperty(o, property, objName);
  if (!isBytesHexNo0x(o[property])) {
    throw new Error(
      `Invalid bytes hex without 0x prefix ${objName}.${property}`,
    );
  }
}

export function assertBytes32HexProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, Bytes32Hex> {
  assertNonNullableRecordProperty(o, property, objName);
  if (!isBytes32Hex(o[property])) {
    throw new Error(`Invalid bytes32 hex ${objName}.${property}`);
  }
}

export function assertBytes32HexArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, Array<Bytes32Hex>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytes32Hex(arr[i])) {
      throw new Error(`Invalid bytes32 hex ${objName}.${property}[${i}]`);
    }
  }
}

export function assertBytesHexArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, Array<BytesHex>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytesHex(arr[i])) {
      throw new Error(`Invalid bytes hex ${objName}.${property}[${i}]`);
    }
  }
}

export function assertBytesHexNo0xArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, Array<BytesHexNo0x>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytesHexNo0x(arr[i])) {
      throw new Error(
        `Invalid bytes hex without 0x prefix ${objName}.${property}[${i}]`,
      );
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
): asserts o is ObjectWithProperty<K, Uint8Array> {
  if (!isRecordUint8ArrayProperty(o, property)) {
    throw new Error(`Invalid Uint8Array ${objName}.${property}`);
  }
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
