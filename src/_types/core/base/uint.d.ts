import type { Bytes32, Bytes8, BytesHex, BytesHexNo0x, Hex0x, Uint, Uint128, Uint16, Uint256, Uint256BigInt, Uint32, Uint32BigInt, Uint32Number, Uint64, Uint64BigInt, Uint8, Uint8Number, UintBigInt, UintMap, UintNormalizedMap, UintNumber, UintTypeName, ValueTypeName } from "../types/primitives.js";
import type { RecordWithPropertyType, RecordUintPropertyType, RecordUint256PropertyType } from "../types/record-p.js";
import type { ErrorMetadataParams } from "./errors/ErrorBase.js";
export declare const MAX_UINT8 = 255;
export declare const MAX_UINT16 = 65535;
export declare const MAX_UINT32 = 4294967295;
export declare const MAX_UINT64 = 18446744073709551615n;
export declare const MAX_UINT128 = 340282366920938463463374607431768211455n;
export declare const MAX_UINT160 = 1461501637330902918203684832716283019655932542975n;
export declare const MAX_UINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;
export declare const MAX_UINT_FOR_TYPE: Readonly<Record<ValueTypeName | "uint160", number | bigint>>;
declare const MAX_UINT_FOR_BYTE_LENGTH: Readonly<Record<1 | 2 | 4 | 8 | 16 | 20 | 32, Uint>>;
export declare function isUintNumber(value: unknown, max?: number | bigint): value is UintNumber;
export declare function isUintBigInt(value: unknown, max?: bigint | number): value is UintBigInt;
export declare function isUintForType(value: unknown, typeName?: UintTypeName): value is Uint;
export declare function isUintForByteLength(value: unknown, byteLength?: keyof typeof MAX_UINT_FOR_BYTE_LENGTH): value is Uint;
export declare function isUint(value: unknown, max?: number | bigint): value is Uint;
export declare function isUint8(value: unknown): value is Uint8;
export declare function isUint16(value: unknown): value is Uint16;
export declare function isUint32(value: unknown): value is Uint32;
export declare function isUint64(value: unknown): value is Uint64;
export declare function isUint128(value: unknown): value is Uint128;
export declare function isUint256(value: unknown): value is Uint256;
export declare function isUint64BigInt(value: unknown): value is Uint64BigInt;
export declare function numberToBytesHexNo0x(num: number): BytesHexNo0x;
export declare function numberToBytesHex(num: number): BytesHex;
export declare function numberToBytes32(num: number): Bytes32;
export declare function numberToBytes8(num: number): Bytes8;
export declare function uintToHex0x(uint: Uint): Hex0x;
export declare function uintToBytesHex(uint: Uint): BytesHex;
export declare function uintToBytesHexNo0x(uint: Uint): BytesHexNo0x;
export declare function uint256ToBytes32(value: unknown): Bytes32;
export declare function uint32ToBytes32(value: unknown): Bytes32;
export declare function uint64ToBytes32(value: unknown): Bytes32;
export declare function assertIsUint(value: unknown, options: {
    max?: bigint | number;
    subject?: string;
} & ErrorMetadataParams): asserts value is Uint;
export declare function assertIsUintForType<T extends UintTypeName>(value: unknown, typeName: T, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is UintMap[T];
export declare function assertIsUintNumber(value: unknown, options: {
    max?: bigint | number;
    subject?: string;
} & ErrorMetadataParams): asserts value is UintNumber;
export declare function assertIsUintBigInt(value: unknown, options: {
    max?: bigint | number;
    subject?: string;
} & ErrorMetadataParams): asserts value is UintBigInt;
export declare function assertIsUint8(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Uint8;
export declare function assertIsUint16(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Uint16;
export declare function assertIsUint32(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Uint32;
export declare function assertIsUint64(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Uint64;
export declare function assertIsUint128(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Uint128;
export declare function assertIsUint256(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is Uint256;
export declare function normalizeUintForType<T extends UintTypeName>(value: Uint, typeName: T): UintNormalizedMap[T];
export declare function asUintForType<T extends UintTypeName>(value: unknown, typeName: T, options: {
    subject?: string;
} & ErrorMetadataParams): UintMap[T];
export declare function asUint(value: unknown, options?: {
    max?: number | bigint;
    subject?: string;
} & ErrorMetadataParams): Uint;
export declare function asUint8(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint8;
export declare function asUint16(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint16;
export declare function asUint32(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint32;
export declare function asUint64(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint64;
export declare function asUint128(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint128;
export declare function asUint256(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint256;
export declare function asUint8Number(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint8Number;
export declare function asUint32Number(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint32Number;
export declare function asUint32BigInt(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint32BigInt;
export declare function asUint64BigInt(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint64BigInt;
export declare function asUint256BigInt(value: unknown, options?: {
    subject?: string;
} & ErrorMetadataParams): Uint256BigInt;
export declare function isRecordUintProperty<K extends string>(record: unknown, property: K): record is RecordUintPropertyType<K>;
export declare function assertRecordUintProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Uint>;
export declare function isRecordUint256Property<K extends string>(record: unknown, property: K): record is RecordUint256PropertyType<K>;
export declare function assertRecordUint256Property<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, Uint256>;
export declare function assertRecordUintNumberProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, number>;
export declare function assertRecordUintBigIntProperty<K extends string>(record: unknown, property: K, recordName: string, options: ErrorMetadataParams): asserts record is RecordWithPropertyType<K, number>;
export {};
//# sourceMappingURL=uint.d.ts.map