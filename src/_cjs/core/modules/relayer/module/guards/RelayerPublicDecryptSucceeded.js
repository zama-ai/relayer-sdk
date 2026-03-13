"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerPublicDecryptSucceeded = assertIsRelayerPublicDecryptSucceeded;
const record_js_1 = require("../../../../base/record.js");
const string_js_1 = require("../../../../base/string.js");
const bytes_js_1 = require("../../../../base/bytes.js");
function assertIsRelayerPublicDecryptSucceeded(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "status", name, {
        expectedValue: "succeeded",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "requestId", name, options);
    (0, record_js_1.assertRecordNonNullableProperty)(value, "result", name, options);
    _assertIsRelayerResult200PublicDecrypt(value.result, `${name}.result`, options);
}
function _assertIsRelayerResult200PublicDecrypt(value, name, options) {
    (0, bytes_js_1.assertRecordBytesHexNo0xArrayProperty)(value, "signatures", name, options);
    (0, bytes_js_1.assertRecordBytesHexNo0xProperty)(value, "decryptedValue", name, options);
    (0, bytes_js_1.assertRecordBytesHexProperty)(value, "extraData", name, options);
}
//# sourceMappingURL=RelayerPublicDecryptSucceeded.js.map