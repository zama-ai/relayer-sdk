"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relayerModule = void 0;
const fetchCoprocessorSignatures_js_1 = require("./fetchCoprocessorSignatures.js");
const fetchDelegatedUserDecrypt_js_1 = require("./fetchDelegatedUserDecrypt.js");
const fetchPublicDecrypt_js_1 = require("./fetchPublicDecrypt.js");
const fetchGlobalFhePkeParamsBytes_js_1 = require("./fetchGlobalFhePkeParamsBytes.js");
const fetchGlobalFhePkeParamsSource_js_1 = require("./fetchGlobalFhePkeParamsSource.js");
const fetchUserDecrypt_js_1 = require("./fetchUserDecrypt.js");
const relayerModule = (_runtime) => {
    return Object.freeze({
        relayer: Object.freeze({
            fetchGlobalFhePkeParamsSource: fetchGlobalFhePkeParamsSource_js_1.fetchGlobalFhePkeParamsSource,
            fetchGlobalFhePkeParamsBytes: fetchGlobalFhePkeParamsBytes_js_1.fetchGlobalFhePkeParamsBytes,
            fetchCoprocessorSignatures: fetchCoprocessorSignatures_js_1.fetchCoprocessorSignatures,
            fetchPublicDecrypt: fetchPublicDecrypt_js_1.fetchPublicDecrypt,
            fetchUserDecrypt: fetchUserDecrypt_js_1.fetchUserDecrypt,
            fetchDelegatedUserDecrypt: fetchDelegatedUserDecrypt_js_1.fetchDelegatedUserDecrypt,
        }),
    });
};
exports.relayerModule = relayerModule;
//# sourceMappingURL=index.js.map