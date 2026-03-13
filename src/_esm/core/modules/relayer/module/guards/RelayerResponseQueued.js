import { assertRecordNonNullableProperty } from "../../../../base/record.js";
import { assertRecordStringProperty } from "../../../../base/string.js";
/**
 * Asserts that `value` matches the {@link RelayerPostResponseQueued} schema:
 * ```json
 * {
 *   "status": "queued",
 *   "requestId": "string",
 *   "result": { "jobId": "string" }
 * }
 * ```
 */
export function assertIsRelayerPostResponse202Queued(value, name, options) {
    assertRecordStringProperty(value, "status", name, {
        expectedValue: "queued",
        ...options,
    });
    assertRecordStringProperty(value, "requestId", name, options);
    assertRecordNonNullableProperty(value, "result", name, options);
    assertRecordStringProperty(value.result, "jobId", `${name}.result`, options);
}
/**
 * Asserts that `value` matches the {@link RelayerGetResponse202Queued} schema:
 * ```json
 * {
 *   "status": "queued",
 *   "requestId": "string"
 * }
 * ```
 */
export function assertIsRelayerGetResponse202Queued(value, name, options) {
    assertRecordStringProperty(value, "status", name, {
        expectedValue: "queued",
        ...options,
    });
    assertRecordStringProperty(value, "requestId", name, options);
}
//# sourceMappingURL=RelayerResponseQueued.js.map