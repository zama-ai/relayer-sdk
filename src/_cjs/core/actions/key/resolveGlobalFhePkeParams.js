"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGlobalFhePkeParams = resolveGlobalFhePkeParams;
const deserializeGlobalFhePkeParams_js_1 = require("../runtime/deserializeGlobalFhePkeParams.js");
const fetchGlobalFhePkeParams_js_1 = require("./fetchGlobalFhePkeParams.js");
async function resolveGlobalFhePkeParams(fhevm, parameters) {
    if (parameters.globalFheParamsBytes != null) {
        try {
            return await (0, deserializeGlobalFhePkeParams_js_1.deserializeGlobalFhePkeParams)(fhevm, parameters.globalFheParamsBytes);
        }
        catch {
        }
    }
    return await (0, fetchGlobalFhePkeParams_js_1.fetchGlobalFhePkeParams)(fhevm, {
        ignoreCache: parameters.ignoreCache,
        options: parameters.options,
    });
}
//# sourceMappingURL=resolveGlobalFhePkeParams.js.map