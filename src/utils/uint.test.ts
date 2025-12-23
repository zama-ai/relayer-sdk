import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import {
  assertIsUint,
  assertIsUint8,
  assertIsUint32,
  assertIsUint64,
  assertIsUint256,
  assertRecordUintProperty,
  isUint,
  isUint8,
  isUint32,
  isUint64,
  MAX_UINT8,
  MAX_UINT32,
  MAX_UINT64,
  MAX_UINT256,
  numberToBytes32,
  numberToBytes8,
  numberToHexNo0x,
  uintToHex,
  uintToHexNo0x,
} from './uint';

// Jest Command line
// =================
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

describe('numberToBytes32', () => {
  it('converts 0 to 32 zero bytes', () => {
    const result = numberToBytes32(0);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    expect(result.every((b) => b === 0)).toBe(true);
  });

  it('converts 1 to bytes32 with last byte = 1', () => {
    const result = numberToBytes32(1);
    expect(result.length).toBe(32);
    expect(result[31]).toBe(1);
    //Uint8Array(32) [0, 0, ..., 0, 0, 0, 0, 0, 1]
    expect(result.slice(0, 31).every((b) => b === 0)).toBe(true);
  });

  it('converts 123 (0x7b) correctly', () => {
    const result = numberToBytes32(123);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    //Uint8Array(32) [0, 0, ..., 0, 0, 0, 0, 0, 123]
    expect(result[31]).toBe(123);
    expect(result.slice(0, 31).every((b) => b === 0)).toBe(true);
  });

  it('converts 255 (0xff) correctly', () => {
    const result = numberToBytes32(255);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    expect(result[31]).toBe(255);
    expect(result.slice(0, 31).every((b) => b === 0)).toBe(true);
  });

  it('converts 256 (0x100) correctly', () => {
    const result = numberToBytes32(256);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    expect(result[30]).toBe(1);
    expect(result[31]).toBe(0);
  });

  it('converts 65535 (0xffff) correctly', () => {
    const result = numberToBytes32(65535);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    expect(result[30]).toBe(255);
    expect(result[31]).toBe(255);
  });

  it('converts 0x01020304 correctly (big-endian)', () => {
    const result = numberToBytes32(0x01020304);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    expect(result[28]).toBe(1);
    expect(result[29]).toBe(2);
    expect(result[30]).toBe(3);
    expect(result[31]).toBe(4);
  });

  it('converts MAX_SAFE_INTEGER correctly', () => {
    const result = numberToBytes32(Number.MAX_SAFE_INTEGER);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(32);
    // MAX_SAFE_INTEGER = 2^53 - 1 = 0x1FFFFFFFFFFFFF (7 bytes)
    // Stored in bytes 25-31 (big-endian in last 8 bytes)
    const view = new DataView(result.buffer);
    const value = view.getBigUint64(24, false);
    expect(value).toBe(BigInt(Number.MAX_SAFE_INTEGER));
  });

  it('throws for negative numbers', () => {
    expect(() => numberToBytes32(-1)).toThrow(InvalidTypeError);
    expect(() => numberToBytes32(-100)).toThrow(InvalidTypeError);
  });

  it('throws for non-integer numbers', () => {
    expect(() => numberToBytes32(1.5)).toThrow(InvalidTypeError);
    expect(() => numberToBytes32(0.1)).toThrow(InvalidTypeError);
    expect(() => numberToBytes32(123.456)).toThrow(InvalidTypeError);
  });

  it('throws for NaN', () => {
    expect(() => numberToBytes32(NaN)).toThrow(InvalidTypeError);
  });

  it('throws for Infinity', () => {
    expect(() => numberToBytes32(Infinity)).toThrow(InvalidTypeError);
    expect(() => numberToBytes32(-Infinity)).toThrow(InvalidTypeError);
  });
});

