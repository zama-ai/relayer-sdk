"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerApiError500 = assertIsRelayerApiError500;
const string_js_1 = require("../../../../../base/string.js");
function assertIsRelayerApiError500(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "label", name, {
        expectedValue: "internal_server_error",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError500.js.map