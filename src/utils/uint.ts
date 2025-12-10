import { InvalidTypeError } from '../errors/InvalidTypeError';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { isNonNullableRecordProperty, typeofProperty } from './record';

type Uint = number | bigint;

export function isUint(value: any): value is Uint {
  if (typeof value === 'number') {
    if (value < 0) {
      return false;
    }
    return Number.isInteger(value);
  } else if (typeof value === 'bigint') {
    return value >= 0;
  }
  return false;
}

export function uintToHex(num: number): `0x${string}` {
  let hex = num.toString(16);
  return hex.length % 2 ? `0x0${hex}` : `0x${hex}`;
}

export function assertIsUint(value: unknown): asserts value is Uint {
  if (!isUint(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'Uint',
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
