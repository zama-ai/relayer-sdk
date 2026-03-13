"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_ADDRESS = void 0;
exports.checksummedAddressToBytes20 = checksummedAddressToBytes20;
exports.isChecksummedAddress = isChecksummedAddress;
exports.assertIsChecksummedAddress = assertIsChecksummedAddress;
exports.asChecksummedAddress = asChecksummedAddress;
exports.assertIsChecksummedAddressArray = assertIsChecksummedAddressArray;
exports.isAddress = isAddress;
exports.asAddress = asAddress;
exports.assertIsAddress = assertIsAddress;
exports.assertIsAddressArray = assertIsAddressArray;
exports.isRecordAddressProperty = isRecordAddressProperty;
exports.assertRecordAddressProperty = assertRecordAddressProperty;
exports.isRecordChecksummedAddressProperty = isRecordChecksummedAddressProperty;
exports.assertRecordChecksummedAddressProperty = assertRecordChecksummedAddressProperty;
exports.assertRecordChecksummedAddressArrayProperty = assertRecordChecksummedAddressArrayProperty;
exports.toChecksummedAddress = toChecksummedAddress;
exports.addressToChecksummedAddress = addressToChecksummedAddress;
exports._toChecksummedAddress = _toChecksummedAddress;
const sha3_js_1 = require("@noble/hashes/sha3.js");
const record_js_1 = require("./record.js");
const string_js_1 = require("./string.js");
const AddressError_js_1 = require("./errors/AddressError.js");
const ChecksummedAddressError_js_1 = require("./errors/ChecksummedAddressError.js");
const InvalidTypeError_js_1 = require("./errors/InvalidTypeError.js");
const bytes_js_1 = require("./bytes.js");
const InvalidPropertyError_js_1 = require("./errors/InvalidPropertyError.js");
exports.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
function checksummedAddressToBytes20(address) {
    const hex = (0, string_js_1.remove0x)(address);
    const bytes = new Uint8Array(20);
    for (let i = 0; i < 20; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
function isChecksummedAddress(value) {
    try {
        const a = toChecksummedAddress(value);
        return a === value;
    }
    catch {
        return false;
    }
}
function assertIsChecksummedAddress(value, options) {
    if (!isChecksummedAddress(value)) {
        if (typeof value === "string") {
            throw new ChecksummedAddressError_js_1.ChecksummedAddressError({
                address: value,
            }, options);
        }
        else {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options.subject,
                type: typeof value,
                expectedType: "checksummedAddress",
            }, options);
        }
    }
}
function asChecksummedAddress(value, options) {
    assertIsChecksummedAddress(value, options ?? {});
    return value;
}
function assertIsChecksummedAddressArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "checksummedAddress[]",
        }, options);
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isChecksummedAddress(value[i])) {
            throw new ChecksummedAddressError_js_1.ChecksummedAddressError({ address: String(value) }, options);
        }
    }
}
function isAddress(value) {
    if (!(0, bytes_js_1.isBytes20Hex)(value)) {
        return false;
    }
    const hexNo0x = (0, string_js_1.remove0x)(value);
    const hexNo0xLowerCase = hexNo0x.toLowerCase();
    if (hexNo0x === hexNo0xLowerCase) {
        return true;
    }
    return _toChecksummedAddress(hexNo0xLowerCase) === value;
}
function asAddress(value, options) {
    assertIsAddress(value, options ?? {});
    return value;
}
function assertIsAddress(value, options) {
    if (!isAddress(value)) {
        throw new AddressError_js_1.AddressError({ address: String(value) }, options);
    }
}
function assertIsAddressArray(value, options) {
    if (!Array.isArray(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "address[]",
        }, options);
    }
    for (let i = 0; i < value.length; ++i) {
        if (!isAddress(value[i])) {
            throw new AddressError_js_1.AddressError({ address: String(value) }, options);
        }
    }
}
function isRecordAddressProperty(record, property) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(record, property)) {
        return false;
    }
    return isAddress(record[property]);
}
function assertRecordAddressProperty(record, property, recordName, options) {
    if (!isRecordAddressProperty(record, property)) {
        const type = (0, record_js_1.typeofProperty)(record, property);
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            type,
            expectedType: "address",
            value: type === "string"
                ? String(record[property])
                : undefined,
        }, options);
    }
}
function isRecordChecksummedAddressProperty(record, property) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(record, property)) {
        return false;
    }
    return isChecksummedAddress(record[property]);
}
function assertRecordChecksummedAddressProperty(record, property, recordName, options) {
    if (!isRecordChecksummedAddressProperty(record, property)) {
        const type = (0, record_js_1.typeofProperty)(record, property);
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            type,
            expectedType: "checksummedAddress",
            value: type === "string"
                ? String(record[property])
                : undefined,
        }, options);
    }
}
function assertRecordChecksummedAddressArrayProperty(record, property, recordName, options) {
    (0, record_js_1.assertRecordArrayProperty)(record, property, recordName, options);
    const arr = record[property];
    for (let i = 0; i < arr.length; ++i) {
        assertIsChecksummedAddress(arr[i], options);
    }
}
function toChecksummedAddress(value) {
    if (!(0, bytes_js_1.isBytes20Hex)(value)) {
        return undefined;
    }
    return _toChecksummedAddress((0, string_js_1.remove0x)(value).toLowerCase());
}
function addressToChecksummedAddress(address) {
    return _toChecksummedAddress((0, string_js_1.remove0x)(address).toLowerCase());
}
function _toChecksummedAddress(bytes20No0xLowerCase) {
    const hash = (0, bytes_js_1.bytesToHex)((0, sha3_js_1.keccak_256)(new TextEncoder().encode(bytes20No0xLowerCase)));
    let checksummed = "0x";
    for (let i = 0; i < 40; i++) {
        const char = bytes20No0xLowerCase[i];
        if (char >= "a" && char <= "f") {
            const hashNibble = parseInt(hash[i + 2], 16);
            checksummed += hashNibble >= 8 ? char.toUpperCase() : char;
        }
        else {
            checksummed += char;
        }
    }
    return checksummed;
}
//# sourceMappingURL=address.js.map