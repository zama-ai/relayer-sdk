import { AddressError } from './errors/AddressError';
import { ChecksummedAddressError } from './errors/ChecksummedAddressError';
import { InvalidPropertyError } from './errors/InvalidPropertyError';
import {
  assertRecordChecksummedAddressArrayProperty,
  assertRecordChecksummedAddressProperty,
  assertIsAddress,
  assertIsChecksummedAddress,
  assertIsChecksummedAddressArray,
  checksummedAddressToBytes20,
  isAddress,
  isChecksummedAddress,
  isRecordChecksummedAddressProperty,
  ZERO_ADDRESS,
  asChecksummedAddress,
} from './address';
import { InvalidTypeError } from './errors/InvalidTypeError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/base/address.test.ts
// npx jest --colors --passWithNoTests ./src/base/address.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/base/address.test.ts --collectCoverageFrom=./src/base/address.ts
// npx jest --colors --passWithNoTests --coverage ./src/base/address.test.ts --collectCoverageFrom=./src/base/address.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

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
      assertIsAddress('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', {}),
    ).not.toThrow();

    // False
    expect(() => assertIsAddress('0x', {})).toThrow(
      new AddressError({ address: '0x' }, {}),
    );

    expect(() =>
      assertIsAddress('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', {}),
    ).toThrow(
      new AddressError(
        { address: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef' },
        {},
      ),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('assertIsChecksummedAddress', () => {
    // True
    expect(() =>
      assertIsChecksummedAddress(
        '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        {},
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsChecksummedAddress('0x', {})).toThrow(
      new ChecksummedAddressError({ address: '0x' }, {}),
    );

    expect(() =>
      assertIsChecksummedAddress(
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        {},
      ),
    ).toThrow(
      new ChecksummedAddressError(
        { address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' },
        {},
      ),
    );

    expect(() =>
      assertIsChecksummedAddress(
        'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        {},
      ),
    ).toThrow(
      new ChecksummedAddressError(
        { address: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        {},
      ),
    );

    expect(() =>
      assertIsChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEF', {}),
    ).toThrow(
      new ChecksummedAddressError(
        { address: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEF' },
        {},
      ),
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
        {},
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertRecordChecksummedAddressProperty({ foo: null }, 'foo', 'Foo', {}),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          expectedType: 'checksummedAddress',
          type: 'undefined',
          property: 'foo',
        },
        {},
      ),
    );

    expect(() =>
      assertRecordChecksummedAddressProperty(
        { foo: undefined },
        'foo',
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          expectedType: 'checksummedAddress',
          type: 'undefined',
          property: 'foo',
        },
        {},
      ),
    );

    expect(() =>
      assertRecordChecksummedAddressProperty(
        { foo: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
        {},
      ),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          expectedType: 'checksummedAddress',
          property: 'foo',
          value: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          type: 'checksummedAddress',
        },
        {},
      ),
    );

    expect(() =>
      assertRecordChecksummedAddressProperty({}, 'foo', 'Foo', {}),
    ).toThrow(
      new InvalidPropertyError(
        {
          subject: 'Foo',
          expectedType: 'checksummedAddress',
          property: 'foo',
          type: 'undefined',
        },
        {},
      ),
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
        {},
      ),
    ).not.toThrow();

    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: [] },
        'foo',
        'Foo',
        {},
      ),
    ).not.toThrow();

    const e = (expectedType: 'non-nullable' | 'Array', type?: string) => {
      return new InvalidPropertyError(
        {
          subject: 'Foo',
          property: 'foo',
          expectedType,
          type,
        },
        {},
      );
    };

    // False
    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: null },
        'foo',
        'Foo',
        {},
      ),
    ).toThrow(e('Array', 'undefined'));

    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: undefined },
        'foo',
        'Foo',
        {},
      ),
    ).toThrow(e('Array', 'undefined'));

    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
        {},
      ),
    ).toThrow(e('Array', 'string'));

    expect(() =>
      assertRecordChecksummedAddressArrayProperty(
        { foo: ['0xDeaDbeefdEAdbeef'] },
        'foo',
        'Foo',
        {},
      ),
    ).toThrow(
      new ChecksummedAddressError(
        {
          address: '0xDeaDbeefdEAdbeef',
        },
        {},
      ),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('checksummedAddressToBytes20', () => {
    // Valid checksummed address - zero address
    const zeroAddress = ZERO_ADDRESS;
    const zeroBytes = checksummedAddressToBytes20(zeroAddress);
    expect(zeroBytes).toBeInstanceOf(Uint8Array);
    expect(zeroBytes.length).toBe(20);
    expect(zeroBytes.every((b) => b === 0)).toBe(true);

    // Valid checksummed address - all 0xff
    const maxAddress = asChecksummedAddress(
      '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
    );

    const maxBytes = checksummedAddressToBytes20(maxAddress);
    expect(maxBytes.length).toBe(20);
    expect(maxBytes.every((b) => b === 0xff)).toBe(true);

    // Valid checksummed address - specific pattern
    const deadbeefAddress = asChecksummedAddress(
      '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
    );

    const deadbeefBytes = checksummedAddressToBytes20(deadbeefAddress);
    expect(deadbeefBytes.length).toBe(20);
    expect(deadbeefBytes[0]).toBe(0xde);
    expect(deadbeefBytes[1]).toBe(0xad);
    expect(deadbeefBytes[2]).toBe(0xbe);
    expect(deadbeefBytes[3]).toBe(0xef);

    // Valid checksummed address - verify full byte array
    const testAddress = asChecksummedAddress(
      '0x1234567890AbcdEF1234567890aBcdef12345678',
    );

    const testBytes = checksummedAddressToBytes20(testAddress);
    expect(Array.from(testBytes)).toEqual([
      0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78,
      0x90, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78,
    ]);

    // Invalid address - missing 0x prefix
    expect(() =>
      checksummedAddressToBytes20(
        asChecksummedAddress('DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'),
      ),
    ).toThrow(
      new ChecksummedAddressError(
        { address: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        {},
      ),
    );

    // Invalid address - too short
    expect(() =>
      checksummedAddressToBytes20(asChecksummedAddress('0xDeaDbeefdEAdbeef')),
    ).toThrow(
      new ChecksummedAddressError({ address: '0xDeaDbeefdEAdbeef' }, {}),
    );

    // Invalid address - invalid hex characters
    expect(() =>
      checksummedAddressToBytes20(
        asChecksummedAddress('0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDzzzz'),
      ),
    ).toThrow(
      new ChecksummedAddressError(
        { address: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDzzzz' },
        {},
      ),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('assertIsChecksummedAddressArray', () => {
    const validAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';

    // Valid arrays
    expect(() => assertIsChecksummedAddressArray([], {})).not.toThrow();
    expect(() =>
      assertIsChecksummedAddressArray([validAddress], {}),
    ).not.toThrow();
    expect(() =>
      assertIsChecksummedAddressArray([validAddress, ZERO_ADDRESS], {}),
    ).not.toThrow();

    // Invalid: not an array
    expect(() => assertIsChecksummedAddressArray(null, {})).toThrow(
      new InvalidTypeError(
        {
          type: 'object',
          expectedType: 'checksummedAddress[]',
        },
        {},
      ),
    );
    expect(() => assertIsChecksummedAddressArray(undefined, {})).toThrow(
      new InvalidTypeError(
        {
          type: 'undefined',
          expectedType: 'checksummedAddress[]',
        },
        {},
      ),
    );
    expect(() => assertIsChecksummedAddressArray('string', {})).toThrow(
      new InvalidTypeError(
        {
          type: 'string',
          expectedType: 'checksummedAddress[]',
        },
        {},
      ),
    );
    expect(() => assertIsChecksummedAddressArray(validAddress, {})).toThrow(
      InvalidTypeError,
    );

    // Invalid: array with invalid elements
    expect(() =>
      assertIsChecksummedAddressArray(
        ['0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'],
        {},
      ),
    ).toThrow(ChecksummedAddressError);

    expect(() =>
      assertIsChecksummedAddressArray([validAddress, '0xinvalid'], {}),
    ).toThrow(ChecksummedAddressError);

    expect(() =>
      assertIsChecksummedAddressArray(['not-an-address'], {}),
    ).toThrow(ChecksummedAddressError);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('isRecordChecksummedAddressProperty', () => {
    const validAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';

    // True
    expect(
      isRecordChecksummedAddressProperty({ foo: validAddress }, 'foo'),
    ).toBe(true);
    expect(
      isRecordChecksummedAddressProperty({ foo: ZERO_ADDRESS }, 'foo'),
    ).toBe(true);

    // False - not checksummed
    expect(
      isRecordChecksummedAddressProperty(
        { foo: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' },
        'foo',
      ),
    ).toBe(false);

    // False - missing property
    expect(isRecordChecksummedAddressProperty({}, 'foo')).toBe(false);

    // False - null/undefined
    expect(isRecordChecksummedAddressProperty({ foo: null }, 'foo')).toBe(
      false,
    );
    expect(isRecordChecksummedAddressProperty({ foo: undefined }, 'foo')).toBe(
      false,
    );

    // False - not an object
    expect(isRecordChecksummedAddressProperty(null, 'foo')).toBe(false);
    expect(isRecordChecksummedAddressProperty(undefined, 'foo')).toBe(false);

    // False - wrong type
    expect(isRecordChecksummedAddressProperty({ foo: 123 }, 'foo')).toBe(false);
    expect(isRecordChecksummedAddressProperty({ foo: [] }, 'foo')).toBe(false);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('isChecksummedAddress with 50 random addresses', () => {
    // 50 valid EIP-55 checksummed addresses (verified with ethers.getAddress)
    const checksummedAddresses = [
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
      '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
      '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
      '0x0000000000085d4780B73119b644AE5ecd22b376',
      '0x4E15361FD6b4BB609Fa63C81A2be19d873717870',
      '0x408e41876cCCDC0F92210600ef50372656052a38',
      '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
      '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD',
      '0x1985365e9f78359a9B6AD760e32412f4a445E862',
      '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      '0x5Ca381bBfb58f0092df149bD3D243b08B9a8386e',
      '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
      '0xF411903cbC70a74d22900a5DE66A2dda66507255',
      '0xfF20817765cB7f73d4bde2e66e067E58D11095C2',
      '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF',
      '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671',
      '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
      '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
      '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
      '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
      '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
      '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',
      '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
      '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5',
      '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
      '0x6c6EE5e31d828De241282B9606C8e98Ea48526E2',
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
    ];

    expect(checksummedAddresses.length).toBe(50);

    for (const address of checksummedAddresses) {
      expect(isChecksummedAddress(address)).toBe(true);
    }
  });

  //////////////////////////////////////////////////////////////////////////////

  it('isChecksummedAddress rejects corrupted addresses (uppercase -> lowercase)', () => {
    // 50 valid EIP-55 checksummed addresses
    const checksummedAddresses = [
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
      '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
      '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
      '0x0000000000085d4780B73119b644AE5ecd22b376',
      '0x4E15361FD6b4BB609Fa63C81A2be19d873717870',
      '0x408e41876cCCDC0F92210600ef50372656052a38',
      '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
      '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD',
      '0x1985365e9f78359a9B6AD760e32412f4a445E862',
      '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      '0x5Ca381bBfb58f0092df149bD3D243b08B9a8386e',
      '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
      '0xF411903cbC70a74d22900a5DE66A2dda66507255',
      '0xfF20817765cB7f73d4bde2e66e067E58D11095C2',
      '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF',
      '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671',
      '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
      '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
      '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
      '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
      '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
      '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',
      '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
      '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5',
      '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
      '0x6c6EE5e31d828De241282B9606C8e98Ea48526E2',
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
    ];

    // Helper to corrupt an address by changing the first uppercase letter to lowercase
    function corruptAddress(address: string): string | null {
      for (let i = 2; i < address.length; i++) {
        const char = address[i];
        if (char >= 'A' && char <= 'F') {
          return (
            address.slice(0, i) + char.toLowerCase() + address.slice(i + 1)
          );
        }
      }
      // No uppercase letter found (e.g., all-numeric addresses like 0x1111...)
      return null;
    }

    let testedCount = 0;
    for (const address of checksummedAddresses) {
      const corrupted = corruptAddress(address);
      if (corrupted !== null) {
        expect(isChecksummedAddress(corrupted)).toBe(false);
        testedCount++;
      }
    }

    // Ensure we tested a meaningful number of addresses
    expect(testedCount).toBeGreaterThanOrEqual(46);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('isAddress with 50 addresses (checksummed, lowercase, corrupted)', () => {
    // 50 valid EIP-55 checksummed addresses
    const checksummedAddresses = [
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
      '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
      '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
      '0x0000000000085d4780B73119b644AE5ecd22b376',
      '0x4E15361FD6b4BB609Fa63C81A2be19d873717870',
      '0x408e41876cCCDC0F92210600ef50372656052a38',
      '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
      '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD',
      '0x1985365e9f78359a9B6AD760e32412f4a445E862',
      '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
      '0x5Ca381bBfb58f0092df149bD3D243b08B9a8386e',
      '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
      '0xF411903cbC70a74d22900a5DE66A2dda66507255',
      '0xfF20817765cB7f73d4bde2e66e067E58D11095C2',
      '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF',
      '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671',
      '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
      '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
      '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
      '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
      '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
      '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',
      '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
      '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5',
      '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
      '0x6c6EE5e31d828De241282B9606C8e98Ea48526E2',
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
    ];

    // Helper to corrupt an address by changing the first uppercase letter to lowercase
    function corruptAddress(address: string): string | null {
      for (let i = 2; i < address.length; i++) {
        const char = address[i];
        if (char >= 'A' && char <= 'F') {
          return (
            address.slice(0, i) + char.toLowerCase() + address.slice(i + 1)
          );
        }
      }
      return null;
    }

    expect(checksummedAddresses.length).toBe(50);

    for (const address of checksummedAddresses) {
      // Valid checksummed addresses should pass isAddress
      expect(isAddress(address)).toBe(true);

      // Lowercase addresses should pass isAddress
      expect(isAddress(address.toLowerCase())).toBe(true);

      // Corrupted addresses (invalid checksum) should fail isAddress
      const corrupted = corruptAddress(address);
      if (corrupted !== null) {
        expect(isAddress(corrupted)).toBe(false);
      }
    }
  });
});
