import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
  typeofProperty,
} from './record';

export function ensure0x(s: string): `0x${string}` {
  return !s.startsWith('0x') ? `0x${s}` : (s as `0x${string}`);
}

type RecordStringProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<string>;
};

export function isRecordStringProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordStringProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return typeof o[property] === 'string';
}

export function assertRecordStringProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
  expectedValue?: string | string[],
): asserts o is RecordStringProperty<K> {
  if (!isRecordStringProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'string',
      expectedValue,
      type: typeofProperty(o, property),
    });
  }

  if (expectedValue !== undefined) {
    if (Array.isArray(expectedValue)) {
      // or
      for (let i = 0; i < expectedValue.length; ++i) {
        if (o[property] === expectedValue[i]) {
          return;
        }
      }

      throw new InvalidPropertyError({
        objName,
        property,
        expectedType: 'string',
        expectedValue,
        type: typeof o[property], // === "string"
        value: o[property],
      });
    } else {
      if (o[property] !== expectedValue) {
        throw new InvalidPropertyError({
          objName,
          property,
          expectedType: 'string',
          expectedValue,
          type: typeof o[property], // === "string"
          value: o[property],
        });
      }
    }
  }
}

type RecordStringArrayProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<Array<string>>;
};

export function assertRecordStringArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordStringArrayProperty<K> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (typeof arr[i] !== 'string') {
      throw new InvalidPropertyError({
        objName,
        property: `${property}[${i}]`,
        expectedType: 'string',
        type: typeof arr[i],
      });
    }
  }
}

type RecordTimestampProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<string>;
};

export function assertRecordTimestampProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordTimestampProperty<K> {
  assertNonNullableRecordProperty(o, property, objName);
  if (typeof o[property] !== 'string') {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'Timestamp',
      type: typeof o[property],
    });
  }
  try {
    const d = Date.parse(o[property]);
    if (Number.isNaN(d)) {
      throw new Error(`Invalid timestamp ${objName}.${property}`);
    }
  } catch {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'Timestamp',
      type: typeof o[property],
    });
  }
}
