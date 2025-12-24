import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
  typeofProperty,
} from './record';
import { InternalError } from '../errors/InternalError';

export function removeSuffix(s: string | undefined, suffix: string): string {
  if (!s) {
    return '';
  }
  if (suffix.length === 0) {
    return s;
  }
  return s.endsWith(suffix) ? s.slice(0, -suffix.length) : s;
}

export function is0x(s: unknown): s is `0x${string}` {
  return typeof s === 'string' && s.startsWith('0x');
}

export function isNo0x(s: unknown): s is string {
  return typeof s === 'string' && !s.startsWith('0x');
}

export function ensure0x(s: string): `0x${string}` {
  return !s.startsWith('0x') ? `0x${s}` : (s as `0x${string}`);
}

export function remove0x(s: string): string {
  return s.startsWith('0x') ? s.substring(2) : s;
}

export function assertIs0xString(s: unknown): asserts s is `0x${string}` {
  if (!(typeof s === 'string' && s.startsWith('0x'))) {
    throw new InternalError({ message: 'value is not a `0x${string}`' });
  }
}

type RecordStringProperty<K extends string> = Record<string, unknown> & {
  [P in K]: NonNullable<string>;
};

/**
 * Type guard that checks if a property exists on an object and is a string.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to check (can be any type)
 * @param property - The property name to check for
 * @returns True if `o` is an object with the specified property that is a non-null string
 *
 * @example
 * ```typescript
 * const data: unknown = { status: "active", count: 42 };
 * if (isRecordStringProperty(data, 'status')) {
 *   console.log(data.status.toUpperCase()); // OK
 * }
 * ```
 */
export function isRecordStringProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordStringProperty<K> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return typeof o[property] === 'string';
}

/**
 * Assertion function that validates a property exists on an object, is a string,
 * and optionally matches specific expected value(s).
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @template K - The property key type (string literal)
 * @param o - The value to validate (can be any type)
 * @param property - The property name to check for
 * @param objName - The name of the object being validated (used in error messages)
 * @param expectedValue - Optional specific string value or array of allowed values to match against
 * @throws {InvalidPropertyError} When the property is missing, not a string, or doesn't match expectedValue
 * @throws {never} No other errors are thrown
 *
 * @example
 * ```typescript
 * // Check property is a string (any value)
 * assertRecordStringProperty(data, 'name', 'user');
 *
 * // Check property equals a specific value
 * assertRecordStringProperty(data, 'status', 'response', 'active');
 *
 * // Check property is one of multiple allowed values
 * assertRecordStringProperty(data, 'status', 'response', ['queued', 'processing', 'completed']);
 * ```
 */
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
      // Check if value matches any of the allowed values
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

export function safeJSONstringify(
  o: unknown,
  space?: string | number | undefined,
): string {
  try {
    return JSON.stringify(
      o,
      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      space,
    );
  } catch {
    return '';
  }
}
