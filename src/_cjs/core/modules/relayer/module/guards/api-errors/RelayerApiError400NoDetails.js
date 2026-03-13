"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRelayerApiError400NoDetails = isRelayerApiError400NoDetails;
exports.assertIsRelayerApiError400NoDetails = assertIsRelayerApiError400NoDetails;
const string_js_1 = require("../../../../../base/string.js");
const string_js_2 = require("../../../../../base/string.js");
const InvalidPropertyError_js_1 = require("../../../../../base/errors/InvalidPropertyError.js");
function isRelayerApiError400NoDetails(error) {
    if (!(0, string_js_1.isRecordStringProperty)(error, "label")) {
        return false;
    }
    if (!(error.label === "malformed_json" ||
        error.label === "request_error" ||
        error.label === "not_ready_for_decryption")) {
        return false;
    }
    return (0, string_js_1.isRecordStringProperty)(error, "message");
}
function assertIsRelayerApiError400NoDetails(value, name, options) {
    (0, string_js_2.assertRecordStringProperty)(value, "label", name, options);
    if (!(value.label === "malformed_json" ||
        value.label === "request_error" ||
        value.label === "not_ready_for_decryption")) {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: name,
            property: "label",
            expectedType: "string",
            expectedValue: [
                "malformed_json",
                "request_error",
                "not_ready_for_decryption",
            ],
            type: typeof value.label,
            value: value.label,
        }, options);
    }
    (0, string_js_2.assertRecordStringProperty)(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError400NoDetails.js.map