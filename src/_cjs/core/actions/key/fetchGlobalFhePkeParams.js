"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGlobalFhePkeParams = fetchGlobalFhePkeParams;
const deserializeGlobalFhePkeParams_js_1 = require("../runtime/deserializeGlobalFhePkeParams.js");
const fetchGlobalFhePkeParamsBytes_js_1 = require("./fetchGlobalFhePkeParamsBytes.js");
async function fetchGlobalFhePkeParams(fhevm, parameters) {
    const paramsBytes = await (0, fetchGlobalFhePkeParamsBytes_js_1.fetchGlobalFhePkeParamsBytes)(fhevm, parameters);
    return (0, deserializeGlobalFhePkeParams_js_1.deserializeGlobalFhePkeParams)(fhevm, paramsBytes);
}
//# sourceMappingURL=fetchGlobalFhePkeParams.js.map