describe('numberToBytes8', () => {
  it('converts 0 to 8 zero bytes', () => {
    const result = numberToBytes8(0);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    expect(result.every((b) => b === 0)).toBe(true);
  });

  it('converts 1 to bytes8 with last byte = 1', () => {
    const result = numberToBytes8(1);
    expect(result.length).toBe(8);
    expect(result[7]).toBe(1);
    //Uint8Array(8) [0, 0, 0, 0, 0, 0, 0, 1]
    expect(result.slice(0, 7).every((b) => b === 0)).toBe(true);
  });

  it('converts 123 (0x7b) correctly', () => {
    const result = numberToBytes8(123);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    //Uint8Array(8) [0, 0, 0, 0, 0, 0, 0, 123]
    expect(result[7]).toBe(123);
    expect(result.slice(0, 7).every((b) => b === 0)).toBe(true);
  });

  it('converts 255 (0xff) correctly', () => {
    const result = numberToBytes8(255);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    expect(result[7]).toBe(255);
    expect(result.slice(0, 7).every((b) => b === 0)).toBe(true);
  });

  it('converts 256 (0x100) correctly', () => {
    const result = numberToBytes8(256);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    expect(result[6]).toBe(1);
    expect(result[7]).toBe(0);
  });

  it('converts 65535 (0xffff) correctly', () => {
    const result = numberToBytes8(65535);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    expect(result[6]).toBe(255);
    expect(result[7]).toBe(255);
  });

  it('converts 0x01020304 correctly (big-endian)', () => {
    const result = numberToBytes8(0x01020304);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    expect(result[4]).toBe(1);
    expect(result[5]).toBe(2);
    expect(result[6]).toBe(3);
    expect(result[7]).toBe(4);
  });

  it('converts MAX_SAFE_INTEGER correctly', () => {
    const result = numberToBytes8(Number.MAX_SAFE_INTEGER);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    // MAX_SAFE_INTEGER = 2^53 - 1 = 0x1FFFFFFFFFFFFF (7 bytes)
    // Stored in bytes 25-31 (big-endian in last 8 bytes)
    const view = new DataView(result.buffer);
    const value = view.getBigUint64(0, false);
    expect(value).toBe(BigInt(Number.MAX_SAFE_INTEGER));
  });

  it('throws for negative numbers', () => {
    expect(() => numberToBytes8(-1)).toThrow(InvalidTypeError);
    expect(() => numberToBytes8(-100)).toThrow(InvalidTypeError);
  });

  it('throws for non-integer numbers', () => {
    expect(() => numberToBytes8(1.5)).toThrow(InvalidTypeError);
    expect(() => numberToBytes8(0.1)).toThrow(InvalidTypeError);
    expect(() => numberToBytes8(123.456)).toThrow(InvalidTypeError);
  });

  it('throws for NaN', () => {
    expect(() => numberToBytes8(NaN)).toThrow(InvalidTypeError);
  });

  it('throws for Infinity', () => {
    expect(() => numberToBytes8(Infinity)).toThrow(InvalidTypeError);
    expect(() => numberToBytes8(-Infinity)).toThrow(InvalidTypeError);
  });
});

describe('isUint8', () => {
  // Valid uint8 values
  it('returns true for 0', () => {
    expect(isUint8(0)).toBe(true);
  });

  it('returns true for 1', () => {
    expect(isUint8(1)).toBe(true);
  });

  it('returns true for MAX_UINT8 (255)', () => {
    expect(isUint8(MAX_UINT8)).toBe(true);
    expect(isUint8(255)).toBe(true);
  });

  it('returns true for BigInt values within range', () => {
    expect(isUint8(BigInt(0))).toBe(true);
    expect(isUint8(BigInt(255))).toBe(true);
    expect(isUint8(BigInt(128))).toBe(true);
  });

  // Boundary: just over MAX_UINT8
  it('returns false for 256 (MAX_UINT8 + 1)', () => {
    expect(isUint8(256)).toBe(false);
    expect(isUint8(BigInt(256))).toBe(false);
  });

  // Invalid types
  it('returns false for non-uint values', () => {
    expect(isUint8(-1)).toBe(false);
    expect(isUint8(-128)).toBe(false);
    expect(isUint8(1.5)).toBe(false);
    expect(isUint8('255')).toBe(false);
    expect(isUint8(null)).toBe(false);
    expect(isUint8(undefined)).toBe(false);
    expect(isUint8({})).toBe(false);
  });

  // Large values
  it('returns false for values much larger than MAX_UINT8', () => {
    expect(isUint8(1000)).toBe(false);
    expect(isUint8(MAX_UINT32)).toBe(false);
    expect(isUint8(MAX_UINT64)).toBe(false);
  });
});

