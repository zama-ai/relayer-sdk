import {
  assertRecordBytesHexProperty,
  assertRecordBytesHexArrayProperty,
  assertRecordBytes32HexArrayProperty,
  assertRecordBytes32HexProperty,
  assertIsBytes32Hex,
  assertIsBytesHex,
  isBytes32Hex,
  isBytesHex,
  isBytesHexNo0x,
  assertIsBytesHexNo0x,
  hexToBytes,
  hexToBytesFaster,
  bytesToBigInt,
  bytesToHex,
  bytesToHexLarge,
} from './bytes';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { MAX_UINT256 } from './uint';

// npx jest --colors --passWithNoTests --coverage ./src/utils/bytes.test.ts --collectCoverageFrom=./src/utils/bytes.ts
// npx jest --colors --passWithNoTests --coverage ./src/utils/bytes.test.ts --collectCoverageFrom=./src/utils/bytes.ts --testNamePattern=xxx

describe('bytes', () => {
  it('hexToBytes', () => {
    let arr = hexToBytes('0x');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(0);

    arr = hexToBytes('');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(0);

    arr = hexToBytes('0xff');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(1);
    expect(arr[0]).toBe(255);

    arr = hexToBytes('0x00');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(1);
    expect(arr[0]).toBe(0);

    expect(() => hexToBytes('0xf')).toThrow('Invalid hex string: odd length');

    arr = hexToBytes('za');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(1);
    expect(arr[0]).toBe(0);
    arr = hexToBytes('za');

    arr = hexToBytes('0xzazazazazaza');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(6);
    expect(arr[0]).toBe(0);
    expect(arr[1]).toBe(0);
    expect(arr[2]).toBe(0);
    expect(arr[3]).toBe(0);
    expect(arr[4]).toBe(0);
    expect(arr[5]).toBe(0);

    arr = hexToBytes('0xzzff');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(2);
    expect(arr[0]).toBe(0);
    expect(arr[1]).toBe(255);

    arr = hexToBytes('0xzfff');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(2);
    expect(arr[0]).toBe(0);
    expect(arr[1]).toBe(255);
  });

  it('isBytesHex', () => {
    // True
    expect(isBytesHex('0x')).toEqual(true);
    expect(isBytesHex('0x00')).toEqual(true);
    expect(isBytesHex('0xdeadbeef')).toEqual(true);
    expect(isBytesHex('0x00', 32)).toEqual(false);
    expect(isBytesHex('0xdeadbeef')).toEqual(true);
    expect(
      isBytesHex(
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        32,
      ),
    ).toEqual(true);
    expect(isBytesHex('0xdeadbeef', 32)).toEqual(false);

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
    expect(() => assertIsBytesHex('0x')).not.toThrow();
    expect(() => assertIsBytesHex('0x00')).not.toThrow();
    expect(() => assertIsBytesHex('0xdeadbeef')).not.toThrow();

    const e = (type: string) =>
      new InvalidTypeError({
        expectedType: 'BytesHex',
        type,
      });

    // False
    expect(() => assertIsBytesHex('deadbeef')).toThrow(e('string'));
    expect(() => assertIsBytesHex('0x0')).toThrow(e('string'));
    expect(() => assertIsBytesHex('0xhello')).toThrow(e('string'));
    expect(() => assertIsBytesHex('0xdeadbeefzz')).toThrow(e('string'));
    expect(() => assertIsBytesHex('0xdeadbee')).toThrow(e('string'));
    expect(() => assertIsBytesHex('hello')).toThrow(e('string'));
    expect(() => assertIsBytesHex(null)).toThrow(e('object'));
    expect(() => assertIsBytesHex(undefined)).toThrow(e('undefined'));
    expect(() => assertIsBytesHex('')).toThrow(e('string'));
    expect(() => assertIsBytesHex('123')).toThrow(e('string'));
    expect(() => assertIsBytesHex(123)).toThrow(e('number'));
    expect(() => assertIsBytesHex(BigInt(123))).toThrow(e('bigint'));
    expect(() => assertIsBytesHex(123.0)).toThrow(e('number'));
    expect(() => assertIsBytesHex(123.1)).toThrow(e('number'));
    expect(() => assertIsBytesHex(-123)).toThrow(e('number'));
    expect(() => assertIsBytesHex(0)).toThrow(e('number'));
    expect(() => assertIsBytesHex({})).toThrow(e('object'));
    expect(() => assertIsBytesHex([])).toThrow(e('object'));
    expect(() => assertIsBytesHex([123])).toThrow(e('object'));
  });

  it('isBytes32Hex', () => {
    // True
    expect(
      isBytes32Hex(
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ),
    ).toEqual(true);

    // False
    expect(isBytes32Hex('0x')).toEqual(false);
    expect(isBytes32Hex('0x00')).toEqual(false);
    expect(isBytes32Hex('0xdeadbeef')).toEqual(false);
    expect(isBytes32Hex('deadbee')).toEqual(false);
    expect(isBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeef')).toEqual(false);
    expect(isBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef')).toEqual(
      false,
    );
  });

  it('assertIsBytes32Hex', () => {
    // True
    expect(() =>
      assertIsBytes32Hex(
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ),
    ).not.toThrow();

    const e = (type: string) =>
      new InvalidTypeError({
        expectedType: 'Bytes32Hex',
        type,
      });

    // False
    expect(() => assertIsBytes32Hex('0x')).toThrow(e('string'));
    expect(() => assertIsBytes32Hex('0x00')).toThrow(e('string'));
    expect(() => assertIsBytes32Hex('0xdeadbeef')).toThrow(e('string'));
    expect(() => assertIsBytes32Hex('deadbeef')).toThrow(e('string'));
    expect(() =>
      assertIsBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow(e('string'));
    expect(() =>
      assertIsBytes32Hex('0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'),
    ).toThrow(e('string'));
    expect(() =>
      assertIsBytes32Hex(
        'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ),
    ).toThrow(e('string'));
    expect(() =>
      assertIsBytes32Hex(
        'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefff',
      ),
    ).toThrow(e('string'));
  });

  it('assertBytes32HexProperty', () => {
    // True
    expect(() =>
      assertRecordBytes32HexProperty(
        {
          foo: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        },
        'foo',
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertRecordBytes32HexProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Bytes32Hex',
        property: 'foo',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertRecordBytes32HexProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Bytes32Hex',
        property: 'foo',
        type: 'undefined',
      }),
    );

    expect(() => assertRecordBytes32HexProperty({}, 'foo', 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Bytes32Hex',
        property: 'foo',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertRecordBytes32HexProperty(
        { foo: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Bytes32Hex',
        property: 'foo',
        type: 'string',
      }),
    );
  });

  it('assertBytes32HexArrayProperty', () => {
    // True
    expect(() =>
      assertRecordBytes32HexArrayProperty(
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
      assertRecordBytes32HexArrayProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Array',
        type: 'undefined',
        property: 'foo',
      }),
    );

    expect(() =>
      assertRecordBytes32HexArrayProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Array',
        type: 'undefined',
        property: 'foo',
      }),
    );

    expect(() =>
      assertRecordBytes32HexArrayProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Array',
        type: 'string',
        property: 'foo',
      }),
    );

    expect(() =>
      assertRecordBytes32HexArrayProperty(
        { foo: ['0xDeaDbeefdEAdbeef'] },
        'foo',
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Bytes32Hex',
        type: 'string',
        property: 'foo',
        index: 0,
      }),
    );
  });

  it('assertBytesHexProperty', () => {
    // True
    expect(() =>
      assertRecordBytesHexProperty(
        {
          foo: '0xdead',
        },
        'foo',
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertRecordBytesHexProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        property: 'foo',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertRecordBytesHexProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        property: 'foo',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertRecordBytesHexProperty(
        { foo: 'DeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        property: 'foo',
        type: 'string',
      }),
    );

    expect(() =>
      assertRecordBytesHexProperty({ foo: '0xdeadbee' }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        type: 'string',
        property: 'foo',
      }),
    );

    expect(() => assertRecordBytesHexProperty({}, 'foo', 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        property: 'foo',
        type: 'undefined',
      }),
    );
  });

  it('assertRecordBytesHexArrayProperty', () => {
    // True
    expect(() =>
      assertRecordBytesHexArrayProperty(
        {
          foo: ['0xdeadbeef'],
        },
        'foo',
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertRecordBytesHexArrayProperty({ foo: null }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Array',
        property: 'foo',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertRecordBytesHexArrayProperty({ foo: undefined }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Array',
        property: 'foo',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertRecordBytesHexArrayProperty(
        { foo: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF' },
        'foo',
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'Array',
        property: 'foo',
        type: 'string',
      }),
    );

    expect(() =>
      assertRecordBytesHexArrayProperty({ foo: ['0xdeadbee'] }, 'foo', 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        property: 'foo',
        type: 'string',
        index: 0,
      }),
    );
  });

  it('isBytesHexNo0x', () => {
    // True
    expect(isBytesHexNo0x('')).toEqual(true);
    expect(isBytesHexNo0x('00')).toEqual(true);
    expect(isBytesHexNo0x('deadbeef')).toEqual(true);

    // False
    expect(isBytesHexNo0x('0xdeadbeef')).toEqual(false);
    expect(isBytesHexNo0x('0')).toEqual(false);
    expect(isBytesHexNo0x('hello')).toEqual(false);
    expect(isBytesHexNo0x('deadbee')).toEqual(false);
    expect(isBytesHexNo0x('deadbeefzz')).toEqual(false);
    expect(isBytesHexNo0x(null)).toEqual(false);
    expect(isBytesHexNo0x(undefined)).toEqual(false);
    expect(isBytesHexNo0x('123')).toEqual(false);
    expect(isBytesHexNo0x(123)).toEqual(false);
    expect(isBytesHexNo0x(BigInt(123))).toEqual(false);
    expect(isBytesHexNo0x(123.0)).toEqual(false);
    expect(isBytesHexNo0x(123.1)).toEqual(false);
    expect(isBytesHexNo0x(-123)).toEqual(false);
    expect(isBytesHexNo0x(0)).toEqual(false);
    expect(isBytesHexNo0x({})).toEqual(false);
    expect(isBytesHexNo0x([])).toEqual(false);
    expect(isBytesHexNo0x([123])).toEqual(false);
  });

  it('assertIsBytesHexNo0x', () => {
    // True
    expect(() => assertIsBytesHexNo0x('')).not.toThrow();
    expect(() => assertIsBytesHexNo0x('00')).not.toThrow();
    expect(() => assertIsBytesHexNo0x('deadbeef')).not.toThrow();

    const e = (type: string) =>
      new InvalidTypeError({
        expectedType: 'BytesHexNo0x',
        type,
      });

    // False
    expect(() => assertIsBytesHexNo0x('0xdeadbeef')).toThrow(e('string'));
    expect(() => assertIsBytesHexNo0x('0')).toThrow(e('string'));
    expect(() => assertIsBytesHexNo0x('hello')).toThrow(e('string'));
    expect(() => assertIsBytesHexNo0x('deadbeefzz')).toThrow(e('string'));
    expect(() => assertIsBytesHexNo0x('deadbee')).toThrow(e('string'));
    expect(() => assertIsBytesHexNo0x('hello')).toThrow(e('string'));
    expect(() => assertIsBytesHexNo0x(null)).toThrow(e('object'));
    expect(() => assertIsBytesHexNo0x(undefined)).toThrow(e('undefined'));
    expect(() => assertIsBytesHexNo0x('123')).toThrow(e('string'));
    expect(() => assertIsBytesHexNo0x(123)).toThrow(e('number'));
    expect(() => assertIsBytesHexNo0x(BigInt(123))).toThrow(e('bigint'));
    expect(() => assertIsBytesHexNo0x(123.0)).toThrow(e('number'));
    expect(() => assertIsBytesHexNo0x(123.1)).toThrow(e('number'));
    expect(() => assertIsBytesHexNo0x(-123)).toThrow(e('number'));
    expect(() => assertIsBytesHexNo0x(0)).toThrow(e('number'));
    expect(() => assertIsBytesHexNo0x({})).toThrow(e('object'));
    expect(() => assertIsBytesHexNo0x([])).toThrow(e('object'));
    expect(() => assertIsBytesHexNo0x([123])).toThrow(e('object'));
  });
});

