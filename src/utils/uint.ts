import { isNonNullableRecordProperty } from './record';

export function isUint(value: any): value is number {
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

export function assertIsUint(value: unknown): asserts value is number {
  if (!isUint(value)) {
    throw new RangeError('Invalid uint');
  }
}

type RecordUintProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<number>;
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
): asserts o is ObjectWithProperty<K, number> {
  if (!isRecordUintProperty(o, property)) {
    throw new Error(`Invalid uint ${objName}.${property}`);
  }
}