describe('isUint32', () => {
  // Valid uint32 values
  it('returns true for 0', () => {
    expect(isUint32(0)).toBe(true);
  });

  it('returns true for 1', () => {
    expect(isUint32(1)).toBe(true);
  });

  it('returns true for MAX_UINT8 (255)', () => {
    expect(isUint32(255)).toBe(true);
  });

  it('returns true for MAX_UINT32 (0xffffffff)', () => {
    expect(isUint32(MAX_UINT32)).toBe(true);
    expect(isUint32(0xffffffff)).toBe(true);
  });

  it('returns true for BigInt values within range', () => {
    expect(isUint32(BigInt(0))).toBe(true);
    expect(isUint32(BigInt(MAX_UINT32))).toBe(true);
    expect(isUint32(BigInt(0x80000000))).toBe(true); // 2^31
  });

  // Boundary: just over MAX_UINT32
  it('returns false for 0x100000000 (MAX_UINT32 + 1)', () => {
    expect(isUint32(0x100000000)).toBe(false);
    expect(isUint32(BigInt(0x100000000))).toBe(false);
  });

  // Invalid types
  it('returns false for non-uint values', () => {
    expect(isUint32(-1)).toBe(false);
    expect(isUint32(-0x80000000)).toBe(false);
    expect(isUint32(1.5)).toBe(false);
    expect(isUint32('4294967295')).toBe(false);
    expect(isUint32(null)).toBe(false);
    expect(isUint32(undefined)).toBe(false);
    expect(isUint32({})).toBe(false);
  });

  // Large values
  it('returns false for values larger than MAX_UINT32', () => {
    expect(isUint32(MAX_UINT64)).toBe(false);
    expect(isUint32(Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});

describe('isUint64', () => {
  // Valid uint64 values
  it('returns true for 0', () => {
    expect(isUint64(0)).toBe(true);
  });

  it('returns true for 1', () => {
    expect(isUint64(1)).toBe(true);
  });

  it('returns true for MAX_UINT8 (255)', () => {
    expect(isUint64(255)).toBe(true);
  });

  it('returns true for MAX_UINT32', () => {
    expect(isUint64(MAX_UINT32)).toBe(true);
  });

  it('returns true for MAX_UINT64 (2^64 - 1)', () => {
    expect(isUint64(MAX_UINT64)).toBe(true);
  });

  it('returns true for Number.MAX_SAFE_INTEGER', () => {
    expect(isUint64(Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  it('returns true for BigInt values within range', () => {
    expect(isUint64(BigInt(0))).toBe(true);
    expect(isUint64(BigInt(MAX_UINT32))).toBe(true);
    expect(isUint64(MAX_UINT64)).toBe(true);
    expect(isUint64(BigInt('9223372036854775807'))).toBe(true); // 2^63 - 1
  });

  // Boundary: just over MAX_UINT64
  it('returns false for MAX_UINT64 + 1', () => {
    expect(isUint64(MAX_UINT64 + BigInt(1))).toBe(false);
  });

  // Invalid types
  it('returns false for non-uint values', () => {
    expect(isUint64(-1)).toBe(false);
    expect(isUint64(BigInt(-1))).toBe(false);
    expect(isUint64(1.5)).toBe(false);
    expect(isUint64('18446744073709551615')).toBe(false);
    expect(isUint64(null)).toBe(false);
    expect(isUint64(undefined)).toBe(false);
    expect(isUint64({})).toBe(false);
  });

  // Very large values (beyond uint64)
  it('returns false for values larger than MAX_UINT64', () => {
    expect(isUint64(MAX_UINT64 + BigInt(1))).toBe(false); // 2^64
    expect(isUint64(BigInt('340282366920938463463374607431768211455'))).toBe(
      false,
    ); // 2^128 - 1
  });
});

describe('assertIsUint8', () => {
  // Valid uint8 values - should not throw
  it('does not throw for 0', () => {
    expect(() => assertIsUint8(0)).not.toThrow();
  });

  it('does not throw for 1', () => {
    expect(() => assertIsUint8(1)).not.toThrow();
  });

  it('does not throw for MAX_UINT8 (255)', () => {
    expect(() => assertIsUint8(MAX_UINT8)).not.toThrow();
    expect(() => assertIsUint8(255)).not.toThrow();
  });

  it('does not throw for BigInt values within range', () => {
    expect(() => assertIsUint8(BigInt(0))).not.toThrow();
    expect(() => assertIsUint8(BigInt(255))).not.toThrow();
    expect(() => assertIsUint8(BigInt(128))).not.toThrow();
  });

  // Boundary: just over MAX_UINT8 - should throw
  it('throws for 256 (MAX_UINT8 + 1)', () => {
    expect(() => assertIsUint8(256)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8(BigInt(256))).toThrow(InvalidTypeError);
  });

  // Invalid types - should throw
  it('throws for non-uint values', () => {
    expect(() => assertIsUint8(-1)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8(-128)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8(1.5)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8('255')).toThrow(InvalidTypeError);
    expect(() => assertIsUint8(null)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8(undefined)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8({})).toThrow(InvalidTypeError);
    expect(() => assertIsUint8([])).toThrow(InvalidTypeError);
  });

  // Large values - should throw
  it('throws for values much larger than MAX_UINT8', () => {
    expect(() => assertIsUint8(1000)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8(MAX_UINT32)).toThrow(InvalidTypeError);
    expect(() => assertIsUint8(MAX_UINT64)).toThrow(InvalidTypeError);
  });
});

describe('assertIsUint32', () => {
  // Valid uint32 values - should not throw
  it('does not throw for 0', () => {
    expect(() => assertIsUint32(0)).not.toThrow();
  });

  it('does not throw for 1', () => {
    expect(() => assertIsUint32(1)).not.toThrow();
  });

  it('does not throw for MAX_UINT8 (255)', () => {
    expect(() => assertIsUint32(255)).not.toThrow();
  });

  it('does not throw for MAX_UINT32 (0xffffffff)', () => {
    expect(() => assertIsUint32(MAX_UINT32)).not.toThrow();
    expect(() => assertIsUint32(0xffffffff)).not.toThrow();
  });

  it('does not throw for BigInt values within range', () => {
    expect(() => assertIsUint32(BigInt(0))).not.toThrow();
    expect(() => assertIsUint32(BigInt(MAX_UINT32))).not.toThrow();
    expect(() => assertIsUint32(BigInt(0x80000000))).not.toThrow(); // 2^31
  });

  // Boundary: just over MAX_UINT32 - should throw
  it('throws for 0x100000000 (MAX_UINT32 + 1)', () => {
    expect(() => assertIsUint32(0x100000000)).toThrow(InvalidTypeError);
    expect(() => assertIsUint32(BigInt(0x100000000))).toThrow(InvalidTypeError);
  });

  // Invalid types - should throw
  it('throws for non-uint values', () => {
    expect(() => assertIsUint32(-1)).toThrow(InvalidTypeError);
    expect(() => assertIsUint32(-0x80000000)).toThrow(InvalidTypeError);
    expect(() => assertIsUint32(1.5)).toThrow(InvalidTypeError);
    expect(() => assertIsUint32('4294967295')).toThrow(InvalidTypeError);
    expect(() => assertIsUint32(null)).toThrow(InvalidTypeError);
    expect(() => assertIsUint32(undefined)).toThrow(InvalidTypeError);
    expect(() => assertIsUint32({})).toThrow(InvalidTypeError);
    expect(() => assertIsUint32([])).toThrow(InvalidTypeError);
  });

  // Large values - should throw
  it('throws for values larger than MAX_UINT32', () => {
    expect(() => assertIsUint32(MAX_UINT64)).toThrow(InvalidTypeError);
    expect(() => assertIsUint32(Number.MAX_SAFE_INTEGER)).toThrow(
      InvalidTypeError,
    );
  });
});

describe('assertIsUint64', () => {
  // Valid uint64 values - should not throw
  it('does not throw for 0', () => {
    expect(() => assertIsUint64(0)).not.toThrow();
  });

  it('does not throw for 1', () => {
    expect(() => assertIsUint64(1)).not.toThrow();
  });

  it('does not throw for MAX_UINT8 (255)', () => {
    expect(() => assertIsUint64(255)).not.toThrow();
  });

  it('does not throw for MAX_UINT32', () => {
    expect(() => assertIsUint64(MAX_UINT32)).not.toThrow();
  });

  it('does not throw for MAX_UINT64 (2^64 - 1)', () => {
    expect(() => assertIsUint64(MAX_UINT64)).not.toThrow();
  });

  it('does not throw for Number.MAX_SAFE_INTEGER', () => {
    expect(() => assertIsUint64(Number.MAX_SAFE_INTEGER)).not.toThrow();
  });

  it('does not throw for BigInt values within range', () => {
    expect(() => assertIsUint64(BigInt(0))).not.toThrow();
    expect(() => assertIsUint64(BigInt(MAX_UINT32))).not.toThrow();
    expect(() => assertIsUint64(MAX_UINT64)).not.toThrow();
    expect(() => assertIsUint64(BigInt('9223372036854775807'))).not.toThrow(); // 2^63 - 1
  });

  // Boundary: just over MAX_UINT64 - should throw
  it('throws for MAX_UINT64 + 1', () => {
    expect(() => assertIsUint64(MAX_UINT64 + BigInt(1))).toThrow(
      InvalidTypeError,
    );
  });

  // Invalid types - should throw
  it('throws for non-uint values', () => {
    expect(() => assertIsUint64(-1)).toThrow(InvalidTypeError);
    expect(() => assertIsUint64(BigInt(-1))).toThrow(InvalidTypeError);
    expect(() => assertIsUint64(1.5)).toThrow(InvalidTypeError);
    expect(() => assertIsUint64('18446744073709551615')).toThrow(
      InvalidTypeError,
    );
    expect(() => assertIsUint64(null)).toThrow(InvalidTypeError);
    expect(() => assertIsUint64(undefined)).toThrow(InvalidTypeError);
    expect(() => assertIsUint64({})).toThrow(InvalidTypeError);
    expect(() => assertIsUint64([])).toThrow(InvalidTypeError);
  });

  // Very large values (beyond uint64) - should throw
  it('throws for values larger than MAX_UINT64', () => {
    expect(() => assertIsUint64(MAX_UINT64 + BigInt(1))).toThrow(
      InvalidTypeError,
    ); // 2^64
    expect(() =>
      assertIsUint64(BigInt('340282366920938463463374607431768211455')),
    ).toThrow(InvalidTypeError); // 2^128 - 1
  });
});

describe('assertIsUint256', () => {
  // Valid uint256 values - should not throw
  it('does not throw for 0', () => {
    expect(() => assertIsUint256(0)).not.toThrow();
  });

  it('does not throw for 1', () => {
    expect(() => assertIsUint256(1)).not.toThrow();
  });

  it('does not throw for MAX_UINT8 (255)', () => {
    expect(() => assertIsUint256(255)).not.toThrow();
  });

  it('does not throw for MAX_UINT32', () => {
    expect(() => assertIsUint256(MAX_UINT32)).not.toThrow();
  });

  it('does not throw for MAX_UINT64', () => {
    expect(() => assertIsUint256(MAX_UINT64)).not.toThrow();
  });

  it('does not throw for MAX_UINT256 (2^256 - 1)', () => {
    expect(() => assertIsUint256(MAX_UINT256)).not.toThrow();
  });

  it('does not throw for Number.MAX_SAFE_INTEGER', () => {
    expect(() => assertIsUint256(Number.MAX_SAFE_INTEGER)).not.toThrow();
  });

  it('does not throw for BigInt values within range', () => {
    expect(() => assertIsUint256(BigInt(0))).not.toThrow();
    expect(() => assertIsUint256(BigInt(MAX_UINT32))).not.toThrow();
    expect(() => assertIsUint256(MAX_UINT64)).not.toThrow();
    expect(() => assertIsUint256(MAX_UINT256)).not.toThrow();
    // 2^128 - 1
    expect(() =>
      assertIsUint256(BigInt('340282366920938463463374607431768211455')),
    ).not.toThrow();
  });

  // Boundary: just over MAX_UINT256 - should throw
  it('throws for MAX_UINT256 + 1', () => {
    expect(() => assertIsUint256(MAX_UINT256 + BigInt(1))).toThrow(
      InvalidTypeError,
    );
  });

  // Invalid types - should throw
  it('throws for non-uint values', () => {
    expect(() => assertIsUint256(-1)).toThrow(InvalidTypeError);
    expect(() => assertIsUint256(BigInt(-1))).toThrow(InvalidTypeError);
    expect(() => assertIsUint256(1.5)).toThrow(InvalidTypeError);
    expect(() => assertIsUint256('123')).toThrow(InvalidTypeError);
    expect(() => assertIsUint256(null)).toThrow(InvalidTypeError);
    expect(() => assertIsUint256(undefined)).toThrow(InvalidTypeError);
    expect(() => assertIsUint256({})).toThrow(InvalidTypeError);
    expect(() => assertIsUint256([])).toThrow(InvalidTypeError);
  });

  // Very large values (beyond uint256) - should throw
  it('throws for values larger than MAX_UINT256', () => {
    // 2^256
    expect(() => assertIsUint256(MAX_UINT256 + BigInt(1))).toThrow(
      InvalidTypeError,
    );
    // 2^257
    expect(() => assertIsUint256(MAX_UINT256 * BigInt(2))).toThrow(
      InvalidTypeError,
    );
  });
});

describe('uintToHex', () => {
  // Basic conversions
  it('converts 0 to "0x00"', () => {
    expect(uintToHex(0)).toBe('0x00');
  });

  it('converts 1 to "0x01"', () => {
    expect(uintToHex(1)).toBe('0x01');
  });

  it('converts 15 to "0x0f"', () => {
    expect(uintToHex(15)).toBe('0x0f');
  });

  it('converts 16 to "0x10"', () => {
    expect(uintToHex(16)).toBe('0x10');
  });

  it('converts 255 to "0xff"', () => {
    expect(uintToHex(255)).toBe('0xff');
  });

  it('converts 256 to "0x0100"', () => {
    expect(uintToHex(256)).toBe('0x0100');
  });

  it('converts 65535 to "0xffff"', () => {
    expect(uintToHex(65535)).toBe('0xffff');
  });

  it('converts 65536 to "0x010000"', () => {
    expect(uintToHex(65536)).toBe('0x010000');
  });

  // BigInt values
  it('converts BigInt(0) to "0x00"', () => {
    expect(uintToHex(BigInt(0))).toBe('0x00');
  });

  it('converts BigInt(255) to "0xff"', () => {
    expect(uintToHex(BigInt(255))).toBe('0xff');
  });

  it('converts MAX_UINT64 correctly', () => {
    expect(uintToHex(MAX_UINT64)).toBe('0xffffffffffffffff');
  });

  it('converts MAX_UINT256 correctly', () => {
    expect(uintToHex(MAX_UINT256)).toBe(
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    );
  });

  // Ensure even-length padding
  it('pads odd-length hex to even length', () => {
    // 0x1 -> 0x01
    expect(uintToHex(1)).toBe('0x01');
    // 0xfff -> 0x0fff
    expect(uintToHex(0xfff)).toBe('0x0fff');
    // 0xfffff -> 0x0fffff
    expect(uintToHex(0xfffff)).toBe('0x0fffff');
  });
});

describe('uintToHexNo0x', () => {
  // Basic conversions
  it('converts 0 to "00"', () => {
    expect(uintToHexNo0x(0)).toBe('00');
  });

  it('converts 1 to "01"', () => {
    expect(uintToHexNo0x(1)).toBe('01');
  });

  it('converts 15 to "0f"', () => {
    expect(uintToHexNo0x(15)).toBe('0f');
  });

  it('converts 16 to "10"', () => {
    expect(uintToHexNo0x(16)).toBe('10');
  });

  it('converts 255 to "ff"', () => {
    expect(uintToHexNo0x(255)).toBe('ff');
  });

  it('converts 256 to "0100"', () => {
    expect(uintToHexNo0x(256)).toBe('0100');
  });

  it('converts 65535 to "ffff"', () => {
    expect(uintToHexNo0x(65535)).toBe('ffff');
  });

  it('converts 65536 to "010000"', () => {
    expect(uintToHexNo0x(65536)).toBe('010000');
  });

  // BigInt values
  it('converts BigInt(0) to "00"', () => {
    expect(uintToHexNo0x(BigInt(0))).toBe('00');
  });

  it('converts BigInt(255) to "ff"', () => {
    expect(uintToHexNo0x(BigInt(255))).toBe('ff');
  });

  it('converts MAX_UINT64 correctly', () => {
    expect(uintToHexNo0x(MAX_UINT64)).toBe('ffffffffffffffff');
  });

  it('converts MAX_UINT256 correctly', () => {
    expect(uintToHexNo0x(MAX_UINT256)).toBe(
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    );
  });

  // Ensure even-length padding
  it('pads odd-length hex to even length', () => {
    // 0x1 -> 01
    expect(uintToHexNo0x(1)).toBe('01');
    // 0xfff -> 0fff
    expect(uintToHexNo0x(0xfff)).toBe('0fff');
    // 0xfffff -> 0fffff
    expect(uintToHexNo0x(0xfffff)).toBe('0fffff');
  });
});

describe('numberToHexNo0x', () => {
  const testCases: [number, string][] = [
    [0, '00'],
    [1, '01'],
    [15, '0f'],
    [16, '10'],
    [255, 'ff'],
    [256, '0100'],
    [4095, '0fff'],
    [4096, '1000'],
    [65535, 'ffff'],
    [65536, '010000'],
    [0x1234567, '01234567'],
    [0x0102030, '102030'],
    [0x01020304, '01020304'],
    [0xdeadbeef, 'deadbeef'],
    [Number.MAX_SAFE_INTEGER, '1fffffffffffff'],
  ];

  it('converts numbers to hex strings without 0x prefix', () => {
    for (const [input, expected] of testCases) {
      expect(numberToHexNo0x(input)).toBe(expected);
    }
  });
});
