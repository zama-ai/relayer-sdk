"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsRelayerApiError503 = assertIsRelayerApiError503;
const string_js_1 = require("../../../../../base/string.js");
function assertIsRelayerApiError503(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "label", name, {
        expectedValue: [
            "protocol_paused",
            "gateway_not_reachable",
            "readiness_check_timed_out",
            "response_timed_out",
        ],
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "message", name, options);
}
//# sourceMappingURL=RelayerApiError503.js.map