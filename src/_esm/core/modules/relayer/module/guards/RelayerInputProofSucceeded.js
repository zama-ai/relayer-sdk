import { assertRecordNonNullableProperty } from "../../../../base/record.js";
import { assertRecordStringProperty } from "../../../../base/string.js";
import { assertRecordBooleanProperty } from "../../../../base/record.js";
import { assertRecordBytes32HexArrayProperty, assertRecordBytesHexArrayProperty, assertRecordBytesHexProperty, } from "../../../../base/bytes.js";
/**
 * Asserts that `value` matches the {@link RelayerInputProofSucceeded} schema:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "accepted": true,
 *     "extraData": "0x...",
 *     "handles": ["0x..."],
 *     "signatures": ["0x..."]
 *   } | {
 *     "accepted": false,
 *     "extraData": "0x..."
 *   }
 * }
 * ```
 */
export function assertIsRelayerInputProofSucceeded(value, name, options) {
    assertRecordStringProperty(value, "status", name, {
        expectedValue: "succeeded",
        ...options,
    });
    assertRecordStringProperty(value, "requestId", name, options);
    assertRecordNonNullableProperty(value, "result", name, options);
    assertRecordBooleanProperty(value.result, "accepted", `${name}.result`, options);
    if (value.result.accepted) {
        _assertIsRelayerResult200InputProofAccepted(value.result, `${name}.result`, options);
    }
    else {
        _assertIsRelayerResult200InputProofRejected(value.result, `${name}.result`, options);
    }
}
/**
 * Asserts that `value` matches the {@link RelayerResult200InputProofAccepted} schema:
 * ```json
 * {
 *   "accepted": true,
 *   "extraData": "0x...",
 *   "handles": ["0x..."],
 *   "signatures": ["0x..."]
 * }
 * ```
 */
function _assertIsRelayerResult200InputProofAccepted(value, name, options) {
    assertRecordBooleanProperty(value, "accepted", name, {
        expectedValue: true,
        ...options,
    });
    assertRecordBytesHexProperty(value, "extraData", name, options);
    assertRecordBytes32HexArrayProperty(value, "handles", name, options);
    assertRecordBytesHexArrayProperty(value, "signatures", name, options);
}
/**
 * Asserts that `value` matches the {@link RelayerResult200InputProofAccepted} schema:
 * ```json
 * {
 *   "accepted": false,
 *   "extraData": "0x...",
 * }
 * ```
 */
function _assertIsRelayerResult200InputProofRejected(value, name, options) {
    assertRecordBooleanProperty(value, "accepted", name, {
        expectedValue: false,
        ...options,
    });
    assertRecordBytesHexProperty(value, "extraData", name, options);
}
//# sourceMappingURL=RelayerInputProofSucceeded.js.map