"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRelayerApiError400WithDetails = isRelayerApiError400WithDetails;
exports.assertIsRelayerApiError400WithDetails = assertIsRelayerApiError400WithDetails;
const InvalidPropertyError_js_1 = require("../../../../../base/errors/InvalidPropertyError.js");
const record_js_1 = require("../../../../../base/record.js");
const string_js_1 = require("../../../../../base/string.js");
function isRelayerApiError400WithDetails(error) {
    if (!(0, string_js_1.isRecordStringProperty)(error, "label")) {
        return false;
    }
    if (!(error.label === "missing_fields" ||
        error.label === "validation_failed")) {
        return false;
    }
    if (!(0, string_js_1.isRecordStringProperty)(error, "message")) {
        return false;
    }
    if (!(0, record_js_1.isRecordArrayProperty)(error, "details")) {
        return false;
    }
    const arr = error.details;
    for (let i = 0; i < arr.length; ++i) {
        const detail = arr[i];
        if (!(0, string_js_1.isRecordStringProperty)(detail, "field")) {
            return false;
        }
        if (!(0, string_js_1.isRecordStringProperty)(detail, "issue")) {
            return false;
        }
    }
    return true;
}
function assertIsRelayerApiError400WithDetails(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "label", name, options);
    if (!(value.label === "missing_fields" ||
        value.label === "validation_failed")) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: name,
            property: "label",
            expectedType: "string",
            expectedValue: [
                "missing_fields",
                "validation_failed",
            ],
            type: typeof value.label,
            value: value.label,
        }, options);
    }
    (0, string_js_1.assertRecordStringProperty)(value, "message", name, options);
    (0, record_js_1.assertRecordArrayProperty)(value, "details", name, options);
    const arr = value.details;
    for (let i = 0; i < arr.length; ++i) {
        const detail = arr[i];
        (0, string_js_1.assertRecordStringProperty)(detail, "field", `${name}.details[${i}]`, options);
        (0, string_js_1.assertRecordStringProperty)(detail, "issue", `${name}.details[${i}]`, options);
    }
}
//# sourceMappingURL=RelayerApiError400WithDetails.js.map