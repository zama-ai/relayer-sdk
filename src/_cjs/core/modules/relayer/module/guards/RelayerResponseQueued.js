"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerPostResponse202Queued = assertIsRelayerPostResponse202Queued;
exports.assertIsRelayerGetResponse202Queued = assertIsRelayerGetResponse202Queued;
const record_js_1 = require("../../../../base/record.js");
const string_js_1 = require("../../../../base/string.js");
function assertIsRelayerPostResponse202Queued(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "status", name, {
        expectedValue: "queued",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "requestId", name, options);
    (0, record_js_1.assertRecordNonNullableProperty)(value, "result", name, options);
    (0, string_js_1.assertRecordStringProperty)(value.result, "jobId", `${name}.result`, options);
}
function assertIsRelayerGetResponse202Queued(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "status", name, {
        expectedValue: "queued",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "requestId", name, options);
}
//# sourceMappingURL=RelayerResponseQueued.js.map