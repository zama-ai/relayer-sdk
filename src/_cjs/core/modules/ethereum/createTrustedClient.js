"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrustedClient = createTrustedClient;
const trustedValue_js_1 = require("../../base/trustedValue.js");
function createTrustedClient(nativeClient, token) {
    const tc = (0, trustedValue_js_1.createTrustedValue)(nativeClient, token);
    return tc;
}
//# sourceMappingURL=createTrustedClient.js.map