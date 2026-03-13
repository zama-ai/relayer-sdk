"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteLengthForType = void 0;
exports.isBytes = isBytes;
exports.isBytesForType = isBytesForType;
exports.isBytes1 = isBytes1;
exports.isBytes8 = isBytes8;
exports.isBytes20 = isBytes20;
exports.isBytes21 = isBytes21;
exports.isBytes32 = isBytes32;
exports.isBytes65 = isBytes65;
exports.isBytesHex = isBytesHex;
exports.isBytes1Hex = isBytes1Hex;
exports.isBytes8Hex = isBytes8Hex;
exports.isBytes20Hex = isBytes20Hex;
exports.isBytes21Hex = isBytes21Hex;
exports.isBytes32Hex = isBytes32Hex;
exports.isBytes65Hex = isBytes65Hex;
exports.isBytesHexNo0x = isBytesHexNo0x;
exports.isBytes1HexNo0x = isBytes1HexNo0x;
exports.isBytes8HexNo0x = isBytes8HexNo0x;
exports.isBytes20HexNo0x = isBytes20HexNo0x;
exports.isBytes21HexNo0x = isBytes21HexNo0x;
exports.isBytes32HexNo0x = isBytes32HexNo0x;
exports.isBytes65HexNo0x = isBytes65HexNo0x;
exports.assertIsBytes = assertIsBytes;
exports.assertIsBytesForType = assertIsBytesForType;
exports.assertIsBytes1 = assertIsBytes1;
exports.assertIsBytes8 = assertIsBytes8;
exports.assertIsBytes20 = assertIsBytes20;
exports.assertIsBytes21 = assertIsBytes21;
exports.assertIsBytes32 = assertIsBytes32;
exports.assertIsBytes65 = assertIsBytes65;
exports.asBytesForType = asBytesForType;
exports.asBytes = asBytes;
exports.asBytes1 = asBytes1;
exports.asBytes8 = asBytes8;
exports.asBytes20 = asBytes20;
exports.asBytes21 = asBytes21;
exports.asBytes32 = asBytes32;
exports.asBytes65 = asBytes65;
exports.assertIsBytesHex = assertIsBytesHex;
exports.assertIsBytes1Hex = assertIsBytes1Hex;
exports.assertIsBytes8Hex = assertIsBytes8Hex;
exports.assertIsBytes20Hex = assertIsBytes20Hex;
exports.assertIsBytes21Hex = assertIsBytes21Hex;
exports.assertIsBytes32Hex = assertIsBytes32Hex;
exports.assertIsBytes65Hex = assertIsBytes65Hex;
exports.asBytesHex = asBytesHex;
exports.asBytes1Hex = asBytes1Hex;
exports.asBytes8Hex = asBytes8Hex;
exports.asBytes20Hex = asBytes20Hex;
exports.asBytes21Hex = asBytes21Hex;
exports.asBytes32Hex = asBytes32Hex;
exports.asBytes65Hex = asBytes65Hex;
exports.assertIsBytesHexNo0x = assertIsBytesHexNo0x;
exports.assertIsBytes1HexNo0x = assertIsBytes1HexNo0x;
exports.assertIsBytes8HexNo0x = assertIsBytes8HexNo0x;
exports.assertIsBytes20HexNo0x = assertIsBytes20HexNo0x;
exports.assertIsBytes21HexNo0x = assertIsBytes21HexNo0x;
exports.assertIsBytes32HexNo0x = assertIsBytes32HexNo0x;
exports.assertIsBytes65HexNo0x = assertIsBytes65HexNo0x;
exports.asBytesHexNo0x = asBytesHexNo0x;
exports.asBytes1HexNo0x = asBytes1HexNo0x;
exports.asBytes8HexNo0x = asBytes8HexNo0x;
exports.asBytes20HexNo0x = asBytes20HexNo0x;
exports.asBytes21HexNo0x = asBytes21HexNo0x;
exports.asBytes32HexNo0x = asBytes32HexNo0x;
exports.asBytes65HexNo0x = asBytes65HexNo0x;
exports.assertIsBytesHexArray = assertIsBytesHexArray;
exports.assertIsBytesArray = assertIsBytesArray;
exports.assertIsBytes1HexArray = assertIsBytes1HexArray;
exports.assertIsBytes8HexArray = assertIsBytes8HexArray;
exports.assertIsBytes20HexArray = assertIsBytes20HexArray;
exports.assertIsBytes21HexArray = assertIsBytes21HexArray;
exports.assertIsBytes32HexArray = assertIsBytes32HexArray;
exports.assertIsBytes65HexArray = assertIsBytes65HexArray;
exports.assertIsBytes32Array = assertIsBytes32Array;
exports.isRecordBytesHexProperty = isRecordBytesHexProperty;
exports.isRecordBytes1HexProperty = isRecordBytes1HexProperty;
exports.isRecordBytes8HexProperty = isRecordBytes8HexProperty;
exports.isRecordBytes20HexProperty = isRecordBytes20HexProperty;
exports.isRecordBytes21HexProperty = isRecordBytes21HexProperty;
exports.isRecordBytes32HexProperty = isRecordBytes32HexProperty;
exports.isRecordBytes65HexProperty = isRecordBytes65HexProperty;
exports.assertRecordBytesHexProperty = assertRecordBytesHexProperty;
exports.assertRecordBytes1HexProperty = assertRecordBytes1HexProperty;
exports.assertRecordBytes8HexProperty = assertRecordBytes8HexProperty;
exports.assertRecordBytes20HexProperty = assertRecordBytes20HexProperty;
exports.assertRecordBytes21HexProperty = assertRecordBytes21HexProperty;
exports.assertRecordBytes32HexProperty = assertRecordBytes32HexProperty;
exports.assertRecordBytes65HexProperty = assertRecordBytes65HexProperty;
exports.isRecordBytesHexNo0xProperty = isRecordBytesHexNo0xProperty;
exports.assertRecordBytesHexNo0xProperty = assertRecordBytesHexNo0xProperty;
exports.assertRecordBytesHexArrayProperty = assertRecordBytesHexArrayProperty;
exports.assertRecordBytes1HexArrayProperty = assertRecordBytes1HexArrayProperty;
exports.assertRecordBytes8HexArrayProperty = assertRecordBytes8HexArrayProperty;
exports.assertRecordBytes20HexArrayProperty = assertRecordBytes20HexArrayProperty;
exports.assertRecordBytes21HexArrayProperty = assertRecordBytes21HexArrayProperty;
exports.assertRecordBytes32HexArrayProperty = assertRecordBytes32HexArrayProperty;
exports.assertRecordBytes65HexArrayProperty = assertRecordBytes65HexArrayProperty;
exports.assertRecordBytesHexNo0xArrayProperty = assertRecordBytesHexNo0xArrayProperty;
exports.isRecordUint8ArrayProperty = isRecordUint8ArrayProperty;
exports.assertRecordUint8ArrayProperty = assertRecordUint8ArrayProperty;
exports.bytesToHexNo0x = bytesToHexNo0x;
exports.bytesToHex = bytesToHex;
exports.bytes1ToHex = bytes1ToHex;
exports.bytes8ToHex = bytes8ToHex;
exports.bytes20ToHex = bytes20ToHex;
exports.bytes21ToHex = bytes21ToHex;
exports.bytes32ToHex = bytes32ToHex;
exports.bytes65ToHex = bytes65ToHex;
exports.bytesToHexLarge = bytesToHexLarge;
exports.hexToBytes = hexToBytes;
exports.hexToBytes1 = hexToBytes1;
exports.hexToBytes8 = hexToBytes8;
exports.hexToBytes20 = hexToBytes20;
exports.hexToBytes21 = hexToBytes21;
exports.hexToBytes32 = hexToBytes32;
exports.hexToBytes65 = hexToBytes65;
exports.hexToBytesFaster = hexToBytesFaster;
exports.bytesToBigInt = bytesToBigInt;
exports.bigIntToBytesHex = bigIntToBytesHex;
exports.toBytes32HexArray = toBytes32HexArray;
exports.toBytes32 = toBytes32;
exports.toBytes = toBytes;
exports.concatBytes = concatBytes;
exports.concatBytesHex = concatBytesHex;
exports.unsafeBytesEquals = unsafeBytesEquals;
exports.normalizeBytes = normalizeBytes;
exports.bytesUint8At = bytesUint8At;
exports.bytesHexUint8At = bytesHexUint8At;
exports.bytesHexUint64At = bytesHexUint64At;
exports.bytesHexSlice = bytesHexSlice;
const record_js_1 = require("./record.js");
const string_js_1 = require("./string.js");
const InvalidPropertyError_js_1 = require("./errors/InvalidPropertyError.js");
const InvalidTypeError_js_1 = require("./errors/InvalidTypeError.js");
const uint_js_1 = require("./uint.js");
exports.ByteLengthForType = {
    bytes1: 1,
    bytes2: 2,
    bytes4: 4,
    bytes8: 8,
    bytes20: 20,
    bytes21: 21,
    bytes32: 32,
    bytes65: 65,
};
Object.freeze(exports.ByteLengthForType);
const bytesHexRegex = /^0x[a-fA-F0-9]*$/;
const bytesHexNo0xRegex = /^[a-fA-F0-9]*$/;
function isBytes(value, byteLength) {
    if (value === undefined || value === null) {
        return false;
    }
    if (!(value instanceof Uint8Array)) {
        return false;
    }
    return byteLength !== undefined ? value.length === byteLength : true;
}
function isBytesForType(value, typeName) {
    return isBytes(value, typeName !== undefined ? exports.ByteLengthForType[typeName] : undefined);
}
function isBytes1(value) {
    return isBytes(value, 1);
}
function isBytes8(value) {
    return isBytes(value, 8);
}
function isBytes20(value) {
    return isBytes(value, 20);
}
function isBytes21(value) {
    return isBytes(value, 21);
}
function isBytes32(value) {
    return isBytes(value, 32);
}
function isBytes65(value) {
    return isBytes(value, 65);
}
function isBytesHex(value, byteLength) {
    if (!(0, string_js_1.is0x)(value)) {
        return false;
    }
    if (byteLength !== undefined && value.length !== 2 * byteLength + 2) {
        return false;
    }
    if ((value.length - 2) % 2 !== 0) {
        return false;
    }
    return bytesHexRegex.test(value);
}
function isBytes1Hex(value) {
    return isBytesHex(value, 1);
}
function isBytes8Hex(value) {
    return isBytesHex(value, 8);
}
function isBytes20Hex(value) {
    return isBytesHex(value, 20);
}
function isBytes21Hex(value) {
    return isBytesHex(value, 21);
}
function isBytes32Hex(value) {
    return isBytesHex(value, 32);
}
function isBytes65Hex(value) {
    return isBytesHex(value, 65);
}
function isBytesHexNo0x(value, byteLength) {
    if (!(0, string_js_1.isNo0x)(value)) {
        return false;
    }
    if (byteLength !== undefined && value.length !== 2 * byteLength) {
        return false;
    }
    if (value.length % 2 !== 0) {
        return false;
    }
    if (!bytesHexNo0xRegex.test(value)) {
        return false;
    }
    return true;
}
function isBytes1HexNo0x(value) {
    return isBytesHexNo0x(value, 1);
}
function isBytes8HexNo0x(value) {
    return isBytesHexNo0x(value, 8);
}
function isBytes20HexNo0x(value) {
    return isBytesHexNo0x(value, 20);
}
function isBytes21HexNo0x(value) {
    return isBytesHexNo0x(value, 21);
}
function isBytes32HexNo0x(value) {
    return isBytesHexNo0x(value, 32);
}
function isBytes65HexNo0x(value) {
    return isBytesHexNo0x(value, 65);
}
function assertIsBytes(value, options) {
    if (!isBytes(value, options?.byteLength)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options?.subject,
            expectedType: `bytes${options?.byteLength ?? ""}`,
        }, options ?? {});
    }
}
function assertIsBytesForType(value, options) {
    if (!isBytesForType(value, options?.typeName)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options?.subject,
            expectedType: options?.typeName ?? "bytes",
        }, options ?? {});
    }
}
function assertIsBytes1(value, options) {
    assertIsBytes(value, { byteLength: 1, ...options });
}
function assertIsBytes8(value, options) {
    assertIsBytes(value, { byteLength: 8, ...options });
}
function assertIsBytes20(value, options) {
    assertIsBytes(value, { byteLength: 20, ...options });
}
function assertIsBytes21(value, options) {
    assertIsBytes(value, { byteLength: 21, ...options });
}
function assertIsBytes32(value, options) {
    assertIsBytes(value, { byteLength: 32, ...options });
}
function assertIsBytes65(value, options) {
    assertIsBytes(value, { byteLength: 65, ...options });
}
function asBytesForType(value, options) {
    assertIsBytesForType(value, options);
    return value;
}
function asBytes(value, options) {
    assertIsBytes(value, options);
    return value;
}
function asBytes1(value, options) {
    assertIsBytes(value, { byteLength: 1, ...options });
    return value;
}
function asBytes8(value, options) {
    assertIsBytes(value, { byteLength: 8, ...options });
    return value;
}
function asBytes20(value, options) {
    assertIsBytes(value, { byteLength: 20, ...options });
    return value;
}
function asBytes21(value, options) {
    assertIsBytes(value, { byteLength: 21, ...options });
    return value;
}
function asBytes32(value, options) {
    assertIsBytes(value, { byteLength: 32, ...options });
    return value;
}
function asBytes65(value, options) {
    assertIsBytes(value, { byteLength: 65, ...options });
    return value;
}
function assertIsBytesHex(value, options) {
    if (!isBytesHex(value, options.byteLength)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: `bytes${options.byteLength ?? ""}Hex`,
        }, options);
    }
}
function assertIsBytes1Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 1, ...options });
}
function assertIsBytes8Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 8, ...options });
}
function assertIsBytes20Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 20, ...options });
}
function assertIsBytes21Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 21, ...options });
}
function assertIsBytes32Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 32, ...options });
}
function assertIsBytes65Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 65, ...options });
}
function asBytesHex(value, options) {
    assertIsBytesHex(value, options ?? {});
    return value;
}
function asBytes1Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 1, ...options });
    return value;
}
function asBytes8Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 8, ...options });
    return value;
}
function asBytes20Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 20, ...options });
    return value;
}
function asBytes21Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 21, ...options });
    return value;
}
function asBytes32Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 32, ...options });
    return value;
}
function asBytes65Hex(value, options) {
    assertIsBytesHex(value, { byteLength: 65, ...options });
    return value;
}
function assertIsBytesHexNo0x(value, options) {
    if (!isBytesHexNo0x(value, options.byteLength)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: `bytes${options.byteLength ?? ""}HexNo0x`,
        }, options);
    }
}
function assertIsBytes1HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 1, ...options });
}
function assertIsBytes8HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 8, ...options });
}
function assertIsBytes20HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 20, ...options });
}
function assertIsBytes21HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 21, ...options });
}
function assertIsBytes32HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 32, ...options });
}
function assertIsBytes65HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 65, ...options });
}
function asBytesHexNo0x(value, options) {
    assertIsBytesHexNo0x(value, options ?? {});
    return value;
}
function asBytes1HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 1, ...options });
    return value;
}
function asBytes8HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 8, ...options });
    return value;
}
function asBytes20HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 20, ...options });
    return value;
}
function asBytes21HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 21, ...options });
    return value;
}
function asBytes32HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 32, ...options });
    return value;
}
function asBytes65HexNo0x(value, options) {
    assertIsBytesHexNo0x(value, { byteLength: 65, ...options });
    return value;
}
function assertIsBytesHexArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: `bytes${options.byteLength ?? ""}Hex[]`,
        }, options);
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isBytesHex(value[i], options.byteLength)) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof value[i],
                expectedType: `bytes${options.byteLength ?? ""}Hex`,
            }, options);
        }
    }
}
function assertIsBytesArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: `bytes${options.byteLength ?? ""}[]`,
        }, options);
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isBytes(value[i], options.byteLength)) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof value[i],
                expectedType: `bytes${options.byteLength ?? ""}`,
            }, options);
        }
    }
}
function assertIsBytes1HexArray(value, options) {
    assertIsBytesHexArray(value, { byteLength: 1, ...options });
}
function assertIsBytes8HexArray(value, options) {
    assertIsBytesHexArray(value, { byteLength: 8, ...options });
}
function assertIsBytes20HexArray(value, options) {
    assertIsBytesHexArray(value, { byteLength: 20, ...options });
}
function assertIsBytes21HexArray(value, options) {
    assertIsBytesHexArray(value, { byteLength: 21, ...options });
}
function assertIsBytes32HexArray(value, options) {
    assertIsBytesHexArray(value, { byteLength: 32, ...options });
}
function assertIsBytes65HexArray(value, options) {
    assertIsBytesHexArray(value, { byteLength: 65, ...options });
}
function assertIsBytes32Array(value, options) {
    assertIsBytesArray(value, { byteLength: 32, ...options });
}
function isRecordBytesHexProperty(record, property, byteLength) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(record, property)) {
        return false;
    }
    return isBytesHex(record[property], byteLength);
}
function isRecordBytes1HexProperty(record, property) {
    return isRecordBytesHexProperty(record, property, 1);
}
function isRecordBytes8HexProperty(record, property) {
    return isRecordBytesHexProperty(record, property, 8);
}
function isRecordBytes20HexProperty(record, property) {
    return isRecordBytesHexProperty(record, property, 20);
}
function isRecordBytes21HexProperty(record, property) {
    return isRecordBytesHexProperty(record, property, 21);
}
function isRecordBytes32HexProperty(record, property) {
    return isRecordBytesHexProperty(record, property, 32);
}
function isRecordBytes65HexProperty(record, property) {
    return isRecordBytesHexProperty(record, property, 65);
}
function assertRecordBytesHexProperty(record, property, recordName, options) {
    if (!isRecordBytesHexProperty(record, property, options.byteLength)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            expectedType: `bytes${options.byteLength ?? ""}Hex`,
            type: (0, record_js_1.typeofProperty)(record, property),
        }, options);
    }
}
function assertRecordBytes1HexProperty(record, property, recordName, options) {
    assertRecordBytesHexProperty(record, property, recordName, {
        byteLength: 1,
        ...options,
    });
}
function assertRecordBytes8HexProperty(record, property, recordName, options) {
    assertRecordBytesHexProperty(record, property, recordName, {
        byteLength: 8,
        ...options,
    });
}
function assertRecordBytes20HexProperty(record, property, recordName, options) {
    assertRecordBytesHexProperty(record, property, recordName, {
        byteLength: 20,
        ...options,
    });
}
function assertRecordBytes21HexProperty(record, property, recordName, options) {
    assertRecordBytesHexProperty(record, property, recordName, {
        byteLength: 21,
        ...options,
    });
}
function assertRecordBytes32HexProperty(record, property, recordName, options) {
    assertRecordBytesHexProperty(record, property, recordName, {
        byteLength: 32,
        ...options,
    });
}
function assertRecordBytes65HexProperty(record, property, recordName, options) {
    assertRecordBytesHexProperty(record, property, recordName, {
        byteLength: 65,
        ...options,
    });
}
function isRecordBytesHexNo0xProperty(record, property, byteLength) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(record, property)) {
        return false;
    }
    return isBytesHexNo0x(record[property], byteLength);
}
function assertRecordBytesHexNo0xProperty(record, property, recordName, options) {
    if (!isRecordBytesHexNo0xProperty(record, property, options.byteLength)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            expectedType: `bytes${options.byteLength ?? ""}HexNo0x`,
            type: (0, record_js_1.typeofProperty)(record, property),
        }, options);
    }
}
function assertRecordBytesHexArrayProperty(record, property, recordName, options) {
    (0, record_js_1.assertRecordArrayProperty)(record, property, recordName, options);
    const arr = record[property];
    for (let i = 0; i < arr.length; ++i) {
        if (!isBytesHex(arr[i], options.byteLength)) {
            throw new InvalidPropertyError_js_1.InvalidPropertyError({
                subject: recordName,
                index: i,
                property,
                expectedType: `bytes${options.byteLength ?? ""}Hex`,
                type: typeof arr[i],
            }, options);
        }
    }
}
function assertRecordBytes1HexArrayProperty(record, property, recordName, options) {
    assertRecordBytesHexArrayProperty(record, property, recordName, {
        byteLength: 1,
        ...options,
    });
}
function assertRecordBytes8HexArrayProperty(record, property, recordName, options) {
    assertRecordBytesHexArrayProperty(record, property, recordName, {
        byteLength: 8,
        ...options,
    });
}
function assertRecordBytes20HexArrayProperty(record, property, recordName, options) {
    assertRecordBytesHexArrayProperty(record, property, recordName, {
        byteLength: 20,
        ...options,
    });
}
function assertRecordBytes21HexArrayProperty(record, property, recordName, options) {
    assertRecordBytesHexArrayProperty(record, property, recordName, {
        byteLength: 21,
        ...options,
    });
}
function assertRecordBytes32HexArrayProperty(record, property, recordName, options) {
    assertRecordBytesHexArrayProperty(record, property, recordName, {
        byteLength: 32,
        ...options,
    });
}
function assertRecordBytes65HexArrayProperty(record, property, recordName, options) {
    assertRecordBytesHexArrayProperty(record, property, recordName, {
        byteLength: 65,
        ...options,
    });
}
function assertRecordBytesHexNo0xArrayProperty(record, property, recordName, options) {
    (0, record_js_1.assertRecordArrayProperty)(record, property, recordName, options);
    const arr = record[property];
    for (let i = 0; i < arr.length; ++i) {
        if (!isBytesHexNo0x(arr[i])) {
            throw new InvalidPropertyError_js_1.InvalidPropertyError({
                subject: recordName,
                index: i,
                property,
                expectedType: `bytes${options.byteLength ?? ""}HexNo0x`,
                type: typeof arr[i],
            }, options);
        }
    }
}
function isRecordUint8ArrayProperty(o, property) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(o, property)) {
        return false;
    }
    return o[property] instanceof Uint8Array;
}
function assertRecordUint8ArrayProperty(o, property, objName, options) {
    if (!isRecordUint8ArrayProperty(o, property)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: objName,
            property,
            expectedType: "Uint8Array",
            type: (0, record_js_1.typeofProperty)(o, property),
        }, options);
    }
}
const HEX_CHARS = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    a: 10,
    b: 11,
    c: 12,
    d: 13,
    e: 14,
    f: 15,
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15,
};
Object.freeze(HEX_CHARS);
const HEX_BYTES = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
Object.freeze(HEX_BYTES);
const HEX_CHARS_CODES = new Uint8Array([
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    97,
    98,
    99,
    100,
    101,
    102,
]);
function bytesToHexNo0x(bytes) {
    if (!bytes || bytes.length === 0) {
        return "";
    }
    let hex = "";
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, "0");
    }
    return hex;
}
function bytesToHex(bytes) {
    return `0x${bytesToHexNo0x(bytes)}`;
}
function bytes1ToHex(bytes) {
    if (!isBytes1(bytes)) {
        throw new Error("Invalid bytes1 argument");
    }
    return `0x${bytesToHexNo0x(bytes)}`;
}
function bytes8ToHex(bytes) {
    if (!isBytes8(bytes)) {
        throw new Error("Invalid bytes8 argument");
    }
    return `0x${bytesToHexNo0x(bytes)}`;
}
function bytes20ToHex(bytes) {
    if (!isBytes20(bytes)) {
        throw new Error("Invalid bytes20 argument");
    }
    return `0x${bytesToHexNo0x(bytes)}`;
}
function bytes21ToHex(bytes) {
    if (!isBytes21(bytes)) {
        throw new Error("Invalid bytes21 argument");
    }
    return `0x${bytesToHexNo0x(bytes)}`;
}
function bytes32ToHex(bytes) {
    if (!isBytes32(bytes)) {
        throw new Error("Invalid bytes32 argument");
    }
    return `0x${bytesToHexNo0x(bytes)}`;
}
function bytes65ToHex(bytes) {
    if (!isBytes65(bytes)) {
        throw new Error("Invalid bytes65 argument");
    }
    return `0x${bytesToHexNo0x(bytes)}`;
}
function bytesToHexLarge(bytes, no0x) {
    const len = no0x === true ? bytes.length * 2 : bytes.length * 2 + 2;
    const out = new Uint8Array(len);
    let i0 = 0;
    if (no0x !== true) {
        out[0] = 48;
        out[1] = 120;
        i0 = 2;
    }
    let j = i0;
    for (const byte of bytes) {
        out[j] = HEX_CHARS_CODES[byte >> 4];
        out[j + 1] = HEX_CHARS_CODES[byte & 0xf];
        j += 2;
    }
    const txt = new TextDecoder().decode(out);
    if (no0x === true) {
        return txt;
    }
    else {
        return txt;
    }
}
function hexToBytes(hexString) {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string: odd length");
    }
    const arr = hexString.replace(/^(0x)/, "").match(/.{1,2}/g);
    if (!arr)
        return new Uint8Array();
    return Uint8Array.from(arr.map((byte) => parseInt(byte, 16)));
}
function hexToBytes1(hexString) {
    const hex = (0, string_js_1.remove0x)(hexString);
    if (hex.length % 2 !== 0 || hex.length > 2) {
        throw new Error("Invalid bytes1 hex string");
    }
    return hexToBytes("0x" + hex.padStart(2, "0"));
}
function hexToBytes8(hexString) {
    const hex = (0, string_js_1.remove0x)(hexString);
    if (hex.length % 2 !== 0 || hex.length > 16) {
        throw new Error("Invalid bytes8 hex string");
    }
    return hexToBytes("0x" + hex.padStart(16, "0"));
}
function hexToBytes20(hexString) {
    const hex = (0, string_js_1.remove0x)(hexString);
    if (hex.length % 2 !== 0 || hex.length > 40) {
        throw new Error("Invalid bytes20 hex string");
    }
    return hexToBytes("0x" + hex.padStart(40, "0"));
}
function hexToBytes21(hexString) {
    const hex = (0, string_js_1.remove0x)(hexString);
    if (hex.length % 2 !== 0 || hex.length > 42) {
        throw new Error("Invalid bytes21 hex string");
    }
    return hexToBytes("0x" + hex.padStart(42, "0"));
}
function hexToBytes32(hexString) {
    const hex = (0, string_js_1.remove0x)(hexString);
    if (hex.length % 2 !== 0 || hex.length > 64) {
        throw new Error("Invalid bytes32 hex string");
    }
    return hexToBytes("0x" + hex.padStart(64, "0"));
}
function hexToBytes65(hexString) {
    const hex = (0, string_js_1.remove0x)(hexString);
    if (hex.length % 2 !== 0 || hex.length > 130) {
        throw new Error("Invalid bytes65 hex string");
    }
    return hexToBytes("0x" + hex.padStart(130, "0"));
}
function hexToBytesFaster(hexString, options) {
    const strict = options?.strict === true;
    const offset = hexString[0] === "0" && hexString[1] === "x" ? 2 : 0;
    const len = hexString.length - offset;
    if (len % 2 !== 0) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options?.subject,
            expectedType: "bytesHex",
            metaMessages: ["hex string length must be even"],
        }, options ?? {});
    }
    if (options?.byteLength !== undefined) {
        if (len !== options.byteLength) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options.subject,
                expectedType: "bytesHex",
                metaMessages: [
                    `expected ${options.byteLength} bytes, got ${len / 2}`,
                ],
            }, options);
        }
    }
    const bytes = new Uint8Array(len / 2);
    for (let i = 0; i < bytes.length; i++) {
        const hi = HEX_CHARS[hexString[offset + i * 2]];
        const lo = HEX_CHARS[hexString[offset + i * 2 + 1]];
        if (hi === undefined || lo === undefined) {
            if (strict) {
                throw new InvalidTypeError_js_1.InvalidTypeError({
                    subject: options.subject,
                    expectedType: "bytesHex",
                    metaMessages: [
                        `invalid hex character at position ${offset + i * 2}`,
                    ],
                }, options);
            }
            bytes[i] = ((hi ?? 0) << 4) | (lo ?? 0);
            continue;
        }
        bytes[i] = (hi << 4) | lo;
    }
    return bytes;
}
function bytesToBigInt(byteArray) {
    if (!byteArray || byteArray.length === 0) {
        return BigInt(0);
    }
    let result = BigInt(0);
    for (const byte of byteArray) {
        result = (result << BigInt(8)) | BigInt(byte);
    }
    return result;
}
function bigIntToBytesHex(value, options) {
    const byteLength = options?.byteLength;
    if (!(0, uint_js_1.isUintForByteLength)(value, byteLength)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options?.subject,
            type: typeof value,
            expectedType: "uintBigInt",
        }, options ?? {});
    }
    let v = value.toString(16);
    if (byteLength !== undefined) {
        v = v.padStart(byteLength * 2, "0");
    }
    if (v.length % 2 !== 0) {
        return ("0x0" + v);
    }
    return ("0x" + v);
}
function toBytes32HexArray(arr) {
    return arr.map((b) => {
        if (typeof b === "string") {
            return asBytes32Hex(b);
        }
        else if (isBytes(b)) {
            return bytesToHexLarge(asBytes32(b));
        }
        else if (typeof b === "object" && b !== null && "bytes32Hex" in b) {
            return asBytes32Hex(b.bytes32Hex);
        }
        else {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                expectedType: "bytes32Hex[]",
            }, {});
        }
    });
}
function toBytes32(value) {
    if (isBytes(value)) {
        return asBytes32(value);
    }
    else if (typeof value === "string") {
        return hexToBytes32(asBytes32Hex(value));
    }
    else if (typeof value === "object" &&
        value !== null &&
        "bytes32" in value) {
        return asBytes32(value.bytes32);
    }
    else {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            expectedType: "bytes32",
        }, {});
    }
}
function toBytes(value, options) {
    if (isBytes(value)) {
        if (options?.copy === true) {
            return new Uint8Array(value);
        }
        return value;
    }
    else if (typeof value === "string") {
        return hexToBytesFaster(value, { strict: true });
    }
    else {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options?.subject,
            expectedType: ["bytes", "bytesHex", "bytesHexNo0x"],
        }, options ?? {});
    }
}
function concatBytes(...arrays) {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
function concatBytesHex(values) {
    return ("0x" + values.map((v) => v.substring(2)).join(""));
}
function unsafeBytesEquals(a, b) {
    if (!isBytes(a) || !isBytes(b)) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
function normalizeBytes(value) {
    if (value instanceof Uint8Array)
        return value;
    if (value instanceof ArrayBuffer)
        return new Uint8Array(value);
    const tag = Object.prototype.toString.call(value);
    if (ArrayBuffer.isView(value) && tag === "[object Uint8Array]") {
        return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    if (tag === "[object ArrayBuffer]") {
        return new Uint8Array(value);
    }
    throw new TypeError(`Unsupported bytes type: ${tag}`);
}
function bytesUint8At(bytes, position) {
    if (position >= bytes.length) {
        throw new RangeError(`Position ${position} out of bounds for bytes of length ${bytes.length}`);
    }
    return bytes[position];
}
function bytesHexUint8At(bytesHex, position) {
    const bytes1Hex = bytesHexSlice(bytesHex, position, 1);
    return parseInt(bytes1Hex, 16);
}
function bytesHexUint64At(bytesHex, position) {
    const bytes8Hex = bytesHexSlice(bytesHex, position, 8);
    return BigInt(bytes8Hex);
}
function bytesHexSlice(bytesHex, position, length) {
    const index = 2 + position * 2;
    if (index + 2 * length > bytesHex.length) {
        throw new RangeError(`Position ${position} with length ${length} out of bounds`);
    }
    return `0x${bytesHex.slice(index, index + 2 * length)}`;
}
//# sourceMappingURL=bytes.js.map