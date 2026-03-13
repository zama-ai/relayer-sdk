"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerApiError429 = assertIsRelayerApiError429;
const string_js_1 = require("../../../../../base/string.js");
function assertIsRelayerApiError429(error, name, options) {
    (0, string_js_1.assertRecordStringProperty)(error, "label", name, {
        expectedValue: [
            "rate_limited",
            "protocol_overload",
        ],
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(error, "message", name, options);
}
//# sourceMappingURL=RelayerApiError429.js.map