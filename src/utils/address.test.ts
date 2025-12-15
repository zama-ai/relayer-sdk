import { AddressError } from '../errors/AddressError';
import { ChecksummedAddressError } from '../errors/ChecksummedAddressError';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import {
  assertRecordChecksummedAddressArrayProperty,
  assertRecordChecksummedAddressProperty,
  assertIsAddress,
  assertIsChecksummedAddress,
  isAddress,
  isChecksummedAddress,
} from './address';
import { TEST_CONFIG } from '../test/utils';
import { SepoliaConfig } from '..';

// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/utils/address.test.ts
// npx jest --colors --passWithNoTests ./src/utils/address.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests ./src/utils/address.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/utils/address.test.ts --collectCoverageFrom=./src/utils/address.ts
// npx jest --colors --passWithNoTests --coverage ./src/utils/address.test.ts --collectCoverageFrom=./src/utils/address.ts --testNamePattern=xxx
//

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
    expect(isAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbezz')).toEqual(
      false,
    );
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

  //////////////////////////////////////////////////////////////////////////////

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
    expect(
      isChecksummedAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbezz'),
    ).toEqual(false);

    expect(isChecksummedAddress([123])).toEqual(false);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('assertIsAddress', () => {
    // True
    expect(() =>
      assertIsAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).not.toThrow();

    // False
    expect(() => assertIsAddress('0x')).toThrow(
      new AddressError({ address: '0x' }),
    );

    expect(() =>
      assertIsAddress('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow(
      new AddressError({ address: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef' }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('assertIsChecksummedAddress', () => {
    // True
    expect(() =>
      assertIsChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'),
    ).not.toThrow();

    // False
    expect(() => assertIsChecksummedAddress('0x')).toThrow(
      new ChecksummedAddressError({ address: '0x' }),
    );

    expect(() =>
      assertIsChecksummedAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow(
      new ChecksummedAddressError({
        address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      }),
    );

    expect(() =>
      assertIsChecksummedAddress('DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'),
    ).toThrow(
      new ChecksummedAddressError({
        address: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
      }),
    );

    expect(() =>
      assertIsChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEF'),
    ).toThrow(
      new ChecksummedAddressError({
        address: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEF',
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('assertChecksummedAddressProperty', () => {
    // True
    expect(() =>
      assertRecordChecksummedAddressProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertRecordChecksummedAddressProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'ChecksummedAddress',
        type: 'undefined',
        property: 'foo',
      }),
    );

    expect(() =>
      assertRecordChecksummedAddressProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'ChecksummedAddress',
        type: 'undefined',
        property: 'foo',
      }),
    );

    expect(() =>
      assertRecordChecksummedAddressProperty(
        { foo: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'ChecksummedAddress',
        type: 'string',
        property: 'foo',
      }),
    );

    expect(() =>
      assertRecordChecksummedAddressProperty({}, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'ChecksummedAddress',
        property: 'foo',
        type: 'undefined',
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('assertChecksummedAddressArrayProperty', () => {
    // True
    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: ['0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'] },
        'foo',
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertRecordChecksummedAddressArrayProperty({ foo: [] }, 'foo', 'Foo'),
    ).not.toThrow();

    const e = (expectedType: 'non-nullable' | 'Array', type?: string) => {
      return new InvalidPropertyError({
        objName: 'Foo',
        property: 'foo',
        expectedType,
        type,
      });
    };

    // False
    expect(() =>
      assertRecordChecksummedAddressArrayProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(e('Array', 'undefined'));

    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: undefined },
        'foo',
        'Foo',
      ),
    ).toThrow(e('Array', 'undefined'));

    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow(e('Array', 'string'));

    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: ['0xDeaDbeefdEAdbeef'] },
        'foo',
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        index: 0,
        expectedType: 'ChecksummedAddress',
        property: 'foo',
        type: 'string',
      }),
    );
  });
});