describe('bytesToBigInt', () => {
  it('should return 0n for undefined input', () => {
    expect(bytesToBigInt(undefined)).toBe(BigInt(0));
  });

  it('should return 0n for empty array', () => {
    expect(bytesToBigInt(new Uint8Array([]))).toBe(BigInt(0));
  });

  it('should convert single byte correctly', () => {
    expect(bytesToBigInt(new Uint8Array([0]))).toBe(BigInt(0));
    expect(bytesToBigInt(new Uint8Array([1]))).toBe(BigInt(1));
    expect(bytesToBigInt(new Uint8Array([255]))).toBe(BigInt(255));
  });

  it('should convert two bytes correctly (big-endian)', () => {
    expect(bytesToBigInt(new Uint8Array([0x01, 0x00]))).toBe(BigInt(256));
    expect(bytesToBigInt(new Uint8Array([0x01, 0x01]))).toBe(BigInt(257));
    expect(bytesToBigInt(new Uint8Array([0xff, 0xff]))).toBe(BigInt(65535));
  });

  it('should convert multiple bytes correctly', () => {
    // 0x010203 = 66051
    expect(bytesToBigInt(new Uint8Array([0x01, 0x02, 0x03]))).toBe(
      BigInt(66051),
    );
  });

  it('should handle large values', () => {
    // 32 bytes (256-bit value)
    const bytes = new Uint8Array(32);
    bytes[0] = 0x01;
    expect(bytesToBigInt(bytes)).toBe(
      BigInt(
        '0x0100000000000000000000000000000000000000000000000000000000000000',
      ),
    );
  });

  it('should handle max uint256', () => {
    const maxUint256 = new Uint8Array(32).fill(0xff);
    expect(bytesToBigInt(maxUint256)).toBe(MAX_UINT256);
  });
});

