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
    throw new Error(`Invalid ${objName}.${property}`);
  }
}

type RecordArrayProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<Array<unknown>>;
};

export function assertRecordArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordArrayProperty<K> {
  assertNonNullableRecordProperty(o, property, objName);
  if (!Array.isArray(o[property])) {
    throw new Error(`Invalid array ${objName}.${property}`);
  }
}

type RecordBooleanProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<boolean>;
};

export function assertRecordBooleanProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordBooleanProperty<K> {
  assertNonNullableRecordProperty(o, property, objName);
  if (typeof o[property] !== 'boolean') {
    throw new Error(`Invalid boolean ${objName}.${property}`);
  }
}
