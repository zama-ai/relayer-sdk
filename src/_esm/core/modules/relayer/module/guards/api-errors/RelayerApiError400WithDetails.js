import { InvalidPropertyError } from "../../../../../base/errors/InvalidPropertyError.js";
import { assertRecordArrayProperty, isRecordArrayProperty, } from "../../../../../base/record.js";
import { assertRecordStringProperty, isRecordStringProperty, } from "../../../../../base/string.js";
/** @see {@link assertIsRelayerApiError400WithDetails} */
export function isRelayerApiError400WithDetails(error) {
    if (!isRecordStringProperty(error, "label")) {
        return false;
    }
    if (!(error.label === "missing_fields" ||
        error.label === "validation_failed")) {
        return false;
    }
    if (!isRecordStringProperty(error, "message")) {
        return false;
    }
    if (!isRecordArrayProperty(error, "details")) {
        return false;
    }
    const arr = error.details;
    for (let i = 0; i < arr.length; ++i) {
        const detail = arr[i];
        if (!isRecordStringProperty(detail, "field")) {
            return false;
        }
        if (!isRecordStringProperty(detail, "issue")) {
            return false;
        }
    }
    return true;
}
/**
 * Asserts that a value matches the {@link RelayerApiError400WithDetails} schema:
 * ```json
 * {
 *   "label": "missing_fields" | "validation_failed",
 *   "message": "string",
 *   "details": [
 *     { "field": "string", "issue": "string" }
 *   ]
 * }
 * ```
 */
export function assertIsRelayerApiError400WithDetails(value, name, options) {
    assertRecordStringProperty(value, "label", name, options);
    if (!(value.label === "missing_fields" ||
        value.label === "validation_failed")) {
        throw new InvalidPropertyError({
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
    assertRecordStringProperty(value, "message", name, options);
    assertRecordArrayProperty(value, "details", name, options);
    const arr = value.details;
    for (let i = 0; i < arr.length; ++i) {
        const detail = arr[i];
        assertRecordStringProperty(detail, "field", `${name}.details[${i}]`, options);
        assertRecordStringProperty(detail, "issue", `${name}.details[${i}]`, options);
    }
}
//# sourceMappingURL=RelayerApiError400WithDetails.js.map