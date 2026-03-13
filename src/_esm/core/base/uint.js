import { isRecordNonNullableProperty, typeofProperty } from "./record.js";
import { InvalidPropertyError } from "./errors/InvalidPropertyError.js";
import { InvalidTypeError } from "./errors/InvalidTypeError.js";
////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////
// 2^8 - 1 = 255
export const MAX_UINT8 = 0xff;
// 2^16 - 1 = 65535
export const MAX_UINT16 = 0xffff;
// 2^32 - 1 = 4294967295
export const MAX_UINT32 = 0xffffffff;
// 2^64 - 1 = 18446744073709551615
export const MAX_UINT64 = 0xffffffffffffffffn;
// 2^128 - 1 = 340282366920938463463374607431768211455
export const MAX_UINT128 = 0xffffffffffffffffffffffffffffffffn;
// 2^160 - 1 = 1461501637330902918203684832716283019655932542975
export const MAX_UINT160 = 0xffffffffffffffffffffffffffffffffffffffffn;
// 2^256 - 1 = 115792089237316195423570985008687907853269984665640564039457584007913129639935
export const MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
////////////////////////////////////////////////////////////////////////////////
export const MAX_UINT_FOR_TYPE = {
    bool: 1,
    uint8: MAX_UINT8,
    uint16: MAX_UINT16,
    uint32: MAX_UINT32,
    uint64: MAX_UINT64,
    uint128: MAX_UINT128,
    uint160: MAX_UINT160,
    uint256: MAX_UINT256,
    address: MAX_UINT160,
};
Object.freeze(MAX_UINT_FOR_TYPE);
////////////////////////////////////////////////////////////////////////////////
const MAX_UINT_FOR_BYTE_LENGTH = {
    1: MAX_UINT8,
    2: MAX_UINT16,
    4: MAX_UINT32,
    8: MAX_UINT64,
    16: MAX_UINT128,
    20: MAX_UINT160,
    32: MAX_UINT256,
};
Object.freeze(MAX_UINT_FOR_BYTE_LENGTH);
////////////////////////////////////////////////////////////////////////////////
export function isUintNumber(value, max) {
    return (typeof value === "number" &&
        Number.isInteger(value) &&
        value >= 0 &&
        (max === undefined || value <= max));
}
export function isUintBigInt(value, max) {
    return (typeof value === "bigint" &&
        value >= 0 &&
        (max === undefined || value <= max));
}
export function isUintForType(value, typeName) {
    return isUint(value, typeName !== undefined ? MAX_UINT_FOR_TYPE[typeName] : undefined);
}
export function isUintForByteLength(value, byteLength) {
    return isUint(value, byteLength !== undefined ? MAX_UINT_FOR_BYTE_LENGTH[byteLength] : undefined);
}
export function isUint(value, max) {
    return isUintNumber(value, max) || isUintBigInt(value, max);
}
export function isUint8(value) {
    return isUint(value, MAX_UINT8);
}
export function isUint16(value) {
    return isUint(value, MAX_UINT16);
}
export function isUint32(value) {
    return isUint(value, MAX_UINT32);
}
export function isUint64(value) {
    return isUint(value, MAX_UINT64);
}
export function isUint128(value) {
    return isUint(value, MAX_UINT128);
}
export function isUint256(value) {
    return isUint(value, MAX_UINT256);
}
export function isUint64BigInt(value) {
    if (typeof value !== "bigint")
        return false;
    return isUint(value, MAX_UINT64);
}
////////////////////////////////////////////////////////////////////////////////
// Number Conversions
////////////////////////////////////////////////////////////////////////////////
export function numberToBytesHexNo0x(num) {
    const hex = num.toString(16);
    return (hex.length % 2 !== 0 ? "0" + hex : hex);
}
export function numberToBytesHex(num) {
    return `0x${numberToBytesHexNo0x(num)}`;
}
export function numberToBytes32(num) {
    if (!isUintNumber(num)) {
        throw new InvalidTypeError({ expectedType: "uintNumber" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    view.setBigUint64(24, BigInt(num), false);
    return new Uint8Array(buffer);
}
export function numberToBytes8(num) {
    if (!isUintNumber(num)) {
        throw new InvalidTypeError({ expectedType: "uintNumber" }, {});
    }
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(num), false);
    return new Uint8Array(buffer);
}
////////////////////////////////////////////////////////////////////////////////
// Uint Conversions
////////////////////////////////////////////////////////////////////////////////
export function uintToHex0x(uint) {
    return `0x${uint.toString(16)}`;
}
export function uintToBytesHex(uint) {
    const hex = uint.toString(16);
    return (hex.length % 2 !== 0 ? `0x0${hex}` : `0x${hex}`);
}
export function uintToBytesHexNo0x(uint) {
    const hex = uint.toString(16);
    return (hex.length % 2 !== 0 ? `0${hex}` : hex);
}
export function uint256ToBytes32(value) {
    if (!isUint256(value)) {
        throw new InvalidTypeError({ expectedType: "uint256" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const v = BigInt(value);
    // Fill from right to left (big-endian), 8 bytes at a time
    view.setBigUint64(24, v & 0xffffffffffffffffn, false);
    view.setBigUint64(16, (v >> 64n) & 0xffffffffffffffffn, false);
    view.setBigUint64(8, (v >> 128n) & 0xffffffffffffffffn, false);
    view.setBigUint64(0, (v >> 192n) & 0xffffffffffffffffn, false);
    return new Uint8Array(buffer);
}
export function uint32ToBytes32(value) {
    if (!isUint32(value)) {
        throw new InvalidTypeError({ expectedType: "uint32" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const v = Number(value);
    view.setUint32(28, v, false);
    return new Uint8Array(buffer);
}
export function uint64ToBytes32(value) {
    if (!isUint64(value)) {
        throw new InvalidTypeError({ expectedType: "uint64" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const v = BigInt(value);
    view.setBigUint64(24, v, false);
    return new Uint8Array(buffer);
}
////////////////////////////////////////////////////////////////////////////////
// Asserts
////////////////////////////////////////////////////////////////////////////////
export function assertIsUint(value, options) {
    if (!isUint(value, options.max)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint",
        }, options);
    }
}
export function assertIsUintForType(value, typeName, options) {
    if (!isUintForType(value, typeName)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: typeName,
        }, options);
    }
}
export function assertIsUintNumber(value, options) {
    if (!isUintNumber(value, options.max)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uintNumber",
        }, options);
    }
}
export function assertIsUintBigInt(value, options) {
    if (!isUintBigInt(value, options.max)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uintBigInt",
        }, options);
    }
}
export function assertIsUint8(value, options) {
    if (!isUint8(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint8",
        }, options);
    }
}
export function assertIsUint16(value, options) {
    if (!isUint16(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint16",
        }, options);
    }
}
export function assertIsUint32(value, options) {
    if (!isUint32(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint32",
        }, options);
    }
}
export function assertIsUint64(value, options) {
    if (!isUint64(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint64",
        }, options);
    }
}
export function assertIsUint128(value, options) {
    if (!isUint256(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint128",
        }, options);
    }
}
export function assertIsUint256(value, options) {
    if (!isUint256(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint256",
        }, options);
    }
}
////////////////////////////////////////////////////////////////////////////////
// normalizeUintForType
////////////////////////////////////////////////////////////////////////////////
export function normalizeUintForType(value, typeName) {
    switch (typeName) {
        case "uint8":
        case "uint16":
        case "uint32":
            return Number(value);
        case "uint64":
        case "uint128":
        case "uint160":
        case "uint256":
            return BigInt(value);
    }
}
////////////////////////////////////////////////////////////////////////////////
// asUintXX
////////////////////////////////////////////////////////////////////////////////
export function asUintForType(value, typeName, options) {
    assertIsUintForType(value, typeName, options);
    return value;
}
export function asUint(value, options) {
    assertIsUint(value, options ?? {});
    return value;
}
export function asUint8(value, options) {
    assertIsUint8(value, options ?? {});
    return value;
}
export function asUint16(value, options) {
    assertIsUint16(value, options ?? {});
    return value;
}
export function asUint32(value, options) {
    assertIsUint32(value, options ?? {});
    return value;
}
export function asUint64(value, options) {
    assertIsUint64(value, options ?? {});
    return value;
}
export function asUint128(value, options) {
    assertIsUint128(value, options ?? {});
    return value;
}
export function asUint256(value, options) {
    assertIsUint256(value, options ?? {});
    return value;
}
////////////////////////////////////////////////////////////////////////////////
export function asUint8Number(value, options) {
    assertIsUintNumber(value, { max: MAX_UINT8, ...options });
    return value;
}
export function asUint32Number(value, options) {
    assertIsUintNumber(value, { max: MAX_UINT32, ...options });
    return value;
}
export function asUint32BigInt(value, options) {
    assertIsUintBigInt(value, { max: MAX_UINT32, ...options });
    return value;
}
export function asUint64BigInt(value, options) {
    assertIsUintBigInt(value, { max: MAX_UINT64, ...options });
    return value;
}
export function asUint256BigInt(value, options) {
    assertIsUintBigInt(value, { max: MAX_UINT256, ...options });
    return value;
}
////////////////////////////////////////////////////////////////////////////////
// Record property testing
////////////////////////////////////////////////////////////////////////////////
export function isRecordUintProperty(record, property) {
    if (!isRecordNonNullableProperty(record, property)) {
        return false;
    }
    return isUint(record[property]);
}
export function assertRecordUintProperty(record, property, recordName, options) {
    if (!isRecordUintProperty(record, property)) {
        throw new InvalidPropertyError({
            subject: recordName,
            property,
            type: typeofProperty(record, property),
            expectedType: "uint",
        }, options);
    }
}
////////////////////////////////////////////////////////////////////////////////
export function isRecordUint256Property(record, property) {
    if (!isRecordNonNullableProperty(record, property)) {
        return false;
    }
    return isUint256(record[property]);
}
export function assertRecordUint256Property(record, property, recordName, options) {
    if (!isRecordUint256Property(record, property)) {
        throw new InvalidPropertyError({
            subject: recordName,
            property,
            type: typeofProperty(record, property),
            expectedType: "uint256",
        }, options);
    }
}
export function assertRecordUintNumberProperty(record, property, recordName, options) {
    if (typeofProperty(record, property) !== "number" ||
        !isUintNumber(record[property])) {
        throw new InvalidPropertyError({
            subject: recordName,
            property,
            type: typeofProperty(record, property),
            expectedType: "uintNumber",
        }, options);
    }
}
export function assertRecordUintBigIntProperty(record, property, recordName, options) {
    if (typeofProperty(record, property) !== "bigint" ||
        !isUintBigInt(record[property])) {
        throw new InvalidPropertyError({
            subject: recordName,
            property,
            type: typeofProperty(record, property),
            expectedType: "uintBigInt",
        }, options);
    }
}
//# sourceMappingURL=uint.js.map