describe('bytesToHex - hexToBytes', () => {
  it('converts a hex to bytes', async () => {
    const value = '0xff';
    const bytes1 = hexToBytes(value);
    expect(bytes1).toEqual(new Uint8Array([255]));

    const bytes2 = hexToBytes('0x');
    expect(bytes2).toEqual(new Uint8Array([]));
  });

  it('converts a bytes to hex', async () => {
    const bytes1 = bytesToHex(new Uint8Array([255]));
    expect(bytes1).toEqual('0xff');
    expect(bytesToHexLarge(new Uint8Array([255]))).toEqual(bytes1);

    const bytes2 = bytesToHex(new Uint8Array());
    expect(bytesToHexLarge(new Uint8Array())).toEqual(bytes2);
    expect(bytes2).toEqual('0x');
  });

  it('converts bytes to number', async () => {
    const value = new Uint8Array([23, 200, 15]);
    const bigint1 = bytesToBigInt(value);
    expect(bigint1.toString()).toBe('1558543');

    const value2 = new Uint8Array([37, 6, 210, 166, 239]);
    const bigint2 = bytesToBigInt(value2);
    expect(bigint2.toString()).toBe('159028258543');

    const value0 = new Uint8Array();
    const bigint0 = bytesToBigInt(value0);
    expect(bigint0.toString()).toBe('0');
  });

  describe('hexToBytes edge cases', () => {
    // Empty inputs
    it('handles empty string', () => {
      expect(hexToBytes('')).toEqual(new Uint8Array([]));
    });

    it('handles 0x only', () => {
      expect(hexToBytes('0x')).toEqual(new Uint8Array([]));
    });

    // Single character (odd length) - throws error
    it('throws for single hex character (odd length)', () => {
      expect(() => hexToBytes('f')).toThrow('Invalid hex string: odd length');
      expect(() => hexToBytes('0')).toThrow('Invalid hex string: odd length');
      expect(() => hexToBytes('a')).toThrow('Invalid hex string: odd length');
    });

    it('throws for 0x + single character (odd length)', () => {
      expect(() => hexToBytes('0xf')).toThrow('Invalid hex string: odd length');
      expect(() => hexToBytes('0x0')).toThrow('Invalid hex string: odd length');
      expect(() => hexToBytes('0xa')).toThrow('Invalid hex string: odd length');
    });

    // Valid hex strings
    it('handles valid lowercase hex', () => {
      expect(hexToBytes('0xdeadbeef')).toEqual(
        new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
      );
    });

    it('handles valid uppercase hex', () => {
      expect(hexToBytes('0xDEADBEEF')).toEqual(
        new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
      );
    });

    it('handles mixed case hex', () => {
      expect(hexToBytes('0xDeAdBeEf')).toEqual(
        new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
      );
    });

    it('handles hex without 0x prefix', () => {
      expect(hexToBytes('deadbeef')).toEqual(
        new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
      );
    });

    // Invalid characters (parseInt returns NaN -> 0)
    it('converts invalid hex chars to 0 (via parseInt NaN)', () => {
      // 'zz' -> parseInt('zz', 16) = NaN -> becomes 0 in Uint8Array
      expect(hexToBytes('zz')).toEqual(new Uint8Array([0]));
      expect(hexToBytes('0xzz')).toEqual(new Uint8Array([0]));
    });

    it('handles mixed valid and invalid chars', () => {
      // 'zf' -> parseInt('zf', 16) = NaN -> 0
      // 'ff' -> 255
      expect(hexToBytes('0xzfff')).toEqual(new Uint8Array([0, 255]));
      expect(hexToBytes('0xffzf')).toEqual(new Uint8Array([255, 0]));
    });

    it('handles all zeros', () => {
      expect(hexToBytes('0x0000')).toEqual(new Uint8Array([0, 0]));
      expect(hexToBytes('0x00000000')).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    it('handles all ones (0xff)', () => {
      expect(hexToBytes('0xffff')).toEqual(new Uint8Array([255, 255]));
      expect(hexToBytes('0xffffffff')).toEqual(
        new Uint8Array([255, 255, 255, 255]),
      );
    });

    // Boundary values
    it('handles boundary byte values', () => {
      expect(hexToBytes('0x00')).toEqual(new Uint8Array([0]));
      expect(hexToBytes('0x01')).toEqual(new Uint8Array([1]));
      expect(hexToBytes('0x7f')).toEqual(new Uint8Array([127])); // max signed byte
      expect(hexToBytes('0x80')).toEqual(new Uint8Array([128])); // min negative in signed
      expect(hexToBytes('0xfe')).toEqual(new Uint8Array([254]));
      expect(hexToBytes('0xff')).toEqual(new Uint8Array([255]));
    });

    // Whitespace - odd length after removing 0x prefix throws
    it('whitespace in string throws for odd length', () => {
      // '0x ff' after removing '0x' is ' ff' (3 chars, odd length)
      expect(() => hexToBytes('0x ff')).toThrow(
        'Invalid hex string: odd length',
      );
    });

    // Long strings
    it('handles 32-byte (256-bit) hex string', () => {
      const hex =
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const bytes = hexToBytes(hex);
      expect(bytes.length).toBe(32);
      expect(bytes[0]).toBe(0x01);
      expect(bytes[1]).toBe(0x23);
      expect(bytes[31]).toBe(0xef);
    });

    // Special prefix handling
    it('handles 0X (uppercase X) prefix', () => {
      // The regex only removes lowercase 0x
      const result = hexToBytes('0Xff');
      // '0Xff' without 0x removal -> ['0X', 'ff'] -> [NaN, 255] -> [0, 255]
      expect(result).toEqual(new Uint8Array([0, 255]));
    });

    // Leading zeros preservation
    it('preserves leading zeros', () => {
      expect(hexToBytes('0x0001')).toEqual(new Uint8Array([0, 1]));
      expect(hexToBytes('0x000000ff')).toEqual(new Uint8Array([0, 0, 0, 255]));
    });

    // Three-character odd length strings - throws error
    it('throws for three-character hex (odd length)', () => {
      expect(() => hexToBytes('fff')).toThrow('Invalid hex string: odd length');
      expect(() => hexToBytes('0xfff')).toThrow(
        'Invalid hex string: odd length',
      );
      expect(() => hexToBytes('abc')).toThrow('Invalid hex string: odd length');
      expect(() => hexToBytes('0xabc')).toThrow(
        'Invalid hex string: odd length',
      );
      expect(() => hexToBytes('123')).toThrow('Invalid hex string: odd length');
      expect(() => hexToBytes('0x123')).toThrow(
        'Invalid hex string: odd length',
      );
    });

    // Five-character odd length strings - throws error
    it('throws for five-character hex (odd length)', () => {
      expect(() => hexToBytes('0x12345')).toThrow(
        'Invalid hex string: odd length',
      );
      expect(() => hexToBytes('abcde')).toThrow(
        'Invalid hex string: odd length',
      );
    });

    // Ethereum address format (20 bytes)
    it('handles Ethereum address format (20 bytes)', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const bytes = hexToBytes(address);
      expect(bytes.length).toBe(20);
      expect(bytes[0]).toBe(0x12);
      expect(bytes[19]).toBe(0x78);
    });

    // Ethereum address without 0x prefix
    it('handles Ethereum address without 0x prefix', () => {
      const address = '1234567890abcdef1234567890abcdef12345678';
      const bytes = hexToBytes(address);
      expect(bytes.length).toBe(20);
      expect(bytes[0]).toBe(0x12);
      expect(bytes[19]).toBe(0x78);
    });

    // Round-trip: hexToBytes -> bytesToHex
    it('round-trips correctly with bytesToHex', () => {
      const testCases = [
        '0x',
        '0xff',
        '0x00',
        '0xdeadbeef',
        '0x0123456789abcdef',
        '0x000000ff',
      ];
      for (const hex of testCases) {
        expect(bytesToHex(hexToBytes(hex))).toBe(hex);
        expect(bytesToHexLarge(hexToBytes(hex))).toBe(hex);
      }
    });
  });

  describe('hexToBytes', () => {
    it('converts a hex to bytes', async () => {
      const value = '0xff';
      const bytes1 = hexToBytes(value);
      expect(bytes1).toEqual(new Uint8Array([255]));

      const bytes2 = hexToBytes('0x');
      expect(bytes2).toEqual(new Uint8Array([]));
    });
  });
});

describe('hexToBytesFaster', () => {
  // Empty inputs
  it('handles empty string', () => {
    expect(hexToBytesFaster('')).toEqual(new Uint8Array([]));
  });

  it('handles 0x only', () => {
    expect(hexToBytesFaster('0x')).toEqual(new Uint8Array([]));
  });

  // Basic conversions
  it('converts single byte hex', () => {
    expect(hexToBytesFaster('0xff')).toEqual(new Uint8Array([255]));
    expect(hexToBytesFaster('0x00')).toEqual(new Uint8Array([0]));
    expect(hexToBytesFaster('0x01')).toEqual(new Uint8Array([1]));
    expect(hexToBytesFaster('0x7f')).toEqual(new Uint8Array([127]));
    expect(hexToBytesFaster('0x80')).toEqual(new Uint8Array([128]));
    expect(hexToBytesFaster('0xfe')).toEqual(new Uint8Array([254]));
  });

  it('converts multi-byte hex with 0x prefix', () => {
    expect(hexToBytesFaster('0xdeadbeef')).toEqual(
      new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
    );
    expect(hexToBytesFaster('0x0123456789abcdef')).toEqual(
      new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
    );
  });

  it('converts hex without 0x prefix', () => {
    expect(hexToBytesFaster('ff')).toEqual(new Uint8Array([255]));
    expect(hexToBytesFaster('deadbeef')).toEqual(
      new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
    );
  });

  // Case handling
  it('handles lowercase hex', () => {
    expect(hexToBytesFaster('0xabcdef')).toEqual(
      new Uint8Array([0xab, 0xcd, 0xef]),
    );
  });

  it('handles uppercase hex', () => {
    expect(hexToBytesFaster('0xABCDEF')).toEqual(
      new Uint8Array([0xab, 0xcd, 0xef]),
    );
  });

  it('handles mixed case hex', () => {
    expect(hexToBytesFaster('0xAbCdEf')).toEqual(
      new Uint8Array([0xab, 0xcd, 0xef]),
    );
  });

  // Odd length - throws error
  it('throws for odd length hex string', () => {
    expect(() => hexToBytesFaster('f')).toThrow(
      'Invalid hex string: odd length',
    );
    expect(() => hexToBytesFaster('0xf')).toThrow(
      'Invalid hex string: odd length',
    );
    expect(() => hexToBytesFaster('fff')).toThrow(
      'Invalid hex string: odd length',
    );
    expect(() => hexToBytesFaster('0xfff')).toThrow(
      'Invalid hex string: odd length',
    );
    expect(() => hexToBytesFaster('0x12345')).toThrow(
      'Invalid hex string: odd length',
    );
  });

  // Invalid characters - non-strict mode (default)
  it('converts invalid hex chars to 0 in non-strict mode', () => {
    // Invalid chars result in undefined from lookup, which becomes NaN -> 0
    expect(hexToBytesFaster('zz')).toEqual(new Uint8Array([0]));
    expect(hexToBytesFaster('0xzz')).toEqual(new Uint8Array([0]));
    expect(hexToBytesFaster('0xzzff')).toEqual(new Uint8Array([0, 255]));
    expect(hexToBytesFaster('0xffzz')).toEqual(new Uint8Array([255, 0]));
  });

  // Invalid characters - strict mode
  it('throws for invalid hex chars in strict mode', () => {
    expect(() => hexToBytesFaster('zz', true)).toThrow(
      'Invalid hex character at position 0',
    );
    expect(() => hexToBytesFaster('0xzz', true)).toThrow(
      'Invalid hex character at position 2',
    );
    expect(() => hexToBytesFaster('0xffzz', true)).toThrow(
      'Invalid hex character at position 4',
    );
    expect(() => hexToBytesFaster('0xghij', true)).toThrow(
      'Invalid hex character at position 2',
    );
  });

  it('does not throw for valid hex in strict mode', () => {
    expect(hexToBytesFaster('0xdeadbeef', true)).toEqual(
      new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
    );
    expect(hexToBytesFaster('0xABCDEF', true)).toEqual(
      new Uint8Array([0xab, 0xcd, 0xef]),
    );
    expect(hexToBytesFaster('0x0123456789abcdef', true)).toEqual(
      new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
    );
  });

  // Leading zeros preservation
  it('preserves leading zeros', () => {
    expect(hexToBytesFaster('0x0001')).toEqual(new Uint8Array([0, 1]));
    expect(hexToBytesFaster('0x000000ff')).toEqual(
      new Uint8Array([0, 0, 0, 255]),
    );
  });

  // Long strings
  it('handles 32-byte (256-bit) hex string', () => {
    const hex =
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const bytes = hexToBytesFaster(hex);
    expect(bytes.length).toBe(32);
    expect(bytes[0]).toBe(0x01);
    expect(bytes[1]).toBe(0x23);
    expect(bytes[31]).toBe(0xef);
  });

  // Ethereum address format (20 bytes)
  it('handles Ethereum address format (20 bytes)', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const bytes = hexToBytesFaster(address);
    expect(bytes.length).toBe(20);
    expect(bytes[0]).toBe(0x12);
    expect(bytes[19]).toBe(0x78);
  });

  // 0X uppercase prefix - treated as part of the hex string (no special handling)
  it('handles 0X (uppercase X) prefix differently than 0x', () => {
    // '0Xff' - the '0X' is not recognized as prefix, so it's parsed as hex
    // '0X' -> invalid chars -> 0
    // 'ff' -> 255
    const result = hexToBytesFaster('0Xff');
    expect(result).toEqual(new Uint8Array([0, 255]));
  });

  // Round-trip with bytesToHex
  it('round-trips correctly with bytesToHex', () => {
    const testCases = [
      '0x',
      '0xff',
      '0x00',
      '0xdeadbeef',
      '0x0123456789abcdef',
      '0x000000ff',
    ];
    for (const hex of testCases) {
      expect(bytesToHex(hexToBytesFaster(hex))).toBe(hex);
    }
  });

  // Comparison with hexToBytes for valid inputs
  it('produces same results as hexToBytes for valid even-length hex', () => {
    const testCases = [
      '',
      '0x',
      '0xff',
      '0x00',
      '0xdeadbeef',
      '0xDEADBEEF',
      '0xDeAdBeEf',
      'deadbeef',
      '0x0123456789abcdef',
      '0x000000ff',
      '0x1234567890abcdef1234567890abcdef12345678',
    ];
    for (const hex of testCases) {
      expect(hexToBytesFaster(hex)).toEqual(hexToBytes(hex));
    }
  });
});
