import { InvalidPropertyError } from '../errors/InvalidPropertyError';

type NonNullableRecordProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<unknown>;
};

export function isNonNullableRecordProperty<K extends string>(
  o: unknown,
  property: K,
): o is NonNullableRecordProperty<K> {
  if (
    !o ||
    typeof o !== 'object' ||
    !(property in o) ||
    (o as Record<string, unknown>)[property] === undefined ||
    (o as Record<string, unknown>)[property] === null
  ) {
    return false;
  }
  return true;
}

export function assertNonNullableRecordProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is NonNullableRecordProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'non-nullable',
      type: typeofProperty(o, property),
    });
  }
}

type RecordArrayProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<Array<unknown>>;
};

export function isRecordArrayProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordArrayProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return Array.isArray(o[property]);
}

export function assertRecordArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordArrayProperty<K> {
  if (!isRecordArrayProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'Array',
      type: typeofProperty(o, property),
    });
  }
}

type RecordBooleanProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<boolean>;
};

export function isRecordBooleanProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordBooleanProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return typeof o[property] === 'boolean';
}

export function assertRecordBooleanProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
  expectedValue?: boolean,
): asserts o is RecordBooleanProperty<K> {
  if (!isRecordBooleanProperty(o, property))
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'boolean',
      type: typeofProperty(o, property),
    });
  if (expectedValue !== undefined) {
    if (o[property] !== expectedValue) {
      throw new InvalidPropertyError({
        objName,
        property,
        expectedType: 'boolean',
        expectedValue: String(expectedValue),
        type: typeof o[property],
        value: String(o[property]),
      });
    }
  }
}

export function typeofProperty<K extends string>(
  o: unknown,
  property: K,
): string {
  if (isNonNullableRecordProperty(o, property)) {
    return typeof o[property];
  }
  return 'undefined';
}
