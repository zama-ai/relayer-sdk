////////////////////////////////////////////////////////////////////////////////
/**
 * Module-level cache keyed by relayer URL.
 * Stores the in-flight or resolved promise to avoid duplicate fetches
 * and race conditions when multiple concurrent calls are made.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const __globalFhePkeParamsGlobalCache = new Map();
/**
 * Clears all entries from the GlobalFhePkeParams cache.
 */
export function clearGlobalFhePkeParamsCache() {
    __globalFhePkeParamsGlobalCache.clear();
}
/**
 * Removes a specific relayer URL entry from the GlobalFhePkeParams cache.
 */
export function deleteGlobalFhePkeParamsCache(relayerUrl) {
    return __globalFhePkeParamsGlobalCache.delete(relayerUrl);
}
////////////////////////////////////////////////////////////////////////////////
export async function fetchGlobalFhePkeParamsBytes(fhevm, parameters) {
    if (parameters.ignoreCache !== true) {
        // 1. Check if already stored in cache
        const cached = __globalFhePkeParamsGlobalCache.get(fhevm.chain.fhevm.relayerUrl);
        if (cached !== undefined) {
            return cached;
        }
    }
    // 2. Create and cache the promise immediately to prevent race conditions.
    // The result is always cached, even when ignoreCache is true,
    // so that future callers benefit from the fresh fetch.
    const promise = _fetchGlobalFhePkeParamsBytes(fhevm, parameters.options).catch((err) => {
        // Only remove from cache if this promise is still the cached one.
        // A concurrent deleteGlobalFhePkeParamsCache + re-fetch may have replaced it.
        if (__globalFhePkeParamsGlobalCache.get(fhevm.chain.fhevm.relayerUrl) ===
            promise) {
            __globalFhePkeParamsGlobalCache.delete(fhevm.chain.fhevm.relayerUrl);
        }
        throw err;
    });
    // save in cache even if `ignoreCache === true`
    __globalFhePkeParamsGlobalCache.set(fhevm.chain.fhevm.relayerUrl, promise);
    return promise;
}
////////////////////////////////////////////////////////////////////////////////
async function _fetchGlobalFhePkeParamsBytes(fhevm, options) {
    const paramsBytes = await fhevm.runtime.relayer.fetchGlobalFhePkeParamsBytes({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, { options });
    return paramsBytes;
}
//# sourceMappingURL=fetchGlobalFhePkeParamsBytes.js.map