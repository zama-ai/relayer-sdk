"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearGlobalFhePkeParamsCache = clearGlobalFhePkeParamsCache;
exports.deleteGlobalFhePkeParamsCache = deleteGlobalFhePkeParamsCache;
exports.fetchGlobalFhePkeParamsBytes = fetchGlobalFhePkeParamsBytes;
const __globalFhePkeParamsGlobalCache = new Map();
function clearGlobalFhePkeParamsCache() {
    __globalFhePkeParamsGlobalCache.clear();
}
function deleteGlobalFhePkeParamsCache(relayerUrl) {
    return __globalFhePkeParamsGlobalCache.delete(relayerUrl);
}
async function fetchGlobalFhePkeParamsBytes(fhevm, parameters) {
    if (parameters.ignoreCache !== true) {
        const cached = __globalFhePkeParamsGlobalCache.get(fhevm.chain.fhevm.relayerUrl);
        if (cached !== undefined) {
            return cached;
        }
    }
    const promise = _fetchGlobalFhePkeParamsBytes(fhevm, parameters.options).catch((err) => {
        if (__globalFhePkeParamsGlobalCache.get(fhevm.chain.fhevm.relayerUrl) ===
            promise) {
            __globalFhePkeParamsGlobalCache.delete(fhevm.chain.fhevm.relayerUrl);
        }
        throw err;
    });
    __globalFhePkeParamsGlobalCache.set(fhevm.chain.fhevm.relayerUrl, promise);
    return promise;
}
async function _fetchGlobalFhePkeParamsBytes(fhevm, options) {
    const paramsBytes = await fhevm.runtime.relayer.fetchGlobalFhePkeParamsBytes({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, { options });
    return paramsBytes;
}
//# sourceMappingURL=fetchGlobalFhePkeParamsBytes.js.map