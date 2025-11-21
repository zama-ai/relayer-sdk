import { assertIsUint, isUint } from './uint';

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
    expect(() => assertIsUint('hello')).toThrow(RangeError);
    expect(() => assertIsUint(null)).toThrow(RangeError);
    expect(() => assertIsUint(undefined)).toThrow(RangeError);
    expect(() => assertIsUint('')).toThrow(RangeError);
    expect(() => assertIsUint('123')).toThrow(RangeError);
    expect(() => assertIsUint(123)).not.toThrow();
    expect(() => assertIsUint(BigInt(123))).not.toThrow();
    expect(() => assertIsUint(123.0)).not.toThrow();
    expect(() => assertIsUint(123.1)).toThrow(RangeError);
    expect(() => assertIsUint(-123)).toThrow();
    expect(() => assertIsUint(0)).not.toThrow();
    expect(() => assertIsUint({})).toThrow(RangeError);
    expect(() => assertIsUint([])).toThrow(RangeError);
    expect(() => assertIsUint([123])).toThrow(RangeError);
  });
});
