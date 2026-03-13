"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerUserDecryptSucceeded = assertIsRelayerUserDecryptSucceeded;
const bytes_js_1 = require("../../../../base/bytes.js");
const record_js_1 = require("../../../../base/record.js");
const string_js_1 = require("../../../../base/string.js");
function assertIsRelayerUserDecryptSucceeded(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "status", name, {
        expectedValue: "succeeded",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "requestId", name, options);
    (0, record_js_1.assertRecordNonNullableProperty)(value, "result", name, options);
    _assertIsRelayerResult200UserDecrypt(value.result, `${name}.result`, options);
}
function _assertIsRelayerResult200UserDecrypt(value, name, options) {
    (0, record_js_1.assertRecordArrayProperty)(value, "result", name, options);
    for (let i = 0; i < value.result.length; ++i) {
        (0, bytes_js_1.assertRecordBytesHexNo0xProperty)(value.result[i], "payload", `${name}.result[${i}]`, { ...options, byteLength: 65 });
        (0, bytes_js_1.assertRecordBytesHexNo0xProperty)(value.result[i], "signature", `${name}.result[${i}]`, { ...options, byteLength: 65 });
    }
}
//# sourceMappingURL=RelayerUserDecryptSucceeded.js.map