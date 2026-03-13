"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptModule = void 0;
const api_p_js_1 = require("./api-p.js");
const init_p_js_1 = require("./init-p.js");
const encryptModule = (runtime) => {
    return Object.freeze({
        encrypt: Object.freeze({
            initTfheModule: () => (0, init_p_js_1.initTfheModule)(runtime),
            parseTFHEProvenCompactCiphertextList: (args) => (0, api_p_js_1.parseTFHEProvenCompactCiphertextList)(runtime, args),
            buildWithProofPacked: (args) => (0, api_p_js_1.buildWithProofPacked)(runtime, args),
            serializeGlobalFhePkeParams: (args) => (0, api_p_js_1.serializeGlobalFhePkeParams)(runtime, args),
            serializeGlobalFhePublicKey: (args) => (0, api_p_js_1.serializeGlobalFhePublicKey)(runtime, args),
            serializeGlobalFheCrs: (args) => (0, api_p_js_1.serializeGlobalFheCrs)(runtime, args),
            deserializeGlobalFhePublicKey: (args) => (0, api_p_js_1.deserializeGlobalFhePublicKey)(runtime, args),
            deserializeGlobalFheCrs: (args) => (0, api_p_js_1.deserializeGlobalFheCrs)(runtime, args),
        }),
    });
};
exports.encryptModule = encryptModule;
//# sourceMappingURL=index.js.map