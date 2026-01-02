import type { Prettify } from './utils';

/**
 * Unsigned integer represented as a JavaScript number.
 *
 * Note: JavaScript numbers are 64-bit floats, so this is only safe for
 * integers up to Number.MAX_SAFE_INTEGER (2^53 - 1).
 */
export type UintNumber = number;

/**
 * Unsigned integer represented as a JavaScript bigint.
 */
export type UintBigInt = bigint;

/**
 * Unsigned integer represented as a JavaScript number or bigint.
 */
export type Uint = UintNumber | UintBigInt;

/**
 * 8-bits Unsigned integer.
 */
export type Uint8 = UintNumber | UintBigInt;

/**
 * 16-bits Unsigned integer.
 */
export type Uint16 = UintNumber | UintBigInt;

/**
 * 32-bits Unsigned integer.
 */
export type Uint32 = UintNumber | UintBigInt;

/**
 * 64-bits Unsigned integer.
 */
export type Uint64 = UintNumber | UintBigInt;

/**
 * 128-bits Unsigned integer.
 */
export type Uint128 = UintNumber | UintBigInt;

/**
 * 256-bits Unsigned integer.
 */
export type Uint256 = UintNumber | UintBigInt;

/**
 * String literal union of unsigned integer type names.
 */
export type UintTypeName =
  | 'Uint'
  | 'Uint8'
  | 'Uint16'
  | 'Uint32'
  | 'Uint64'
  | 'Uint128'
  | 'Uint256';

/**
 * 64-bits Unsigned integer represented as a JavaScript bigint.
 */
export type Uint64BigInt = UintBigInt;

/**
 * A 0x-prefixed hexadecimal string.
 *
 * Unlike `BytesHex`, the length can be odd or even (e.g., `0x1` or `0x01` are both valid).
 */
export type Hex = `0x${string}`;

export type Bytes = Uint8Array;
export type Bytes8 = Uint8Array;
export type Bytes32 = Uint8Array;
export type Bytes65 = Uint8Array;

/**
 * A 0x-prefixed hexadecimal string representing byte data.
 *
 * The length must be even (excluding the `0x` prefix) since each byte is
 * represented by two hex characters. Use `Hex` if odd-length strings are acceptable.
 *
 * @example
 * const data: BytesHex = '0x48656c6c6f'; // "Hello" in hex
 */
export type BytesHex = `0x${string}`;

/**
 * A hexadecimal string representing byte data without the `0x` prefix.
 * @see {@link BytesHex}
 */
export type BytesHexNo0x = string;

/**
 * A 0x-prefixed hexadecimal string representing exactly 21 bytes (44 characters - inluding the prefix).
 */
export type Bytes21Hex = `0x${string}`;

/**
 * A hexadecimal string representing exactly 21 bytes without the `0x` prefix (42 characters).
 */
export type Bytes21HexNo0x = string;

/**
 * A 0x-prefixed hexadecimal string representing exactly 32 bytes (66 characters - inluding the prefix).
 */
export type Bytes32Hex = `0x${string}`;

/**
 * A hexadecimal string representing exactly 32 bytes without the `0x` prefix (64 characters).
 */
export type Bytes32HexNo0x = string;

/**
 * A 0x-prefixed hexadecimal string representing exactly 65 bytes (132 characters - inluding the prefix).
 */
export type Bytes65Hex = `0x${string}`;

/**
 * A hexadecimal string representing exactly 65 bytes without the `0x` prefix (130 characters).
 */
export type Bytes65HexNo0x = string;

export type BytesTypeName = 'Bytes' | 'Bytes8' | 'Bytes32' | 'Bytes65';
export type BytesHexTypeName =
  | 'BytesHex'
  | 'Bytes8Hex'
  | 'Bytes32Hex'
  | 'Bytes65Hex';
export type BytesHexNo0xTypeName =
  | 'BytesHexNo0x'
  | 'Bytes8HexNo0x'
  | 'Bytes32HexNo0x'
  | 'Bytes65HexNo0x';

