import type { Prettify } from './utils';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bytes1: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bytes8: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bytes20: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bytes21: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bytes32: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bytes65: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bytesStr: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __hex: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __hexNo0x: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __uint: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bits8: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bits16: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bits32: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bits64: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bits128: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bits160: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __bits256: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __address: unique symbol;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __checksummedAddress: unique symbol;

////////////////////////////////////////////////////////////////////////////////

export type Bits8 = { readonly [__bits8]: never };
export type Bits16 = { readonly [__bits16]: never };
export type Bits32 = { readonly [__bits32]: never };
export type Bits64 = { readonly [__bits64]: never };
export type Bits128 = { readonly [__bits128]: never };
export type Bits160 = { readonly [__bits160]: never };
export type Bits256 = { readonly [__bits256]: never };

export type ByteLen1 = { readonly [__bytes1]: never };
export type ByteLen8 = { readonly [__bytes8]: never };
export type ByteLen20 = { readonly [__bytes20]: never };
export type ByteLen21 = { readonly [__bytes21]: never };
export type ByteLen32 = { readonly [__bytes32]: never };
export type ByteLen65 = { readonly [__bytes65]: never };

////////////////////////////////////////////////////////////////////////////////

/**
 * Unsigned integer represented as a JavaScript number.
 *
 * Note: JavaScript numbers are 64-bit floats, so this is only safe for
 * integers up to Number.MAX_SAFE_INTEGER (2^53 - 1).
 */
export type UintNumber = number & { readonly [__uint]: never };

/**
 * Unsigned integer represented as a JavaScript bigint.
 */
export type UintBigInt = bigint & { readonly [__uint]: never };

////////////////////////////////////////////////////////////////////////////////
//
// UintXX
//
// Fixed-width unsigned integer types. Smaller widths (8, 16, 32) can be
// represented as JavaScript numbers or bigints. Larger widths (64+) require
// bigints as they exceed Number.MAX_SAFE_INTEGER.
//
////////////////////////////////////////////////////////////////////////////////

/**
 * Unsigned integer represented as a JavaScript number or bigint.
 */
export type Uint = UintNumber | UintBigInt;

/**
 * 8-bits Unsigned integer.
 */
export type Uint8 = Uint8Number | Uint8BigInt;

/**
 * 16-bits Unsigned integer.
 */
export type Uint16 = Uint16Number | Uint16BigInt;

/**
 * 32-bits Unsigned integer.
 */
export type Uint32 = Uint32Number | Uint32BigInt;

/**
 * 64-bits Unsigned integer.
 */
export type Uint64 = UintNumber | Uint64BigInt;

/**
 * 128-bits Unsigned integer.
 */
export type Uint128 = UintNumber | Uint128BigInt;

/**
 * 256-bits Unsigned integer.
 */
export type Uint256 = UintNumber | Uint256BigInt;

/**
 * Union type of all unsigned integer branded types (Uint8, Uint16, Uint32, Uint64, Uint128, Uint256).
 * Each member is a branded type that guarantees the value is within the valid range for that bit width.
 */
export type UintXXType = Uint8 | Uint16 | Uint32 | Uint64 | Uint128 | Uint256;

/**
 * String literal union of unsigned integer type names.
 */
export type UintXXTypeName =
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256';

export type UintTypeName = 'uint' | UintXXTypeName;

////////////////////////////////////////////////////////////////////////////////
//
// UintXXNumber
//
// Fixed-width unsigned integer types represented as JavaScript numbers.
//
////////////////////////////////////////////////////////////////////////////////

/**
 * 8-bits Unsigned integer represented as a JavaScript number.
 */
export type Uint8Number = UintNumber & Bits8;

/**
 * 16-bits Unsigned integer represented as a JavaScript number.
 */
export type Uint16Number = UintNumber & Bits16;

/**
 * 32-bits Unsigned integer represented as a JavaScript number.
 */
