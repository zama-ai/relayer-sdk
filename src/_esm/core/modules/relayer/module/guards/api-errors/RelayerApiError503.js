import { assertRecordStringProperty } from "../../../../../base/string.js";
/**
 * Asserts that `value` matches the {@link RelayerApiError503} schema:
 * ```json
 * {
 *   "label": "protocol_paused" | "gateway_not_reachable" | "readiness_check_timed_out" | "response_timed_out",
 *   "message": "string"
 * }
 * ```
 */
export function assertIsRelayerApiError503(value, name, options) {
    assertRecordStringProperty(value, "label", name, {
        expectedValue: [
            "protocol_paused",
            "gateway_not_reachable",
            "readiness_check_timed_out",
            "response_timed_out",
        ],
        ...options,
    });
    assertRecordStringProperty(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError503.js.map