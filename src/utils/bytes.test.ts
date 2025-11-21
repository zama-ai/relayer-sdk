import {
  assertBytesHexProperty,
  assertBytesHexArrayProperty,
  assertBytes32HexArrayProperty,
  assertBytes32HexProperty,
  assertIsBytes32Hex,
  assertIsBytesHex,
  isBytes32Hex,
  isBytesHex,
} from './bytes';

// npx jest --colors --passWithNoTests --coverage ./src/utils/bytes.test.ts --collectCoverageFrom=./src/utils/bytes.ts

describe('bytes', () => {
  it('isBytesHex', () => {
    // True
    expect(isBytesHex('0x')).toEqual(true);
    expect(isBytesHex('0x00')).toEqual(true);
    expect(isBytesHex('0xdeadbeef')).toEqual(true);
    // False
    expect(isBytesHex('deadbee')).toEqual(false);
    expect(isBytesHex('0x0')).toEqual(false);
    expect(isBytesHex('0xhello')).toEqual(false);
    expect(isBytesHex('0xdeadbee')).toEqual(false);
    expect(isBytesHex('0xdeadbeefzz')).toEqual(false);
    expect(isBytesHex('hello')).toEqual(false);
    expect(isBytesHex(null)).toEqual(false);
    expect(isBytesHex(undefined)).toEqual(false);
    expect(isBytesHex('')).toEqual(false);
    expect(isBytesHex('123')).toEqual(false);
    expect(isBytesHex(123)).toEqual(false);
    expect(isBytesHex(BigInt(123))).toEqual(false);
    expect(isBytesHex(123.0)).toEqual(false);
    expect(isBytesHex(123.1)).toEqual(false);
    expect(isBytesHex(-123)).toEqual(false);
    expect(isBytesHex(0)).toEqual(false);
    expect(isBytesHex({})).toEqual(false);
    expect(isBytesHex([])).toEqual(false);
    expect(isBytesHex([123])).toEqual(false);
  });

  it('assertIsBytesHex', () => {
    // True
    expect(() => assertIsBytesHex('0x')).not.toThrow(RangeError);
    expect(() => assertIsBytesHex('0x00')).not.toThrow(RangeError);
    expect(() => assertIsBytesHex('0xdeadbeef')).not.toThrow(RangeError);
    // False
    expect(() => assertIsBytesHex('deadbeef')).toThrow(RangeError);
    expect(() => assertIsBytesHex('0x0')).toThrow(RangeError);
    expect(() => assertIsBytesHex('0xhello')).toThrow(RangeError);
    expect(() => assertIsBytesHex('0xdeadbeefzz')).toThrow(RangeError);
    expect(() => assertIsBytesHex('0xdeadbee')).toThrow(RangeError);
    expect(() => assertIsBytesHex('hello')).toThrow(RangeError);
    expect(() => assertIsBytesHex(null)).toThrow(RangeError);
    expect(() => assertIsBytesHex(undefined)).toThrow(RangeError);
    expect(() => assertIsBytesHex('')).toThrow(RangeError);
    expect(() => assertIsBytesHex('123')).toThrow(RangeError);
    expect(() => assertIsBytesHex(123)).toThrow(RangeError);
    expect(() => assertIsBytesHex(BigInt(123))).toThrow(RangeError);
    expect(() => assertIsBytesHex(123.0)).toThrow(RangeError);
    expect(() => assertIsBytesHex(123.1)).toThrow(RangeError);
    expect(() => assertIsBytesHex(-123)).toThrow();
    expect(() => assertIsBytesHex(0)).toThrow(RangeError);
    expect(() => assertIsBytesHex({})).toThrow(RangeError);
    expect(() => assertIsBytesHex([])).toThrow(RangeError);
    expect(() => assertIsBytesHex([123])).toThrow(RangeError);
  });

  it('isBytes32Hex', () => {
    expect(isBytes32Hex('0x')).toEqual(false);
    expect(isBytes32Hex('0x00')).toEqual(false);
    expect(isBytes32Hex('0xdeadbeef')).toEqual(false);
    expect(isBytes32Hex('deadbee')).toEqual(false);
    expect(isBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeef')).toEqual(false);
    expect(isBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef')).toEqual(
      false,
    );
    expect(
      isBytes32Hex(
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ),
    ).toEqual(true);
  });

  it('assertIsBytes32Hex', () => {
    expect(() => assertIsBytes32Hex('0x')).toThrow(RangeError);
    expect(() => assertIsBytes32Hex('0x00')).toThrow(RangeError);
    expect(() => assertIsBytes32Hex('0xdeadbeef')).toThrow(RangeError);
    expect(() => assertIsBytes32Hex('deadbeef')).toThrow(RangeError);
    expect(() =>
      assertIsBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow(RangeError);
    expect(() =>
      assertIsBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow(RangeError);
    expect(() =>
      assertIsBytes32Hex(
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsBytes32Hex(
        'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ),
    ).toThrow(RangeError);
    expect(() =>
      assertIsBytes32Hex(
        'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefff',
      ),
    ).toThrow(RangeError);
  });

  it('assertBytes32HexProperty', () => {
    expect(() =>
      assertBytes32HexProperty(
        {
          foo: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        },
        'foo',
        'Foo',
      ),
    ).not.toThrow();
    expect(() => assertBytes32HexProperty({ foo: null }, 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
    expect(() =>
      assertBytes32HexProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertBytes32HexProperty(
        { foo: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid bytes32 hex Foo.foo');
    expect(() => assertBytes32HexProperty({}, 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
  });

  it('assertBytes32HexArrayProperty', () => {
    // True
    expect(() =>
      assertBytes32HexArrayProperty(
        {
          foo: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
        },
        'foo',
        'Foo',
      ),
    ).not.toThrow();
    // False
    expect(() =>
      assertBytes32HexArrayProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertBytes32HexArrayProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertBytes32HexArrayProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid array Foo.foo');
    expect(() =>
      assertBytes32HexArrayProperty(
        { foo: ['0xDeaDbeefdEAdbeef'] },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid bytes32 hex Foo.foo[0]');
  });

  it('assertBytesHexProperty', () => {
    expect(() =>
      assertBytesHexProperty(
        {
          foo: '0xdead',
        },
        'foo',
        'Foo',
      ),
    ).not.toThrow();
    expect(() => assertBytesHexProperty({ foo: null }, 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
    expect(() =>
      assertBytesHexProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertBytesHexProperty(
        { foo: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid bytes hex Foo.foo');
    expect(() =>
      assertBytesHexProperty({ foo: '0xdeadbee' }, 'foo', 'Foo'),
    ).toThrow('Invalid bytes hex Foo.foo');
    expect(() => assertBytesHexProperty({}, 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
  });

  it('assertBytesHexArrayProperty', () => {
    // True
    expect(() =>
      assertBytesHexArrayProperty(
        {
          foo: ['0xdeadbeef'],
        },
        'foo',
        'Foo',
      ),
    ).not.toThrow();
    // False
    expect(() =>
      assertBytesHexArrayProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertBytesHexArrayProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertBytesHexArrayProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid array Foo.foo');
    expect(() =>
      assertBytesHexArrayProperty({ foo: ['0xdeadbee'] }, 'foo', 'Foo'),
    ).toThrow('Invalid bytes hex Foo.foo[0]');
  });
});
