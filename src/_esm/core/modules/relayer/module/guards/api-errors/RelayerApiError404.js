import { assertRecordStringProperty } from "../../../../../base/string.js";
/**
 * Asserts that `value` matches the {@link RelayerApiError404} schema:
 * ```json
 * {
 *   "label": "not_found",
 *   "message": "string"
 * }
 * ```
 */
export function assertIsRelayerApiError404(value, name, options) {
    assertRecordStringProperty(value, "label", name, {
        expectedValue: "not_found",
        ...options,
    });
    assertRecordStringProperty(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError404.js.map