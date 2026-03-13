import { isRecordStringProperty } from "../../../../../base/string.js";
import { assertRecordStringProperty } from "../../../../../base/string.js";
import { InvalidPropertyError } from "../../../../../base/errors/InvalidPropertyError.js";
/** @see {@link assertIsRelayerApiError400NoDetails} */
export function isRelayerApiError400NoDetails(error) {
    if (!isRecordStringProperty(error, "label")) {
        return false;
    }
    if (!(error.label === "malformed_json" ||
        error.label === "request_error" ||
        error.label === "not_ready_for_decryption")) {
        return false;
    }
    return isRecordStringProperty(error, "message");
}
/**
 * Asserts that a value matches the {@link RelayerApiError400NoDetails} schema:
 * ```json
 * {
 *   "label": "malformed_json" | "request_error" | "not_ready_for_decryption",
 *   "message": "string"
 * }
 * ```
 */
export function assertIsRelayerApiError400NoDetails(value, name, options) {
    assertRecordStringProperty(value, "label", name, options);
    if (!(value.label === "malformed_json" ||
        value.label === "request_error" ||
        value.label === "not_ready_for_decryption")) {
        throw new InvalidPropertyError({
            subject: name,
            property: "label",
            expectedType: "string",
            expectedValue: [
                "malformed_json",
                "request_error",
                "not_ready_for_decryption",
            ],
            type: typeof value.label, // === "string"
            value: value.label,
        }, options);
    }
    assertRecordStringProperty(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError400NoDetails.js.map