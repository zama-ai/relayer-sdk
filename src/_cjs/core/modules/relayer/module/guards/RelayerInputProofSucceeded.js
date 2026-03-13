"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerInputProofSucceeded = assertIsRelayerInputProofSucceeded;
const record_js_1 = require("../../../../base/record.js");
const string_js_1 = require("../../../../base/string.js");
const record_js_2 = require("../../../../base/record.js");
const bytes_js_1 = require("../../../../base/bytes.js");
function assertIsRelayerInputProofSucceeded(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "status", name, {
        expectedValue: "succeeded",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "requestId", name, options);
    (0, record_js_1.assertRecordNonNullableProperty)(value, "result", name, options);
    (0, record_js_2.assertRecordBooleanProperty)(value.result, "accepted", `${name}.result`, options);
    if (value.result.accepted) {
        _assertIsRelayerResult200InputProofAccepted(value.result, `${name}.result`, options);
    }
    else {
        _assertIsRelayerResult200InputProofRejected(value.result, `${name}.result`, options);
    }
}
function _assertIsRelayerResult200InputProofAccepted(value, name, options) {
    (0, record_js_2.assertRecordBooleanProperty)(value, "accepted", name, {
        expectedValue: true,
        ...options,
    });
    (0, bytes_js_1.assertRecordBytesHexProperty)(value, "extraData", name, options);
    (0, bytes_js_1.assertRecordBytes32HexArrayProperty)(value, "handles", name, options);
    (0, bytes_js_1.assertRecordBytesHexArrayProperty)(value, "signatures", name, options);
}
function _assertIsRelayerResult200InputProofRejected(value, name, options) {
    (0, record_js_2.assertRecordBooleanProperty)(value, "accepted", name, {
        expectedValue: false,
        ...options,
    });
    (0, bytes_js_1.assertRecordBytesHexProperty)(value, "extraData", name, options);
}
//# sourceMappingURL=RelayerInputProofSucceeded.js.map