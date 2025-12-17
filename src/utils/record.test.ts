import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
  assertRecordBooleanProperty,
  typeofProperty,
} from './record';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage ./src/utils/record.test.ts --collectCoverageFrom=./src/utils/record.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/utils/record.test.ts --collectCoverageFrom=./src/utils/record.ts

describe('record', () => {
  it('assertNonNullableRecordProperty', () => {
    // True
    expect(() =>
      assertNonNullableRecordProperty({ foo: 'bar' }, 'foo', 'Foo'),
    ).not.toThrow();

    expect(() =>
      assertNonNullableRecordProperty({ foo: 0 }, 'foo', 'Foo'),
    ).not.toThrow();

    const missing = () => {
      return InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'foo',
        expectedType: 'non-nullable',
      });
    };

    // False
    expect(() =>
      assertNonNullableRecordProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() =>
      assertNonNullableRecordProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() => assertNonNullableRecordProperty('', 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() => assertNonNullableRecordProperty('', 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() => assertNonNullableRecordProperty(null, 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() =>
      assertNonNullableRecordProperty(undefined, 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() => assertNonNullableRecordProperty({}, 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() => assertNonNullableRecordProperty([], 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() =>
      assertNonNullableRecordProperty(['foo'], 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() => assertNonNullableRecordProperty('foo', 'foo', 'Foo')).toThrow(
      missing(),
    );
  });

  it('typeofProperty', () => {
    expect(typeofProperty({ foo: [] }, 'foo')).toBe('object');
    expect(typeofProperty({ foo: '123' }, 'foo')).toBe('string');
    expect(typeofProperty({ foo: 123 }, 'foo')).toBe('number');
    expect(typeofProperty('123', 'foo')).toBe('undefined');
    expect(typeofProperty(123, 'foo')).toBe('undefined');
    expect(typeofProperty(null, 'foo')).toBe('undefined');
    expect(typeofProperty(undefined, 'foo')).toBe('undefined');
  });

  it('assertRecordArrayProperty', () => {
    // True
    expect(() =>
      assertRecordArrayProperty({ foo: [] }, 'foo', 'Foo'),
    ).not.toThrow();

    expect(() =>
      assertRecordArrayProperty({ foo: ['123', 123] }, 'foo', 'Foo'),
    ).not.toThrow();

    const e = (expectedType: 'non-nullable' | 'Array', type?: string) => {
      return new InvalidPropertyError({
        objName: 'Foo',
        property: 'foo',
        expectedType,
        type,
      });
    };

    const missing = (expectedType: 'Array', type?: string) => {
      return InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'foo',
        expectedType,
        ...(type ? { type } : {}),
      });
    };

    // False
    expect(() =>
      assertRecordArrayProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(missing('Array', 'undefined'));

    expect(() =>
      assertRecordArrayProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(missing('Array', 'undefined'));

    expect(() => assertRecordArrayProperty({}, 'foo', 'Foo')).toThrow(
      missing('Array', 'undefined'),
    );

    expect(() => assertRecordArrayProperty(null, 'foo', 'Foo')).toThrow(
      missing('Array', 'undefined'),
    );

    expect(() =>
      assertRecordArrayProperty({ foo: 'hello' }, 'foo', 'Foo'),
    ).toThrow(e('Array', 'string'));

    expect(() => assertRecordArrayProperty({ foo: 123 }, 'foo', 'Foo')).toThrow(
      e('Array', 'number'),
    );
  });

  it('assertRecordBooleanProperty', () => {
    // True
    expect(() =>
      assertRecordBooleanProperty({ foo: true }, 'foo', 'Foo'),
    ).not.toThrow();

    expect(() =>
      assertRecordBooleanProperty({ foo: false }, 'foo', 'Foo'),
    ).not.toThrow();

    const e = (expectedType: 'non-nullable' | 'boolean', type?: string) => {
      return new InvalidPropertyError({
        objName: 'Foo',
        property: 'foo',
        expectedType,
        type,
      });
    };

    const missing = (expectedType: 'boolean', type?: string) => {
      return InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'foo',
        expectedType,
        ...(type ? { type } : {}),
      });
    };

    // False
    expect(() =>
      assertRecordBooleanProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(missing('boolean', 'undefined'));

    expect(() =>
      assertRecordBooleanProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(missing('boolean', 'undefined'));

    expect(() => assertRecordBooleanProperty({}, 'foo', 'Foo')).toThrow(
      missing('boolean', 'undefined'),
    );

    expect(() => assertRecordBooleanProperty(null, 'foo', 'Foo')).toThrow(
      missing('boolean', 'undefined'),
    );

    expect(() =>
      assertRecordBooleanProperty({ foo: 'hello' }, 'foo', 'Foo'),
    ).toThrow(e('boolean', 'string'));

    expect(() =>
      assertRecordBooleanProperty({ foo: 123 }, 'foo', 'Foo'),
    ).toThrow(e('boolean', 'number'));
  });
});
