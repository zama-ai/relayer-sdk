import { InvalidPropertyError } from '../errors/InvalidPropertyError';

type NonNullableRecordProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<unknown>;
};

/**
 * Type guard that checks if a property exists on an object and is non-null/non-undefined.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to check (can be any type)
 * @param property - The property name to check for
 * @returns True if `o` is an object with the specified property that is not null or undefined
 *
 * @example
 * ```typescript
 * const data: unknown = { name: "Alice", age: 30 };
 * if (isNonNullableRecordProperty(data, 'name')) {
 *   console.log(data.name); // OK
 * }
 * ```
 */
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

/**
 * Assertion function that validates a property exists on an object and is non-null/non-undefined.
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param objName - The name of the object being validated (used in error messages)
 * @throws {InvalidPropertyError} When the property is missing, null, or undefined
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processUser(data: unknown) {
 *   assertNonNullableRecordProperty(data, 'userId', 'user');
 *   console.log(data.userId);
 * }
 * ```
 */
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

/**
 * Type guard that checks if a property exists on an object and is an array.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to check (can be any type)
 * @param property - The property name to check for
 * @returns True if `o` is an object with the specified property that is a non-null array
 *
 * @example
 * ```typescript
 * const data: unknown = { items: [1, 2, 3], count: 42 };
 * if (isRecordArrayProperty(data, 'items')) {
 *   console.log(data.items.length); // OK
 *   data.items.forEach(item => console.log(item)); // OK
 * }
 * ```
 */
export function isRecordArrayProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordArrayProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return Array.isArray(o[property]);
}

/**
 * Assertion function that validates a property exists on an object and is an array.
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param objName - The name of the object being validated (used in error messages)
 * @throws {InvalidPropertyError} When the property is missing, null, or not an array
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * function processResults(data: unknown) {
 *   assertRecordArrayProperty(data, 'results', 'response');
 *   console.log(`Found ${data.results.length} results`);
 *   data.results.forEach(result => processResult(result));
 * }
 * ```
 */
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
