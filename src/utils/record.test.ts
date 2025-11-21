import { assertNonNullableRecordProperty } from './record';

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

    // False
    expect(() =>
      assertNonNullableRecordProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertNonNullableRecordProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() => assertNonNullableRecordProperty('', 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
    expect(() => assertNonNullableRecordProperty('', 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
    expect(() => assertNonNullableRecordProperty(null, 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
    expect(() =>
      assertNonNullableRecordProperty(undefined, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() => assertNonNullableRecordProperty({}, 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
    expect(() => assertNonNullableRecordProperty([], 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
    expect(() =>
      assertNonNullableRecordProperty(['foo'], 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() => assertNonNullableRecordProperty('foo', 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
  });
});
