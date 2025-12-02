import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import {
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
  typeofProperty,
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

type RecordWithProperty<K extends string, T> = Record<string, unknown> & {
  [P in K]: T;
};

export function isRecordBytesHexProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordWithProperty<K, BytesHex> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return isBytesHex(o[property]);
}

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
