import { assertRecordStringProperty } from "../../../../../base/string.js";
/**
 * Asserts that `error` matches the {@link RelayerApiError429} schema:
 * ```json
 * {
 *   "label": "rate_limited" | "protocol_overload",
 *   "message": "string"
 * }
 * ```
 */
export function assertIsRelayerApiError429(error, name, options) {
    assertRecordStringProperty(error, "label", name, {
        expectedValue: [
            "rate_limited",
            "protocol_overload",
        ],
        ...options,
    });
    assertRecordStringProperty(error, "message", name, options);
}
//# sourceMappingURL=RelayerApiError429.js.map