export type Uint32Number = UintNumber & Bits32;

export type UintXXNumberTypeName =
  | 'uint8Number'
  | 'uint16Number'
  | 'uint32Number';

export type UintNumberTypeName = 'uintNumber' | UintXXNumberTypeName;

////////////////////////////////////////////////////////////////////////////////
//
// UintXXBigInt
//
// Fixed-width unsigned integer types represented as JavaScript bigints.
//
////////////////////////////////////////////////////////////////////////////////

/**
 * 8-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint8BigInt = UintBigInt & Bits8;

/**
 * 16-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint16BigInt = UintBigInt & Bits16;

/**
 * 32-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint32BigInt = UintBigInt & Bits32;

/**
 * 64-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint64BigInt = UintBigInt & Bits64;

/**
 * 128-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint128BigInt = UintBigInt & Bits128;

/**
 * 160-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint160BigInt = UintBigInt & Bits160;

/**
 * 256-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint256BigInt = UintBigInt & Bits256;

export type UintXXBigIntTypeName =
  | 'uint8BigInt'
  | 'uint16BigInt'
  | 'uint32BigInt'
  | 'uint64BigInt'
  | 'uint128BigInt'
  | 'uint256BigInt';

export type UintBigIntTypeName = 'uintBigInt' | UintXXBigIntTypeName;

////////////////////////////////////////////////////////////////////////////////
//
// BytesXX
//
////////////////////////////////////////////////////////////////////////////////

/**
 * A 0x-prefixed hexadecimal string.
 *
 * Unlike `BytesHex`, the length can be odd or even (e.g., `0x1` or `0x01` are both valid).
 */
export type Hex = `0x${string}` & { readonly [__hex]: never };
export type HexNo0x = string & { readonly [__hexNo0x]: never };

export type Bytes = Uint8Array;
export type Bytes1 = Bytes & ByteLen1;
export type Bytes8 = Bytes & ByteLen8;
export type Bytes20 = Bytes & ByteLen20;
export type Bytes21 = Bytes & ByteLen21;
export type Bytes32 = Bytes & ByteLen32;
export type Bytes65 = Bytes & ByteLen65;

/**
 * Union type of all bytes branded types (Bytes1, Bytes8, Bytes20, ...).
 * Each member is a branded type that guarantees the value is within the valid range for that bytes length.
 */
export type BytesXXType =
  | Bytes1
  | Bytes8
  | Bytes20
  | Bytes21
  | Bytes32
  | Bytes65;

/**
 * A 0x-prefixed hexadecimal string representing byte data.
 *
 * The length must be even (excluding the `0x` prefix) since each byte is
 * represented by two hex characters. Use `Hex` if odd-length strings are acceptable.
 *
 * @example
 * const data: BytesHex = '0x48656c6c6f'; // "Hello" in hex
 */
export type BytesHex = Hex & { readonly [__bytesStr]: never };

/**
 * A hexadecimal string representing byte data without the `0x` prefix.
 * @see {@link BytesHex}
 */
export type BytesHexNo0x = HexNo0x & { readonly [__bytesStr]: never };

/**
 * A 0x-prefixed hexadecimal string representing exactly 1 byte (4 characters including the prefix).
 */
export type Bytes1Hex = BytesHex & ByteLen1;

/**
 * A hexadecimal string representing exactly 1 byte without the `0x` prefix (4 characters).
 */
export type Bytes1HexNo0x = BytesHexNo0x & ByteLen1;

/**
 * A 0x-prefixed hexadecimal string representing exactly 8 bytes (18 characters including the prefix).
 */
export type Bytes8Hex = BytesHex & ByteLen8;

/**
 * A hexadecimal string representing exactly 8 bytes without the `0x` prefix (16 characters).
 */
export type Bytes8HexNo0x = BytesHexNo0x & ByteLen8;

/**
 * A 0x-prefixed hexadecimal string representing exactly 20 bytes (42 characters including the prefix).
 */
