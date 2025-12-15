import { InvalidTypeError } from '../errors/InvalidTypeError';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { isNonNullableRecordProperty, typeofProperty } from './record';
import type { BytesHexNo0x } from './bytes';

type UintNumber = number;
type UintBigInt = bigint;
type Uint = UintNumber | UintBigInt;
type Uint32 = UintNumber | UintBigInt;
type Uint256 = UintNumber | UintBigInt;

export const MAX_UINT256 = BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
);
export const MAX_UINT8 = 0xff;

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

export function isUint32(value: unknown): value is Uint32 {
  if (!isUint(value)) {
    return false;
  }
  return value <= 0xffffffff;
}

export function isUint256(value: unknown): value is Uint256 {
  if (!isUint(value)) {
    return false;
  }
  return value <= MAX_UINT256;
}

export function uint32ToBytes32(uint32: Uint32): Uint8Array {
  if (!isUint32(uint32)) {
    throw new InvalidTypeError({ expectedType: 'Uint32' });
  }

  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);
  view.setUint32(28, Number(uint32), false);
  return new Uint8Array(buffer);
}

export function uintToHex(uint: Uint): `0x${string}` {
  let hex = uint.toString(16);
  return hex.length % 2 ? `0x0${hex}` : `0x${hex}`;
}

export function uintToHexNoPrefix(uint: Uint): BytesHexNo0x {
  let hex = uint.toString(16);
  return hex.length % 2 ? `0${hex}` : hex;
}

export function assertIsUint(value: unknown): asserts value is Uint {
  if (!isUint(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint',
    });
  }
}

export function assertIsUint32(value: unknown): asserts value is Uint {
  if (!isUint32(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint32',
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

type RecordUintProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<Uint>;
};

export function isRecordUintProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordUintProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return isUint(o[property]);
}

type ObjectWithProperty<K extends string, T> = Record<string, unknown> & {
  [P in K]: T;
};

export function assertRecordUintProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, Uint> {
  if (!isRecordUintProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      type: typeofProperty(o, property),
      expectedType: 'Uint',
    });
  }
}
