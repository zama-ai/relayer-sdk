"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecordNonNullableProperty = isRecordNonNullableProperty;
exports.assertRecordNonNullableProperty = assertRecordNonNullableProperty;
exports.isRecordArrayProperty = isRecordArrayProperty;
exports.assertRecordArrayProperty = assertRecordArrayProperty;
exports.isRecordBooleanProperty = isRecordBooleanProperty;
exports.assertRecordBooleanProperty = assertRecordBooleanProperty;
exports.typeofProperty = typeofProperty;
const InvalidPropertyError_js_1 = require("./errors/InvalidPropertyError.js");
function isRecordNonNullableProperty(o, property) {
    if (o === undefined ||
        o === null ||
        typeof o !== "object" ||
        !(property in o) ||
        o[property] === undefined ||
        o[property] === null) {
        return false;
    }
    return true;
}
function assertRecordNonNullableProperty(record, property, recordName, options) {
    if (!isRecordNonNullableProperty(record, property)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            expectedType: options.expectedType ?? "non-nullable",
            type: typeofProperty(record, property),
        }, options);
    }
}
function isRecordArrayProperty(record, property) {
    if (!isRecordNonNullableProperty(record, property)) {
        return false;
    }
    return Array.isArray(record[property]);
}
function assertRecordArrayProperty(record, property, recordName, options) {
    if (!isRecordArrayProperty(record, property)) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            expectedType: options.expectedType ?? "Array",
            type: typeofProperty(record, property),
        }, options);
    }
}
function isRecordBooleanProperty(record, property) {
    if (!isRecordNonNullableProperty(record, property)) {
        return false;
    }
    return typeof record[property] === "boolean";
}
function assertRecordBooleanProperty(record, property, recordName, options) {
    if (!isRecordBooleanProperty(record, property))
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: recordName,
            property,
            expectedType: "boolean",
            type: typeofProperty(record, property),
        }, options);
    if (options.expectedValue !== undefined) {
        if (record[property] !== options.expectedValue) {
            throw new InvalidPropertyError_js_1.InvalidPropertyError({
                subject: recordName,
                property,
                expectedType: "boolean",
                expectedValue: String(options.expectedValue),
                type: typeof record[property],
                value: String(record[property]),
            }, options);
        }
    }
}
function typeofProperty(o, property) {
    if (isRecordNonNullableProperty(o, property)) {
        return typeof o[property];
    }
    return "undefined";
}
//# sourceMappingURL=record.js.map