export type Bytes20Hex = BytesHex & ByteLen20;

/**
 * A hexadecimal string representing exactly 20 bytes without the `0x` prefix (40 characters).
 */
export type Bytes20HexNo0x = BytesHexNo0x & ByteLen20;

/**
 * A 0x-prefixed hexadecimal string representing exactly 21 bytes (44 characters including the prefix).
 */
export type Bytes21Hex = BytesHex & ByteLen21;

/**
 * A hexadecimal string representing exactly 21 bytes without the `0x` prefix (42 characters).
 */
export type Bytes21HexNo0x = BytesHexNo0x & ByteLen21;

/**
 * A 0x-prefixed hexadecimal string representing exactly 32 bytes (66 characters including the prefix).
 */
export type Bytes32Hex = BytesHex & ByteLen32;

/**
 * A hexadecimal string representing exactly 32 bytes without the `0x` prefix (64 characters).
 */
export type Bytes32HexNo0x = BytesHexNo0x & ByteLen32;

/**
 * A 0x-prefixed hexadecimal string representing exactly 65 bytes (132 characters including the prefix).
 */
export type Bytes65Hex = BytesHex & ByteLen65;

/**
 * A hexadecimal string representing exactly 65 bytes without the `0x` prefix (130 characters).
 */
export type Bytes65HexNo0x = BytesHexNo0x & ByteLen65;

/**
 * **Single Source of Truth**: Canonical mapping of byte lengths to their type names.
 *
 * This is the primary definition from which all other byte length types are derived.
 * To add a new byte length:
 * 1. Add entry here (e.g., `readonly 16: 'bytes16'`)
 * 2. Add branded type above (e.g., `export type Bytes16 = Bytes & ByteLen16`)
 * 3. All other types will be automatically derived
 */
type ByteLengthToBytesTypeNameMapInternal = {
  readonly 1: 'bytes1';
  readonly 8: 'bytes8';
  readonly 20: 'bytes20';
  readonly 21: 'bytes21';
  readonly 32: 'bytes32';
  readonly 65: 'bytes65';
};

/**
 * Maps byte lengths to their corresponding branded types (8 -> Bytes8, etc.).
 */
export type ByteLengthToBytesTypeMap = {
  readonly 1: Bytes1;
  readonly 8: Bytes8;
  readonly 20: Bytes20;
  readonly 21: Bytes21;
  readonly 32: Bytes32;
  readonly 65: Bytes65;
};

/**
 * Maps byte lengths to their corresponding branded hex types (8 -> Bytes8Hex, etc.).
 */
export type ByteLengthToBytesHexTypeMap = {
  readonly 1: Bytes1Hex;
  readonly 8: Bytes8Hex;
  readonly 20: Bytes20Hex;
  readonly 21: Bytes21Hex;
  readonly 32: Bytes32Hex;
  readonly 65: Bytes65Hex;
};

/**
 * Maps byte lengths to their corresponding branded hex types (8 -> Bytes8HexNo0x, etc.).
 */
export type ByteLengthToBytesHexNo0xTypeMap = {
  readonly 1: Bytes1HexNo0x;
  readonly 8: Bytes8HexNo0x;
  readonly 20: Bytes20HexNo0x;
  readonly 21: Bytes21HexNo0x;
  readonly 32: Bytes32HexNo0x;
  readonly 65: Bytes65HexNo0x;
};

/**
 * Union of valid byte lengths (8 | 20 | 21 | 32 | 65).
 * Automatically derived from ByteLengthToTypeNameMapInternal.
 */
export type ByteLength = Prettify<keyof ByteLengthToBytesTypeNameMapInternal>;

/**
 * Union of BytesXX type names ('bytes8' | 'bytes20' | 'bytes21' | 'bytes32' | 'bytes65').
 * Automatically derived from ByteLengthToTypeNameMapInternal.
 */
