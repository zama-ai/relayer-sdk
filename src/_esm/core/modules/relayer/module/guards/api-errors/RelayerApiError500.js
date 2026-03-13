import { assertRecordStringProperty } from "../../../../../base/string.js";
/**
 * Asserts that `value` matches the {@link RelayerApiError500} schema:
 * ```json
 * {
 *   "label": "internal_server_error",
 *   "message": "string"
 * }
 * ```
 */
export function assertIsRelayerApiError500(value, name, options) {
    assertRecordStringProperty(value, "label", name, {
        expectedValue: "internal_server_error",
        ...options,
    });
    assertRecordStringProperty(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError500.js.map