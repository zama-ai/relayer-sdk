"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGlobalFhePkeParamsBytes = fetchGlobalFhePkeParamsBytes;
const fetchGlobalFhePkeParamsSource_js_1 = require("./fetchGlobalFhePkeParamsSource.js");
const fetchGlobalFhePkeParamsBytesWithSource_js_1 = require("../../../globalFheKey/fetchGlobalFhePkeParamsBytesWithSource.js");
async function fetchGlobalFhePkeParamsBytes(relayerClient, parameters) {
    const { options } = parameters;
    const relayerOptions = options;
    const source = await (0, fetchGlobalFhePkeParamsSource_js_1.fetchGlobalFhePkeParamsSource)(relayerClient, {
        options: relayerOptions,
    });
    const init = relayerOptions?.signal !== undefined
        ? { signal: relayerOptions.signal }
        : undefined;
    const paramsBytes = await (0, fetchGlobalFhePkeParamsBytesWithSource_js_1.fetchGlobalFhePkeParamsBytesWithSource)(source, {
        retries: relayerOptions?.fetchRetries,
        retryDelayMs: relayerOptions?.fetchRetryDelayInMilliseconds,
        init,
    });
    return paramsBytes;
}
//# sourceMappingURL=fetchGlobalFhePkeParamsBytes.js.map