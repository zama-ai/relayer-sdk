import {
  assertChecksummedAddressArrayProperty,
  assertChecksummedAddressProperty,
  assertIsAddress,
  assertIsChecksummedAddress,
  isAddress,
  isChecksummedAddress,
} from './address';

// npx jest --colors --passWithNoTests --coverage ./src/utils/address.test.ts --collectCoverageFrom=./src/utils/address.ts

describe('address', () => {
  it('isAddress', () => {
    // True
    expect(isAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef')).toEqual(
      true,
    );
    // False
    expect(isAddress('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef')).toEqual(
      false,
    );
    expect(isAddress('0x')).toEqual(false);
    expect(isAddress('0xdeadbeef')).toEqual(false);
    expect(isAddress('deadbee')).toEqual(false);
    expect(isAddress('0x0')).toEqual(false);
    expect(isAddress('0xhello')).toEqual(false);
    expect(isAddress('0xdeadbee')).toEqual(false);
    expect(isAddress('0xdeadbeefzz')).toEqual(false);
    expect(isAddress('hello')).toEqual(false);
    expect(isAddress(null)).toEqual(false);
    expect(isAddress(undefined)).toEqual(false);
    expect(isAddress('')).toEqual(false);
    expect(isAddress('123')).toEqual(false);
    expect(isAddress(123)).toEqual(false);
    expect(isAddress(BigInt(123))).toEqual(false);
    expect(isAddress(123.0)).toEqual(false);
    expect(isAddress(123.1)).toEqual(false);
    expect(isAddress(-123)).toEqual(false);
    expect(isAddress(0)).toEqual(false);
    expect(isAddress({})).toEqual(false);
    expect(isAddress([])).toEqual(false);
    expect(isAddress([123])).toEqual(false);
  });

  it('isChecksummedAddress', () => {
    // True
    expect(
      isChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'),
    ).toEqual(true);
    // False
    expect(
      isChecksummedAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toEqual(false);
    expect(
      isChecksummedAddress('DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'),
    ).toEqual(false);
    expect(isChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEF')).toEqual(
      false,
    );
    expect(isChecksummedAddress([123])).toEqual(false);
  });

  it('assertIsAddress', () => {
    expect(() => assertIsAddress('0x')).toThrow(TypeError);
    expect(() =>
      assertIsAddress('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow();
    expect(() =>
      assertIsAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).not.toThrow();
  });

  it('assertIsChecksummedAddress', () => {
    expect(() => assertIsChecksummedAddress('0x')).toThrow(TypeError);
    expect(() =>
      assertIsChecksummedAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow(TypeError);
    expect(() =>
      assertIsChecksummedAddress('DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'),
    ).toThrow(TypeError);
    expect(() =>
      assertIsChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEF'),
    ).toThrow(TypeError);
    expect(() =>
      assertIsChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'),
    ).not.toThrow();
  });

  it('assertChecksummedAddressProperty', () => {
    expect(() =>
      assertChecksummedAddressProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertChecksummedAddressProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertChecksummedAddressProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertChecksummedAddressProperty(
        { foo: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid checksummed address Foo.foo');
    expect(() => assertChecksummedAddressProperty({}, 'foo', 'Foo')).toThrow(
      'Invalid Foo.foo',
    );
  });

  it('assertChecksummedAddressArrayProperty', () => {
    expect(() =>
      assertChecksummedAddressArrayProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertChecksummedAddressArrayProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow('Invalid Foo.foo');
    expect(() =>
      assertChecksummedAddressArrayProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid array Foo.foo');
    expect(() =>
      assertChecksummedAddressArrayProperty(
        { foo: ['0xDeaDbeefdEAdbeef'] },
        'foo',
        'Foo',
      ),
    ).toThrow('Invalid checksummed address Foo.foo[0]');
    expect(() =>
      assertChecksummedAddressArrayProperty(
        { foo: ['0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'] },
        'foo',
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertChecksummedAddressArrayProperty({ foo: [] }, 'foo', 'Foo'),
    ).not.toThrow();
  });
});
