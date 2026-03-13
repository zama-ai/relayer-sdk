import { assertRecordNonNullableProperty } from "../../../../base/record.js";
import { assertRecordStringProperty } from "../../../../base/string.js";
import { assertRecordBytesHexNo0xArrayProperty, assertRecordBytesHexNo0xProperty, assertRecordBytesHexProperty, } from "../../../../base/bytes.js";
/**
 * Asserts that `value` matches the {@link RelayerPublicDecryptSucceeded} schema:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "signatures": ["hexNo0x..."],
 *     "decryptedValue": "hexNo0x...",
 *     "extraData": "0x..."
 *   }
 * }
 * ```
 */
export function assertIsRelayerPublicDecryptSucceeded(value, name, options) {
    assertRecordStringProperty(value, "status", name, {
        expectedValue: "succeeded",
        ...options,
    });
    assertRecordStringProperty(value, "requestId", name, options);
    assertRecordNonNullableProperty(value, "result", name, options);
    _assertIsRelayerResult200PublicDecrypt(value.result, `${name}.result`, options);
}
/**
 * Asserts that `value` matches the {@link RelayerResult200PublicDecrypt} schema:
 * ```json
 * {
 *   "signatures": ["hexNo0x..."],
 *   "decryptedValue": "hexNo0x...",
 *   "extraData": "0x..."
 * }
 * ```
 */
function _assertIsRelayerResult200PublicDecrypt(value, name, options) {
    assertRecordBytesHexNo0xArrayProperty(value, "signatures", name, options);
    assertRecordBytesHexNo0xProperty(value, "decryptedValue", name, options);
    assertRecordBytesHexProperty(value, "extraData", name, options);
}
//# sourceMappingURL=RelayerPublicDecryptSucceeded.js.map