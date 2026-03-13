"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalFhePkeActions = globalFhePkeActions;
const fetchGlobalFhePkeParams_js_1 = require("../../actions/key/fetchGlobalFhePkeParams.js");
const fetchGlobalFhePkeParamsBytes_js_1 = require("../../actions/key/fetchGlobalFhePkeParamsBytes.js");
const resolveGlobalFhePkeParams_js_1 = require("../../actions/key/resolveGlobalFhePkeParams.js");
const deserializeGlobalFhePkeParams_js_1 = require("../../actions/runtime/deserializeGlobalFhePkeParams.js");
const serializeGlobalFhePkeParams_js_1 = require("../../actions/runtime/serializeGlobalFhePkeParams.js");
function globalFhePkeActions(fhevm) {
    return {
        fetchGlobalFhePkeParams: (parameters) => (0, fetchGlobalFhePkeParams_js_1.fetchGlobalFhePkeParams)(fhevm, parameters),
        fetchGlobalFhePkeParamsBytes: (parameters) => (0, fetchGlobalFhePkeParamsBytes_js_1.fetchGlobalFhePkeParamsBytes)(fhevm, parameters),
        deserializeGlobalFhePkeParamsFromHex: (parameters) => (0, deserializeGlobalFhePkeParams_js_1.deserializeGlobalFhePkeParamsFromHex)(fhevm, parameters),
        serializeGlobalFhePkeParamsToHex: (parameters) => (0, serializeGlobalFhePkeParams_js_1.serializeGlobalFhePkeParamsToHex)(fhevm, parameters),
        resolveGlobalFhePkeParams: (parameters) => (0, resolveGlobalFhePkeParams_js_1.resolveGlobalFhePkeParams)(fhevm, parameters),
    };
}
//# sourceMappingURL=globalFhePke.js.map