export type ChecksummedAddress = `0x${string}`;

/**
 * **FHE Type Mapping for Input Builders**
 * * Maps the **number of encrypted bits** used by a FHEVM primary type
 * to its corresponding **FheTypeId**. This constant is primarily used by
 * `EncryptedInput` and `RelayerEncryptedInput` builders to determine the correct
 * input type and calculate the total required bit-length.
 *
 * **Structure: \{ Encrypted Bit Length: FheTypeId \}**
 *
 * | Bits | FheTypeId | FHE Type Name | Note |
 * | :--- | :-------- | :------------ | :--- |
 * | 2    | 0         | `ebool`         | The boolean type. |
 * | (N/A)| 1         | `euint4`        | **Deprecated** and omitted from this map. |
 * | 8    | 2         | `euint8`        | |
 * | 16   | 3         | `euint16`       | |
 * | 32   | 4         | `euint32`       | |
 * | 64   | 5         | `euint64`       | |
 * | 128  | 6         | `euint128`      | |
 * | 160  | 7         | `eaddress`      | Used for encrypted Ethereum addresses. |
 * | 256  | 8         | `euint256`      | The maximum supported integer size. |
 */
export type FheTypeName = Prettify<keyof FheTypeNameToIdMap>;
export type FheTypeId = Prettify<keyof FheTypeIdToNameMap>;
export type FheTypeEncryptionBitwidth = Prettify<
  keyof FheTypeEncryptionBitwidthToIdMap
>;

export interface FheTypeNameToIdMap {
  ebool: 0;
  //euint4: 1; has been deprecated
  euint8: 2;
  euint16: 3;
  euint32: 4;
  euint64: 5;
  euint128: 6;
  eaddress: 7;
  euint256: 8;
}

export interface FheTypeIdToNameMap {
  0: 'ebool';
  //1: 'euint4' has been deprecated
  2: 'euint8';
  3: 'euint16';
  4: 'euint32';
  5: 'euint64';
  6: 'euint128';
  7: 'eaddress';
  8: 'euint256';
}

export type SolidityPrimitiveTypeName = 'bool' | 'uint256' | 'address';

/**
 * Bitwidth to FheTypeId
 */
export interface FheTypeEncryptionBitwidthToIdMap {
  2: FheTypeNameToIdMap['ebool'];
  // ??: FheTypeNameToIdMap['euint4'];
  8: FheTypeNameToIdMap['euint8'];
  16: FheTypeNameToIdMap['euint16'];
  32: FheTypeNameToIdMap['euint32'];
  64: FheTypeNameToIdMap['euint64'];
  128: FheTypeNameToIdMap['euint128'];
  160: FheTypeNameToIdMap['eaddress'];
  256: FheTypeNameToIdMap['euint256'];
}

/**
 * FheTypeId to Bitwidth
 */
export type FheTypeIdToEncryptionBitwidthMap = {
  [K in keyof FheTypeEncryptionBitwidthToIdMap as FheTypeEncryptionBitwidthToIdMap[K]]: K;
};

export type EncryptionBits = FheTypeEncryptionBitwidth;

export interface ZKProofLike {
  readonly chainId: bigint | number;
  readonly aclContractAddress: string;
  readonly contractAddress: string;
  readonly userAddress: string;
  readonly ciphertextWithZKProof: Uint8Array | string;
  readonly encryptionBits: readonly number[];
}

export interface ZKProofType extends ZKProofLike {
  readonly chainId: Uint64BigInt;
  readonly aclContractAddress: ChecksummedAddress;
  readonly contractAddress: ChecksummedAddress;
  readonly userAddress: ChecksummedAddress;
  readonly ciphertextWithZKProof: Bytes;
  readonly encryptionBits: readonly EncryptionBits[];
}

export type FheTypedValue<T extends FheTypeName> = {
  value: T extends 'ebool'
    ? boolean
    : T extends 'eaddress'
      ? string
      : number | bigint;
  fheType: T;
};
