import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
} from './record';

export function ensure0x(s: string): `0x${string}` {
  return !s.startsWith('0x') ? `0x${s}` : (s as `0x${string}`);
}

type RecordStringProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<string>;
};

export function assertRecordStringProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
  expectedValue?: string,
): asserts o is RecordStringProperty<K> {
  assertNonNullableRecordProperty(o, property, objName);

  if (typeof o[property] !== 'string') {
    throw new Error(`Invalid string ${objName}.${property}`);
  }
  if (expectedValue !== undefined) {
    if (o[property] !== expectedValue) {
      throw new Error(
        `Invalid value for ${objName}.${property}. Expected '${expectedValue}'. Got '${o[property]}'.`,
      );
    }
  }
}

export function isRecordStringProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordStringProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return typeof o[property] !== 'string';
}

type RecordStringArrayProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<Array<string>>;
};

export function assertRecordStringArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordStringArrayProperty<K> {
  assertNonNullableRecordProperty(o, property, objName);
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (typeof arr[i] !== 'string') {
      throw new Error(`Invalid string ${objName}.${property}[${i}]`);
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
    throw new Error(`Invalid timestamp ${objName}.${property}`);
  }
  try {
    const d = Date.parse(o[property]);
    if (Number.isNaN(d)) {
      throw new Error(`Invalid timestamp ${objName}.${property}`);
    }
  } catch {
    throw new Error(`Invalid timestamp ${objName}.${property}`);
  }
}
