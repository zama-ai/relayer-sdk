"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptActions = encryptActions;
const encrypt_js_1 = require("../../actions/encrypt/encrypt.js");
const fetchGlobalFhePkeParams_js_1 = require("../../actions/key/fetchGlobalFhePkeParams.js");
const fetchGlobalFhePkeParamsBytes_js_1 = require("../../actions/key/fetchGlobalFhePkeParamsBytes.js");
function encryptActions(fhevm) {
    return {
        encrypt: (parameters) => (0, encrypt_js_1.encrypt)(fhevm, parameters),
        fetchGlobalFhePkeParams: (parameters) => (0, fetchGlobalFhePkeParams_js_1.fetchGlobalFhePkeParams)(fhevm, parameters),
        fetchGlobalFhePkeParamsBytes: (parameters) => (0, fetchGlobalFhePkeParamsBytes_js_1.fetchGlobalFhePkeParamsBytes)(fhevm, parameters),
    };
}
//# sourceMappingURL=encrypt.js.map