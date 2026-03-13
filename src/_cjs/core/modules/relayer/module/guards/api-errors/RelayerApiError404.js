"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerApiError404 = assertIsRelayerApiError404;
const string_js_1 = require("../../../../../base/string.js");
function assertIsRelayerApiError404(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "label", name, {
        expectedValue: "not_found",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError404.js.map