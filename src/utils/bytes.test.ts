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
  bytesToBigInt,
  bytesToHex,
} from './bytes';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { MAX_UINT256 } from './uint';

// npx jest --colors --passWithNoTests --coverage ./src/utils/bytes.test.ts --collectCoverageFrom=./src/utils/bytes.ts
// npx jest --colors --passWithNoTests --coverage ./src/utils/bytes.test.ts --collectCoverageFrom=./src/utils/bytes.ts --testNamePattern=xxx

describe('bytes', () => {
  it('xxx hexToBytes', () => {
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

    arr = hexToBytes('0xf');
    expect(arr instanceof Uint8Array).toBe(true);
    expect(arr.length).toBe(1);
    expect(arr[0]).toBe(15);

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

    const bytes2 = bytesToHex(new Uint8Array());
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

    // Single character (odd length)
    it('handles single hex character (odd length)', () => {
      expect(hexToBytes('f')).toEqual(new Uint8Array([15]));
      expect(hexToBytes('0')).toEqual(new Uint8Array([0]));
      expect(hexToBytes('a')).toEqual(new Uint8Array([10]));
    });

    it('handles 0x + single character (odd length)', () => {
      expect(hexToBytes('0xf')).toEqual(new Uint8Array([15]));
      expect(hexToBytes('0x0')).toEqual(new Uint8Array([0]));
      expect(hexToBytes('0xa')).toEqual(new Uint8Array([10]));
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

    // Whitespace (not handled - becomes invalid)
    it('whitespace in string produces invalid bytes', () => {
      // ' f' -> parseInt(' f', 16) = 15, but match splits differently
      const result = hexToBytes('0x ff');
      // Regex .{1,2} will match ' f' and 'f'
      expect(result.length).toBe(2);
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
  });

  describe('bytesToHex - hexToBytes', () => {
    it('converts a hex to bytes', async () => {
      const value = '0xff';
      const bytes1 = hexToBytes(value);
      expect(bytes1).toEqual(new Uint8Array([255]));

      const bytes2 = hexToBytes('0x');
      expect(bytes2).toEqual(new Uint8Array([]));
    });
  });
});
