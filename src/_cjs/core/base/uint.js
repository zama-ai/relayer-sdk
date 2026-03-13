"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_UINT_FOR_TYPE = exports.MAX_UINT256 = exports.MAX_UINT160 = exports.MAX_UINT128 = exports.MAX_UINT64 = exports.MAX_UINT32 = exports.MAX_UINT16 = exports.MAX_UINT8 = void 0;
exports.isUintNumber = isUintNumber;
exports.isUintBigInt = isUintBigInt;
exports.isUintForType = isUintForType;
exports.isUintForByteLength = isUintForByteLength;
exports.isUint = isUint;
exports.isUint8 = isUint8;
exports.isUint16 = isUint16;
exports.isUint32 = isUint32;
exports.isUint64 = isUint64;
exports.isUint128 = isUint128;
exports.isUint256 = isUint256;
exports.isUint64BigInt = isUint64BigInt;
exports.numberToBytesHexNo0x = numberToBytesHexNo0x;
exports.numberToBytesHex = numberToBytesHex;
exports.numberToBytes32 = numberToBytes32;
exports.numberToBytes8 = numberToBytes8;
exports.uintToHex0x = uintToHex0x;
exports.uintToBytesHex = uintToBytesHex;
exports.uintToBytesHexNo0x = uintToBytesHexNo0x;
exports.uint256ToBytes32 = uint256ToBytes32;
exports.uint32ToBytes32 = uint32ToBytes32;
exports.uint64ToBytes32 = uint64ToBytes32;
exports.assertIsUint = assertIsUint;
exports.assertIsUintForType = assertIsUintForType;
exports.assertIsUintNumber = assertIsUintNumber;
exports.assertIsUintBigInt = assertIsUintBigInt;
exports.assertIsUint8 = assertIsUint8;
exports.assertIsUint16 = assertIsUint16;
exports.assertIsUint32 = assertIsUint32;
exports.assertIsUint64 = assertIsUint64;
exports.assertIsUint128 = assertIsUint128;
exports.assertIsUint256 = assertIsUint256;
exports.normalizeUintForType = normalizeUintForType;
exports.asUintForType = asUintForType;
exports.asUint = asUint;
exports.asUint8 = asUint8;
exports.asUint16 = asUint16;
exports.asUint32 = asUint32;
exports.asUint64 = asUint64;
exports.asUint128 = asUint128;
exports.asUint256 = asUint256;
exports.asUint8Number = asUint8Number;
exports.asUint32Number = asUint32Number;
exports.asUint32BigInt = asUint32BigInt;
exports.asUint64BigInt = asUint64BigInt;
exports.asUint256BigInt = asUint256BigInt;
exports.isRecordUintProperty = isRecordUintProperty;
exports.assertRecordUintProperty = assertRecordUintProperty;
exports.isRecordUint256Property = isRecordUint256Property;
exports.assertRecordUint256Property = assertRecordUint256Property;
exports.assertRecordUintNumberProperty = assertRecordUintNumberProperty;
exports.assertRecordUintBigIntProperty = assertRecordUintBigIntProperty;
const record_js_1 = require("./record.js");
const InvalidPropertyError_js_1 = require("./errors/InvalidPropertyError.js");
const InvalidTypeError_js_1 = require("./errors/InvalidTypeError.js");
exports.MAX_UINT8 = 0xff;
exports.MAX_UINT16 = 0xffff;
exports.MAX_UINT32 = 0xffffffff;
exports.MAX_UINT64 = 0xffffffffffffffffn;
exports.MAX_UINT128 = 0xffffffffffffffffffffffffffffffffn;
exports.MAX_UINT160 = 0xffffffffffffffffffffffffffffffffffffffffn;
exports.MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
exports.MAX_UINT_FOR_TYPE = {
    bool: 1,
    uint8: exports.MAX_UINT8,
    uint16: exports.MAX_UINT16,
    uint32: exports.MAX_UINT32,
    uint64: exports.MAX_UINT64,
    uint128: exports.MAX_UINT128,
    uint160: exports.MAX_UINT160,
    uint256: exports.MAX_UINT256,
    address: exports.MAX_UINT160,
};
Object.freeze(exports.MAX_UINT_FOR_TYPE);
const MAX_UINT_FOR_BYTE_LENGTH = {
    1: exports.MAX_UINT8,
    2: exports.MAX_UINT16,
    4: exports.MAX_UINT32,
    8: exports.MAX_UINT64,
    16: exports.MAX_UINT128,
    20: exports.MAX_UINT160,
    32: exports.MAX_UINT256,
};
Object.freeze(MAX_UINT_FOR_BYTE_LENGTH);
function isUintNumber(value, max) {
    return (typeof value === "number" &&
        Number.isInteger(value) &&
        value >= 0 &&
        (max === undefined || value <= max));
}
function isUintBigInt(value, max) {
    return (typeof value === "bigint" &&
        value >= 0 &&
        (max === undefined || value <= max));
}
function isUintForType(value, typeName) {
    return isUint(value, typeName !== undefined ? exports.MAX_UINT_FOR_TYPE[typeName] : undefined);
}
function isUintForByteLength(value, byteLength) {
    return isUint(value, byteLength !== undefined ? MAX_UINT_FOR_BYTE_LENGTH[byteLength] : undefined);
}
function isUint(value, max) {
    return isUintNumber(value, max) || isUintBigInt(value, max);
}
function isUint8(value) {
    return isUint(value, exports.MAX_UINT8);
}
function isUint16(value) {
    return isUint(value, exports.MAX_UINT16);
}
function isUint32(value) {
    return isUint(value, exports.MAX_UINT32);
}
function isUint64(value) {
    return isUint(value, exports.MAX_UINT64);
}
function isUint128(value) {
    return isUint(value, exports.MAX_UINT128);
}
function isUint256(value) {
    return isUint(value, exports.MAX_UINT256);
}
function isUint64BigInt(value) {
    if (typeof value !== "bigint")
        return false;
    return isUint(value, exports.MAX_UINT64);
}
function numberToBytesHexNo0x(num) {
    const hex = num.toString(16);
    return (hex.length % 2 !== 0 ? "0" + hex : hex);
}
function numberToBytesHex(num) {
    return `0x${numberToBytesHexNo0x(num)}`;
}
function numberToBytes32(num) {
    if (!isUintNumber(num)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({ expectedType: "uintNumber" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    view.setBigUint64(24, BigInt(num), false);
    return new Uint8Array(buffer);
}
function numberToBytes8(num) {
    if (!isUintNumber(num)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({ expectedType: "uintNumber" }, {});
    }
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(num), false);
    return new Uint8Array(buffer);
}
function uintToHex0x(uint) {
    return `0x${uint.toString(16)}`;
}
function uintToBytesHex(uint) {
    const hex = uint.toString(16);
    return (hex.length % 2 !== 0 ? `0x0${hex}` : `0x${hex}`);
}
function uintToBytesHexNo0x(uint) {
    const hex = uint.toString(16);
    return (hex.length % 2 !== 0 ? `0${hex}` : hex);
}
function uint256ToBytes32(value) {
    if (!isUint256(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({ expectedType: "uint256" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const v = BigInt(value);
    view.setBigUint64(24, v & 0xffffffffffffffffn, false);
    view.setBigUint64(16, (v >> 64n) & 0xffffffffffffffffn, false);
    view.setBigUint64(8, (v >> 128n) & 0xffffffffffffffffn, false);
    view.setBigUint64(0, (v >> 192n) & 0xffffffffffffffffn, false);
    return new Uint8Array(buffer);
}
function uint32ToBytes32(value) {
    if (!isUint32(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({ expectedType: "uint32" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const v = Number(value);
    view.setUint32(28, v, false);
    return new Uint8Array(buffer);
}
function uint64ToBytes32(value) {
    if (!isUint64(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({ expectedType: "uint64" }, {});
    }
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    const v = BigInt(value);
    view.setBigUint64(24, v, false);
    return new Uint8Array(buffer);
}
function assertIsUint(value, options) {
    if (!isUint(value, options.max)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint",
        }, options);
    }
}
function assertIsUintForType(value, typeName, options) {
    if (!isUintForType(value, typeName)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: typeName,
        }, options);
    }
}
function assertIsUintNumber(value, options) {
    if (!isUintNumber(value, options.max)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uintNumber",
        }, options);
    }
}
function assertIsUintBigInt(value, options) {
    if (!isUintBigInt(value, options.max)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uintBigInt",
        }, options);
    }
}
function assertIsUint8(value, options) {
    if (!isUint8(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint8",
        }, options);
    }
}
function assertIsUint16(value, options) {
    if (!isUint16(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint16",
        }, options);
    }
}
function assertIsUint32(value, options) {
    if (!isUint32(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint32",
        }, options);
    }
}
function assertIsUint64(value, options) {
    if (!isUint64(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint64",
        }, options);
    }
}
function assertIsUint128(value, options) {
    if (!isUint256(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint128",
        }, options);
    }
}
function assertIsUint256(value, options) {
    if (!isUint256(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "uint256",
        }, options);
    }
}
function normalizeUintForType(value, typeName) {
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
function asUintForType(value, typeName, options) {
    assertIsUintForType(value, typeName, options);
    return value;
}
function asUint(value, options) {
    assertIsUint(value, options ?? {});
    return value;
}
function asUint8(value, options) {
    assertIsUint8(value, options ?? {});
    return value;
}
function asUint16(value, options) {
    assertIsUint16(value, options ?? {});
    return value;
}
function asUint32(value, options) {
    assertIsUint32(value, options ?? {});
    return value;
}
function asUint64(value, options) {
    assertIsUint64(value, options ?? {});
    return value;
}
function asUint128(value, options) {
    assertIsUint128(value, options ?? {});
    return value;
}
function asUint256(value, options) {
    assertIsUint256(value, options ?? {});
    return value;
}
function asUint8Number(value, options) {
    assertIsUintNumber(value, { max: exports.MAX_UINT8, ...options });
    return value;
}
function asUint32Number(value, options) {
    assertIsUintNumber(value, { max: exports.MAX_UINT32, ...options });
    return value;
}
function asUint32BigInt(value, options) {
    assertIsUintBigInt(value, { max: exports.MAX_UINT32, ...options });
    return value;
}
function asUint64BigInt(value, options) {
    assertIsUintBigInt(value, { max: exports.MAX_UINT64, ...options });
    return value;
}
function asUint256BigInt(value, options) {
    assertIsUintBigInt(value, { max: exports.MAX_UINT256, ...options });
    return value;
}
function isRecordUintProperty(record, property) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(record, property)) {
        return false;
    }
    return isUint(record[property]);
}
function assertRecordUintProperty(record, property, recordName, options) {
    if (!isRecordUintProperty(record, property)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            type: (0, record_js_1.typeofProperty)(record, property),
            expectedType: "uint",
        }, options);
    }
}
function isRecordUint256Property(record, property) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(record, property)) {
        return false;
    }
    return isUint256(record[property]);
}
function assertRecordUint256Property(record, property, recordName, options) {
    if (!isRecordUint256Property(record, property)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            type: (0, record_js_1.typeofProperty)(record, property),
            expectedType: "uint256",
        }, options);
    }
}
function assertRecordUintNumberProperty(record, property, recordName, options) {
    if ((0, record_js_1.typeofProperty)(record, property) !== "number" ||
        !isUintNumber(record[property])) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            type: (0, record_js_1.typeofProperty)(record, property),
            expectedType: "uintNumber",
        }, options);
    }
}
function assertRecordUintBigIntProperty(record, property, recordName, options) {
    if ((0, record_js_1.typeofProperty)(record, property) !== "bigint" ||
        !isUintBigInt(record[property])) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            type: (0, record_js_1.typeofProperty)(record, property),
            expectedType: "uintBigInt",
        }, options);
    }
}
//# sourceMappingURL=uint.js.map