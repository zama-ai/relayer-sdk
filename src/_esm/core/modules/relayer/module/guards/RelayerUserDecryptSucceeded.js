import { assertRecordBytesHexNo0xProperty } from "../../../../base/bytes.js";
import { assertRecordArrayProperty, assertRecordNonNullableProperty, } from "../../../../base/record.js";
import { assertRecordStringProperty } from "../../../../base/string.js";
/**
 * Asserts that `value` matches the {@link RelayerUserDecryptSucceeded} schema:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "result": [{
 *       "payload": "hexNo0x...",
 *       "signature": "hexNo0x...",
 *       "extraData": "hex_or_hexNo0x_?..."
 *     }]
 *   }
 * }
 * ```
 */
export function assertIsRelayerUserDecryptSucceeded(value, name, options) {
    assertRecordStringProperty(value, "status", name, {
        expectedValue: "succeeded",
        ...options,
    });
    assertRecordStringProperty(value, "requestId", name, options);
    assertRecordNonNullableProperty(value, "result", name, options);
    _assertIsRelayerResult200UserDecrypt(value.result, `${name}.result`, options);
}
/**
 * Asserts that `value` matches the {@link RelayerResult200UserDecrypt} schema:
 * ```json
 * {
 *   "result": [{
 *     "payload": "hexNo0x...",
 *     "signature": "hexNo0x...",
 *     "extraData": "hex_or_hexNo0x_?..."
 *   }]
 * }
 * ```
 */
function _assertIsRelayerResult200UserDecrypt(value, name, options) {
    assertRecordArrayProperty(value, "result", name, options);
    for (let i = 0; i < value.result.length; ++i) {
        // Missing extraData
        assertRecordBytesHexNo0xProperty(value.result[i], "payload", `${name}.result[${i}]`, { ...options, byteLength: 65 });
        assertRecordBytesHexNo0xProperty(value.result[i], "signature", `${name}.result[${i}]`, { ...options, byteLength: 65 });
    }
}
//# sourceMappingURL=RelayerUserDecryptSucceeded.js.map