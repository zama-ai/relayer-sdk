import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import {
  isRecordNonNullableProperty,
  assertRecordNonNullableProperty,
  isRecordArrayProperty,
  assertRecordArrayProperty,
  isRecordBooleanProperty,
  assertRecordBooleanProperty,
  typeofProperty,
} from './record';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/base/record.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/base/record.test.ts --collectCoverageFrom=./src/base/record.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/base/record.test.ts --collectCoverageFrom=./src/base/record.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('record', () => {
  //////////////////////////////////////////////////////////////////////////////

  it('isRecordNonNullableProperty', () => {
    // True
    expect(isRecordNonNullableProperty({ foo: 'bar' }, 'foo')).toBe(true);
    expect(isRecordNonNullableProperty({ foo: 0 }, 'foo')).toBe(true);
    expect(isRecordNonNullableProperty({ foo: false }, 'foo')).toBe(true);
    expect(isRecordNonNullableProperty({ foo: [] }, 'foo')).toBe(true);
    expect(isRecordNonNullableProperty({ foo: {} }, 'foo')).toBe(true);

    // False
    expect(isRecordNonNullableProperty({ foo: null }, 'foo')).toBe(false);
    expect(isRecordNonNullableProperty({ foo: undefined }, 'foo')).toBe(false);
    expect(isRecordNonNullableProperty({}, 'foo')).toBe(false);
    expect(isRecordNonNullableProperty(null, 'foo')).toBe(false);
    expect(isRecordNonNullableProperty(undefined, 'foo')).toBe(false);
    expect(isRecordNonNullableProperty('string', 'foo')).toBe(false);
    expect(isRecordNonNullableProperty(123, 'foo')).toBe(false);
    expect(isRecordNonNullableProperty([], 'foo')).toBe(false);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('assertRecordNonNullableProperty', () => {
    // True
    expect(() =>
      assertRecordNonNullableProperty({ foo: 'bar' }, 'foo', 'Foo'),
    ).not.toThrow();

    expect(() =>
      assertRecordNonNullableProperty({ foo: 0 }, 'foo', 'Foo'),
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
      assertRecordNonNullableProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() =>
      assertRecordNonNullableProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() => assertRecordNonNullableProperty('', 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() => assertRecordNonNullableProperty('', 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() => assertRecordNonNullableProperty(null, 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() =>
      assertRecordNonNullableProperty(undefined, 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() => assertRecordNonNullableProperty({}, 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() => assertRecordNonNullableProperty([], 'foo', 'Foo')).toThrow(
      missing(),
    );

    expect(() =>
      assertRecordNonNullableProperty(['foo'], 'foo', 'Foo'),
    ).toThrow(missing());

    expect(() => assertRecordNonNullableProperty('foo', 'foo', 'Foo')).toThrow(
      missing(),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('typeofProperty', () => {
    expect(typeofProperty({ foo: [] }, 'foo')).toBe('object');
    expect(typeofProperty({ foo: '123' }, 'foo')).toBe('string');
    expect(typeofProperty({ foo: 123 }, 'foo')).toBe('number');
    expect(typeofProperty('123', 'foo')).toBe('undefined');
    expect(typeofProperty(123, 'foo')).toBe('undefined');
    expect(typeofProperty(null, 'foo')).toBe('undefined');
    expect(typeofProperty(undefined, 'foo')).toBe('undefined');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('isRecordArrayProperty', () => {
    // True
    expect(isRecordArrayProperty({ foo: [] }, 'foo')).toBe(true);
    expect(isRecordArrayProperty({ foo: [1, 2, 3] }, 'foo')).toBe(true);
    expect(isRecordArrayProperty({ foo: ['a', 'b'] }, 'foo')).toBe(true);

    // False
    expect(isRecordArrayProperty({ foo: null }, 'foo')).toBe(false);
    expect(isRecordArrayProperty({ foo: undefined }, 'foo')).toBe(false);
    expect(isRecordArrayProperty({ foo: {} }, 'foo')).toBe(false);
    expect(isRecordArrayProperty({ foo: 'string' }, 'foo')).toBe(false);
    expect(isRecordArrayProperty({ foo: 123 }, 'foo')).toBe(false);
    expect(isRecordArrayProperty({}, 'foo')).toBe(false);
    expect(isRecordArrayProperty(null, 'foo')).toBe(false);
  });

  //////////////////////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////////////////////

  it('isRecordBooleanProperty', () => {
    // True
    expect(isRecordBooleanProperty({ foo: true }, 'foo')).toBe(true);
    expect(isRecordBooleanProperty({ foo: false }, 'foo')).toBe(true);

    // False
    expect(isRecordBooleanProperty({ foo: null }, 'foo')).toBe(false);
    expect(isRecordBooleanProperty({ foo: undefined }, 'foo')).toBe(false);
    expect(isRecordBooleanProperty({ foo: 'true' }, 'foo')).toBe(false);
    expect(isRecordBooleanProperty({ foo: 1 }, 'foo')).toBe(false);
    expect(isRecordBooleanProperty({ foo: 0 }, 'foo')).toBe(false);
    expect(isRecordBooleanProperty({}, 'foo')).toBe(false);
    expect(isRecordBooleanProperty(null, 'foo')).toBe(false);
  });

  //////////////////////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////////////////////

  it('assertRecordBooleanProperty with expectedValue', () => {
    // Valid with expectedValue
    expect(() =>
      assertRecordBooleanProperty({ foo: true }, 'foo', 'Foo', true),
    ).not.toThrow();

    expect(() =>
      assertRecordBooleanProperty({ foo: false }, 'foo', 'Foo', false),
    ).not.toThrow();

    // Invalid: value doesn't match expectedValue
    expect(() =>
      assertRecordBooleanProperty({ foo: false }, 'foo', 'Foo', true),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'foo',
        expectedType: 'boolean',
        expectedValue: 'true',
        type: 'boolean',
        value: 'false',
      }),
    );

    expect(() =>
      assertRecordBooleanProperty({ foo: true }, 'foo', 'Foo', false),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'foo',
        expectedType: 'boolean',
        expectedValue: 'false',
        type: 'boolean',
        value: 'true',
      }),
    );
  });
});
