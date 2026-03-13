"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerResponseFailed = assertIsRelayerResponseFailed;
exports.assertIsRelayerApiError = assertIsRelayerApiError;
exports.assertIsRelayerResponseFailedWithError400 = assertIsRelayerResponseFailedWithError400;
exports.assertIsRelayerResponseFailedWithError404 = assertIsRelayerResponseFailedWithError404;
exports.assertIsRelayerResponseFailedWithError429 = assertIsRelayerResponseFailedWithError429;
exports.assertIsRelayerResponseFailedWithError500 = assertIsRelayerResponseFailedWithError500;
exports.assertIsRelayerResponseFailedWithError503 = assertIsRelayerResponseFailedWithError503;
const record_js_1 = require("../../../../base/record.js");
const string_js_1 = require("../../../../base/string.js");
const RelayerApiError400NoDetails_js_1 = require("./api-errors/RelayerApiError400NoDetails.js");
const RelayerApiError400WithDetails_js_1 = require("./api-errors/RelayerApiError400WithDetails.js");
const RelayerApiError404_js_1 = require("./api-errors/RelayerApiError404.js");
const RelayerApiError429_js_1 = require("./api-errors/RelayerApiError429.js");
const RelayerApiError500_js_1 = require("./api-errors/RelayerApiError500.js");
const RelayerApiError503_js_1 = require("./api-errors/RelayerApiError503.js");
const InvalidPropertyError_js_1 = require("../../../../base/errors/InvalidPropertyError.js");
function assertIsRelayerResponseFailed(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "status", name, {
        expectedValue: "failed",
        ...options,
    });
    (0, record_js_1.assertRecordNonNullableProperty)(value, "error", name, options);
    assertIsRelayerApiError(value.error, `${name}.error`, options);
}
function assertIsRelayerApiError(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "label", name, {});
    if (value.label ===
        "malformed_json" ||
        value.label ===
            "request_error" ||
        value.label ===
            "not_ready_for_decryption") {
        (0, RelayerApiError400NoDetails_js_1.assertIsRelayerApiError400NoDetails)(value, name, options);
    }
    else if (value.label ===
        "missing_fields" ||
        value.label ===
            "validation_failed") {
        (0, RelayerApiError400WithDetails_js_1.assertIsRelayerApiError400WithDetails)(value, name, options);
    }
    else if (value.label === "not_found") {
        (0, RelayerApiError404_js_1.assertIsRelayerApiError404)(value, name, options);
    }
    else if (value.label === "rate_limited" ||
        value.label === "protocol_overload") {
        (0, RelayerApiError429_js_1.assertIsRelayerApiError429)(value, name, options);
    }
    else if (value.label ===
        "internal_server_error") {
        (0, RelayerApiError500_js_1.assertIsRelayerApiError500)(value, name, options);
    }
    else if (value.label ===
        "readiness_check_timed_out" ||
        value.label ===
            "response_timed_out" ||
        value.label === "protocol_paused" ||
        value.label ===
            "gateway_not_reachable") {
        (0, RelayerApiError503_js_1.assertIsRelayerApiError503)(value, name, options);
    }
    else {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: name,
            property: "label",
            expectedType: "string",
            expectedValue: [
                "malformed_json",
                "request_error",
                "not_ready_for_decryption",
                "missing_fields",
                "validation_failed",
                "rate_limited",
                "internal_server_error",
                "protocol_paused",
                "protocol_overload",
                "gateway_not_reachable",
                "readiness_check_timed_out",
                "response_timed_out",
            ],
            type: typeof value.label,
            value: value.label,
        }, options);
    }
}
function assertIsRelayerResponseFailedWithError400(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    if (value.error.label ===
        "malformed_json" ||
        value.error.label ===
            "request_error" ||
        value.error.label ===
            "not_ready_for_decryption") {
        (0, RelayerApiError400NoDetails_js_1.assertIsRelayerApiError400NoDetails)(value.error, `${name}.error`, options);
    }
    else if (value.error.label ===
        "missing_fields" ||
        value.error.label ===
            "validation_failed") {
        (0, RelayerApiError400WithDetails_js_1.assertIsRelayerApiError400WithDetails)(value.error, `${name}.error`, options);
    }
    else {
        throw new InvalidPropertyError_js_1.InvalidPropertyError({
            subject: `${name}.error`,
            property: "label",
            expectedType: "string",
            expectedValue: [
                "malformed_json",
                "request_error",
                "not_ready_for_decryption",
                "missing_fields",
                "validation_failed",
            ],
            type: typeof value.error.label,
            value: value.error.label,
        }, options);
    }
}
function assertIsRelayerResponseFailedWithError404(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    (0, RelayerApiError404_js_1.assertIsRelayerApiError404)(value.error, `${name}.error`, options);
}
function assertIsRelayerResponseFailedWithError429(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    (0, RelayerApiError429_js_1.assertIsRelayerApiError429)(value.error, `${name}.error`, options);
}
function assertIsRelayerResponseFailedWithError500(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    (0, RelayerApiError500_js_1.assertIsRelayerApiError500)(value.error, `${name}.error`, options);
}
function assertIsRelayerResponseFailedWithError503(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    (0, RelayerApiError503_js_1.assertIsRelayerApiError503)(value.error, `${name}.error`, options);
}
//# sourceMappingURL=RelayerResponseFailed.js.map