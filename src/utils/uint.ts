import type {
  Bytes32,
  Bytes8,
  BytesHex,
  BytesHexNo0x,
  Hex,
  Uint,
  Uint128,
  Uint16,
  Uint256,
  Uint32,
  Uint64,
  Uint8,
  UintBigInt,
  UintNumber,
} from '../types/primitives';
import type {
  RecordWithPropertyType,
  RecordUintPropertyType,
  RecordUint256PropertyType,
} from './private';
import { isRecordNonNullableProperty, typeofProperty } from './record';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { InvalidTypeError } from '../errors/InvalidTypeError';

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

// 2^8 - 1 = 255
export const MAX_UINT8 = 0xff;

// 2^16 - 1 = 65535
export const MAX_UINT16 = 0xffff;

// 2^32 - 1 = 4294967295
export const MAX_UINT32 = 0xffffffff;

// 2^64 - 1 = 18446744073709551615
export const MAX_UINT64 = 0xffffffffffffffffn;

// 2^128 - 1 = 340282366920938463463374607431768211455
export const MAX_UINT128 = 0xffffffffffffffffffffffffffffffffn;

// 2^256 - 1 = 115792089237316195423570985008687907853269984665640564039457584007913129639935
export const MAX_UINT256 =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

////////////////////////////////////////////////////////////////////////////////

export function isUintNumber(value: unknown): value is UintNumber {
  if (typeof value === 'number') {
    if (value < 0) {
      return false;
    }
    return Number.isInteger(value);
  }
  return false;
}

export function isUintBigInt(value: unknown): value is UintBigInt {
  if (typeof value === 'bigint') {
    return value >= 0;
  }
  return false;
}

export function isUint(value: unknown): value is Uint {
  if (isUintNumber(value)) {
    return true;
  } else if (isUintBigInt(value)) {
    return true;
  }
  return false;
}

export function isUint8(value: unknown): value is Uint8 {
  if (!isUint(value)) {
    return false;
  }
  return value <= MAX_UINT8;
}

export function isUint16(value: unknown): value is Uint16 {
  if (!isUint(value)) {
    return false;
  }
  return value <= MAX_UINT16;
}

export function isUint32(value: unknown): value is Uint32 {
  if (!isUint(value)) {
    return false;
  }
  return value <= MAX_UINT32;
}

export function isUint64(value: unknown): value is Uint64 {
  if (!isUint(value)) {
    return false;
  }
  return BigInt(value) <= MAX_UINT64;
}

export function isUint128(value: unknown): value is Uint128 {
  if (!isUint(value)) {
    return false;
  }
  return BigInt(value) <= MAX_UINT128;
}

export function isUint256(value: unknown): value is Uint256 {
  if (!isUint(value)) {
    return false;
  }
  return BigInt(value) <= MAX_UINT256;
}

////////////////////////////////////////////////////////////////////////////////
// Number Conversions
////////////////////////////////////////////////////////////////////////////////

export function numberToBytesHexNo0x(num: number): BytesHexNo0x {
  let hex = num.toString(16);
  return hex.length % 2 ? '0' + hex : hex;
}

export function numberToBytesHex(num: number): BytesHex {
  return `0x${numberToBytesHexNo0x(num)}`;
}

export function numberToBytes32(num: number): Bytes32 {
  if (!isUintNumber(num)) {
    throw new InvalidTypeError({ expectedType: 'Uint' });
  }

  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);
  view.setBigUint64(24, BigInt(num), false);
  return new Uint8Array(buffer);
}

export function numberToBytes8(num: number): Bytes8 {
  if (!isUintNumber(num)) {
    throw new InvalidTypeError({ expectedType: 'Uint' });
  }

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(num), false);
  return new Uint8Array(buffer);
}

////////////////////////////////////////////////////////////////////////////////
// Uint Conversions
////////////////////////////////////////////////////////////////////////////////

export function uintToHex(uint: Uint): Hex {
  return `0x${uint.toString(16)}`;
}

export function uintToBytesHex(uint: Uint): BytesHex {
  let hex = uint.toString(16);
  return hex.length % 2 ? `0x0${hex}` : `0x${hex}`;
}

export function uintToBytesHexNo0x(uint: Uint): BytesHexNo0x {
  let hex = uint.toString(16);
  return hex.length % 2 ? `0${hex}` : hex;
}

export function uint256ToBytes32(value: unknown): Bytes32 {
  if (!isUint256(value)) {
    throw new InvalidTypeError({ expectedType: 'Uint256' });
  }

  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);

  const v = BigInt(value);

  // Fill from right to left (big-endian), 8 bytes at a time
  view.setBigUint64(24, v & 0xffffffffffffffffn, false);
  view.setBigUint64(16, (v >> 64n) & 0xffffffffffffffffn, false);
  view.setBigUint64(8, (v >> 128n) & 0xffffffffffffffffn, false);
  view.setBigUint64(0, (v >> 192n) & 0xffffffffffffffffn, false);

  return new Uint8Array(buffer);
}

export function uint64ToBytes32(value: unknown): Bytes32 {
  if (!isUint64(value)) {
    throw new InvalidTypeError({ expectedType: 'Uint64' });
  }

  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);

  const v = BigInt(value);

  view.setBigUint64(24, v, false);

  return new Uint8Array(buffer);
}

////////////////////////////////////////////////////////////////////////////////
// Asserts
////////////////////////////////////////////////////////////////////////////////

export function assertIsUint(value: unknown): asserts value is Uint {
  if (!isUint(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint',
    });
  }
}

export function assertIsUint8(value: unknown): asserts value is Uint32 {
  if (!isUint8(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint8',
    });
  }
}

export function assertIsUint32(value: unknown): asserts value is Uint32 {
  if (!isUint32(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint32',
    });
  }
}

export function assertIsUint64(value: unknown): asserts value is Uint64 {
  if (!isUint64(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint64',
    });
  }
}

export function assertIsUint256(value: unknown): asserts value is Uint256 {
  if (!isUint256(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint256',
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Record property testing
////////////////////////////////////////////////////////////////////////////////

export function isRecordUintProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordUintPropertyType<K> {
  if (!isRecordNonNullableProperty(o, property)) {
    return false;
  }
  return isUint(o[property]);
}

export function assertRecordUintProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithPropertyType<K, Uint> {
  if (!isRecordUintProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      type: typeofProperty(o, property),
      expectedType: 'Uint',
    });
  }
}

export function isRecordUint256Property<K extends string>(
  o: unknown,
  property: K,
): o is RecordUint256PropertyType<K> {
  if (!isRecordNonNullableProperty(o, property)) {
    return false;
  }
  return isUint256(o[property]);
}

export function assertRecordUint256Property<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithPropertyType<K, Uint256> {
  if (!isRecordUint256Property(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      type: typeofProperty(o, property),
      expectedType: 'Uint256',
    });
  }
}
