import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import { assertIsUint, assertRecordUintProperty, isUint } from './uint';

// npx jest --colors --passWithNoTests --coverage ./src/utils/uint.test.ts --collectCoverageFrom=./src/utils/uint.ts --testNamePattern=BBB
// npx jest --colors --passWithNoTests --coverage ./src/utils/uint.test.ts --collectCoverageFrom=./src/utils/uint.ts

describe('uint', () => {
  it('isUint', () => {
    expect(isUint('hello')).toEqual(false);
    expect(isUint(null)).toEqual(false);
    expect(isUint(undefined)).toEqual(false);
    expect(isUint('')).toEqual(false);
    expect(isUint('123')).toEqual(false);
    expect(isUint(123)).toEqual(true);
    expect(isUint(BigInt(123))).toEqual(true);
    expect(isUint(123.0)).toEqual(true);
    expect(isUint(123.1)).toEqual(false);
    expect(isUint(-123)).toEqual(false);
    expect(isUint(0)).toEqual(true);
    expect(isUint({})).toEqual(false);
    expect(isUint([])).toEqual(false);
    expect(isUint([123])).toEqual(false);
  });

  it('assertIsUint', () => {
    // True
    expect(() => assertIsUint(123.0)).not.toThrow();
    expect(() => assertIsUint(0)).not.toThrow();
    expect(() => assertIsUint(123)).not.toThrow();
    expect(() => assertIsUint(BigInt(123))).not.toThrow();

    const e = (type: string) =>
      new InvalidTypeError({
        expectedType: 'Uint',
        type,
      });

    // False
    expect(() => assertIsUint('hello')).toThrow(e('string'));
    expect(() => assertIsUint(null)).toThrow(e('object'));
    expect(() => assertIsUint(undefined)).toThrow(e('undefined'));
    expect(() => assertIsUint('')).toThrow(e('string'));
    expect(() => assertIsUint('123')).toThrow(e('string'));
    expect(() => assertIsUint(123.1)).toThrow(e('number'));
    expect(() => assertIsUint(-123)).toThrow(e('number'));
    expect(() => assertIsUint({})).toThrow(e('object'));
    expect(() => assertIsUint([])).toThrow(e('object'));
    expect(() => assertIsUint([123])).toThrow(e('object'));
  });

  it('assertRecordUintProperty', () => {
    // True
    expect(() =>
      assertRecordUintProperty({ foo: 123.0 }, 'foo', 'Foo'),
    ).not.toThrow();

    expect(() =>
      assertRecordUintProperty({ foo: 0 }, 'foo', 'Foo'),
    ).not.toThrow();

    expect(() =>
      assertRecordUintProperty({ foo: 123 }, 'foo', 'Foo'),
    ).not.toThrow();

    expect(() =>
      assertRecordUintProperty({ foo: BigInt(123) }, 'foo', 'Foo'),
    ).not.toThrow();

    const e = (expectedType: 'non-nullable' | 'Uint', type?: string) =>
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'foo',
        expectedType,
        type,
      });

    // False
    expect(() => assertRecordUintProperty({ foo: null }, 'foo', 'Foo')).toThrow(
      e('Uint', 'undefined'),
    );

    expect(() =>
      assertRecordUintProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(e('Uint', 'undefined'));

    expect(() => assertRecordUintProperty({}, 'foo', 'Foo')).toThrow(
      e('Uint', 'undefined'),
    );

    expect(() =>
      assertRecordUintProperty({ foo: 'hello' }, 'foo', 'Foo'),
    ).toThrow(e('Uint', 'string'));

    expect(() => assertRecordUintProperty({ foo: '' }, 'foo', 'Foo')).toThrow(
      e('Uint', 'string'),
    );

    expect(() =>
      assertRecordUintProperty({ foo: '123' }, 'foo', 'Foo'),
    ).toThrow(e('Uint', 'string'));

    expect(() =>
      assertRecordUintProperty({ foo: 123.1 }, 'foo', 'Foo'),
    ).toThrow(e('Uint', 'number'));

    expect(() => assertRecordUintProperty({ foo: -123 }, 'foo', 'Foo')).toThrow(
      e('Uint', 'number'),
    );

    expect(() => assertRecordUintProperty({ foo: {} }, 'foo', 'Foo')).toThrow(
      e('Uint', 'object'),
    );

    expect(() => assertRecordUintProperty({ foo: [] }, 'foo', 'Foo')).toThrow(
      e('Uint', 'object'),
    );

    expect(() =>
      assertRecordUintProperty({ foo: [123] }, 'foo', 'Foo'),
    ).toThrow(e('Uint', 'object'));
  });
});