export type BytesXXTypeName = Prettify<
  ByteLengthToBytesTypeNameMapInternal[ByteLength]
>;

/**
 * Maps BytesXX type names to their corresponding byte lengths ('bytes8' -> 8, etc.).
 */
export type BytesTypeNameToByteLengthMap = {
  [K in ByteLength as ByteLengthToBytesTypeNameMapInternal[K]]: K;
};

/**
 * Reverse mapping: byte lengths to their corresponding type names (8 -> 'bytes8', etc.).
 */
export type BytesLengthToByteTypeNameMap = {
  [K in keyof BytesTypeNameToByteLengthMap as BytesTypeNameToByteLengthMap[K]]: K;
};

/**
 * Maps BytesXX type names to their corresponding branded types ('bytes8' -> Bytes8, etc.).
 */
export type BytesTypeNameToTypeMap = {
  [K in keyof BytesTypeNameToByteLengthMap]: ByteLengthToBytesTypeMap[BytesTypeNameToByteLengthMap[K]];
};

/**
 * Compile-time assertion: ensures all ByteLength values are represented
 * in BytesTypeNameToByteLengthMap.
 *
 * If a new ByteLength is added to ByteLengthToTypeMap (e.g., 16: Bytes16),
 * this type will produce a compilation error until a corresponding entry
 * is added to BytesTypeNameToByteLengthMap (e.g., bytes16: 16).
 *
 * @internal
 */
type AssertAllByteLengthsCovered =
  ByteLength extends BytesTypeNameToByteLengthMap[BytesXXTypeName]
    ? true
    : never;

/**
 * Union of BytesXXHex type names ('bytes8Hex' | 'bytes20Hex' | ...).
 */
export type BytesXXHexTypeName =
  `${ByteLengthToBytesTypeNameMapInternal[ByteLength]}Hex`;

/**
 * Maps BytesXXHex type names to their corresponding byte lengths ('bytes8Hex' -> 8, etc.).
 */
export type BytesHexTypeNameToByteLengthMap = {
  [K in ByteLength as `${ByteLengthToBytesTypeNameMapInternal[K]}Hex`]: K;
};

/**
 * Reverse mapping: byte lengths to their corresponding type names (8 -> 'bytes8Hex', etc.).
 */
export type BytesLengthToByteHexTypeNameMap = {
  [K in keyof BytesHexTypeNameToByteLengthMap as BytesHexTypeNameToByteLengthMap[K]]: K;
};

/**
 * Maps BytesXXHex type names to their corresponding branded types ('bytes8Hex' -> Bytes8Hex, etc.).
 */
export type BytesHexTypeNameToTypeMap = {
  [K in keyof BytesHexTypeNameToByteLengthMap]: ByteLengthToBytesHexTypeMap[BytesHexTypeNameToByteLengthMap[K]];
};

/**
 * Union of BytesXXHexNo0x type names ('bytes8HexNo0x' | 'bytes20HexNo0x' | ...).
 */
export type BytesXXHexNo0xTypeName =
  `${ByteLengthToBytesTypeNameMapInternal[ByteLength]}HexNo0x`;

export type BytesTypeName = 'bytes' | BytesXXTypeName;
export type BytesHexTypeName = 'bytesHex' | BytesXXHexTypeName;
export type BytesHexNo0xTypeName = 'bytesHexNo0x' | BytesXXHexNo0xTypeName;

export interface Bytes32HexAble {
  readonly bytes32Hex: Bytes32Hex;
}

export interface Bytes32Able {
  readonly bytes32: Bytes32;
}

////////////////////////////////////////////////////////////////////////////////
//
// Address
//
////////////////////////////////////////////////////////////////////////////////

export type Address = Bytes20Hex & { readonly [__address]: never };
export type ChecksummedAddress = Address & {
  readonly [__checksummedAddress]: never;
};

export type AddressTypeName = 'checksummedAddress' | 'address';
