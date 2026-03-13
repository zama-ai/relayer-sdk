import { assertRecordNonNullableProperty } from "../../../../base/record.js";
import { assertRecordStringProperty } from "../../../../base/string.js";
import { assertIsRelayerApiError400NoDetails } from "./api-errors/RelayerApiError400NoDetails.js";
import { assertIsRelayerApiError400WithDetails } from "./api-errors/RelayerApiError400WithDetails.js";
import { assertIsRelayerApiError404 } from "./api-errors/RelayerApiError404.js";
import { assertIsRelayerApiError429 } from "./api-errors/RelayerApiError429.js";
import { assertIsRelayerApiError500 } from "./api-errors/RelayerApiError500.js";
import { assertIsRelayerApiError503 } from "./api-errors/RelayerApiError503.js";
import { InvalidPropertyError } from "../../../../base/errors/InvalidPropertyError.js";
/**
 * Asserts that `value` matches the {@link RelayerResponseFailed} schema:
 * ```json
 * {
 *   "status": "failed",
 *   "error": { ... }
 * }
 * ```
 * Where `error` is a {@link RelayerApiError}.
 */
export function assertIsRelayerResponseFailed(value, name, options) {
    assertRecordStringProperty(value, "status", name, {
        expectedValue: "failed",
        ...options,
    });
    assertRecordNonNullableProperty(value, "error", name, options);
    assertIsRelayerApiError(value.error, `${name}.error`, options);
}
/**
 * Asserts that `value` matches one of the {@link RelayerApiError} schemas,
 * dispatching by `label`:
 * - 400: {@link RelayerApiError400NoDetails} or {@link RelayerApiError400WithDetails}
 * - 404: {@link RelayerApiError404}
 * - 429: {@link RelayerApiError429}
 * - 500: {@link RelayerApiError500}
 * - 503: {@link RelayerApiError503}
 */
export function assertIsRelayerApiError(value, name, options) {
    assertRecordStringProperty(value, "label", name, {});
    // 400
    if (value.label ===
        "malformed_json" ||
        value.label ===
            "request_error" ||
        value.label ===
            "not_ready_for_decryption") {
        assertIsRelayerApiError400NoDetails(value, name, options);
    }
    // 400 (with details)
    else if (value.label ===
        "missing_fields" ||
        value.label ===
            "validation_failed") {
        assertIsRelayerApiError400WithDetails(value, name, options);
    }
    // 404
    else if (value.label === "not_found") {
        assertIsRelayerApiError404(value, name, options);
    }
    // 429
    else if (value.label === "rate_limited" ||
        value.label === "protocol_overload") {
        assertIsRelayerApiError429(value, name, options);
    }
    // 500
    else if (value.label ===
        "internal_server_error") {
        assertIsRelayerApiError500(value, name, options);
    }
    // 503
    else if (value.label ===
        "readiness_check_timed_out" ||
        value.label ===
            "response_timed_out" ||
        value.label === "protocol_paused" ||
        value.label ===
            "gateway_not_reachable") {
        assertIsRelayerApiError503(value, name, options);
    }
    // Unsupported
    else {
        throw new InvalidPropertyError({
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
/**
 * Asserts that `value` matches the failed response with 400 error schema:
 * ```json
 * {
 *   "status": "failed",
 *   "error": RelayerApiError400NoDetails | RelayerApiError400WithDetails
 * }
 * ```
 * @see {@link assertIsRelayerApiError400NoDetails}
 * @see {@link assertIsRelayerApiError400WithDetails}
 */
export function assertIsRelayerResponseFailedWithError400(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    if (value.error.label ===
        "malformed_json" ||
        value.error.label ===
            "request_error" ||
        value.error.label ===
            "not_ready_for_decryption") {
        assertIsRelayerApiError400NoDetails(value.error, `${name}.error`, options);
    }
    else if (value.error.label ===
        "missing_fields" ||
        value.error.label ===
            "validation_failed") {
        assertIsRelayerApiError400WithDetails(value.error, `${name}.error`, options);
    }
    else {
        throw new InvalidPropertyError({
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
////////////////////////////////////////////////////////////////////////////////
// 404
////////////////////////////////////////////////////////////////////////////////
export function assertIsRelayerResponseFailedWithError404(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    assertIsRelayerApiError404(value.error, `${name}.error`, options);
}
////////////////////////////////////////////////////////////////////////////////
// 429
////////////////////////////////////////////////////////////////////////////////
export function assertIsRelayerResponseFailedWithError429(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    assertIsRelayerApiError429(value.error, `${name}.error`, options);
}
////////////////////////////////////////////////////////////////////////////////
// 500
////////////////////////////////////////////////////////////////////////////////
export function assertIsRelayerResponseFailedWithError500(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    assertIsRelayerApiError500(value.error, `${name}.error`, options);
}
////////////////////////////////////////////////////////////////////////////////
// 503
////////////////////////////////////////////////////////////////////////////////
export function assertIsRelayerResponseFailedWithError503(value, name, options) {
    assertIsRelayerResponseFailed(value, name, options);
    assertIsRelayerApiError503(value.error, `${name}.error`, options);
}
//# sourceMappingURL=RelayerResponseFailed.js.map