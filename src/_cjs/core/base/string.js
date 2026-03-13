"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSuffix = removeSuffix;
exports.is0x = is0x;
exports.isNo0x = isNo0x;
exports.ensure0x = ensure0x;
exports.remove0x = remove0x;
exports.assertIs0xString = assertIs0xString;
exports.isNonEmptyString = isNonEmptyString;
exports.isRecordStringProperty = isRecordStringProperty;
exports.assertRecordStringProperty = assertRecordStringProperty;
exports.assertRecordStringArrayProperty = assertRecordStringArrayProperty;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.safeJSONstringify = safeJSONstringify;
const record_js_1 = require("./record.js");
const InternalError_js_1 = require("./errors/InternalError.js");
const InvalidPropertyError_js_1 = require("./errors/InvalidPropertyError.js");
function removeSuffix(s, suffix) {
    if (s === undefined) {
        return "";
    }
    if (suffix.length === 0) {
        return s;
    }
    return s.endsWith(suffix) ? s.slice(0, -suffix.length) : s;
}
function is0x(s) {
    return typeof s === "string" && s.startsWith("0x");
}
function isNo0x(s) {
    return typeof s === "string" && !s.startsWith("0x");
}
function ensure0x(s) {
    return !s.startsWith("0x") ? `0x${s}` : s;
}
function remove0x(s) {
    return s.startsWith("0x") ? s.substring(2) : s;
}
function assertIs0xString(s) {
    if (!(typeof s === "string" && s.startsWith("0x"))) {
        throw new InternalError_js_1.InternalError({ message: "value is not a `0x${string}`" });
    }
}
function isNonEmptyString(s) {
    if (s === undefined || s === null || typeof s !== "string") {
        return false;
    }
    return s.length > 0;
}
function isRecordStringProperty(o, property) {
    if (!(0, record_js_1.isRecordNonNullableProperty)(o, property)) {
        return false;
    }
    return typeof o[property] === "string";
}
function assertRecordStringProperty(record, property, recordName, options) {
    if (!isRecordStringProperty(record, property)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            expectedType: "string",
            expectedValue: options.expectedValue,
            type: (0, record_js_1.typeofProperty)(record, property),
        }, options);
    }
    if (options.expectedValue !== undefined) {
        if (Array.isArray(options.expectedValue)) {
            for (let i = 0; i < options.expectedValue.length; ++i) {
                if (record[property] === options.expectedValue[i]) {
                    return;
                }
            }
            throw new InvalidPropertyError_js_1.InvalidPropertyError({
                subject: recordName,
                property,
                expectedType: "string",
                expectedValue: options.expectedValue,
                type: typeof record[property],
                value: record[property],
            }, options);
        }
        else {
            if (record[property] !== options.expectedValue) {
                throw new InvalidPropertyError_js_1.InvalidPropertyError({
                    subject: recordName,
                    property,
                    expectedType: "string",
                    expectedValue: options.expectedValue,
                    type: typeof record[property],
                    value: record[property],
                }, options);
            }
        }
    }
}
function assertRecordStringArrayProperty(record, property, recordName, options) {
    (0, record_js_1.assertRecordArrayProperty)(record, property, recordName, options);
    const arr = record[property];
    for (let i = 0; i < arr.length; ++i) {
        if (typeof arr[i] !== "string") {
            throw new InvalidPropertyError_js_1.InvalidPropertyError({
                subject: recordName,
                index: i,
                property,
                expectedType: "string",
                type: typeof arr[i],
            }, options);
        }
    }
}
function capitalizeFirstLetter(s) {
    if (s.length === 0) {
        return s;
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function safeJSONstringify(o, space) {
    try {
        return JSON.stringify(o, (_, v) => (typeof v === "bigint" ? v.toString() : v), space);
    }
    catch {
        return "";
    }
}
//# sourceMappingURL=string.js.map