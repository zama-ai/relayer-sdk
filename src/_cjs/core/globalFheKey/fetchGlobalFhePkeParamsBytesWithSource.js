"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGlobalFhePkeParamsBytesWithSource = fetchGlobalFhePkeParamsBytesWithSource;
const FetchError_js_1 = require("../base/errors/FetchError.js");
const fetch_js_1 = require("../base/fetch.js");
async function fetchGlobalFhePkeParamsBytesWithSource(source, options) {
    if (source.crsSource.capacity !== 2048) {
        throw new FetchError_js_1.FetchError({
            url: source.crsSource.url,
            message: `Invalid pke crs capacity ${source.crsSource.capacity.toString()}. Expecting 2048.`,
        });
    }
    const [publicKeyBytes, pkeCrsBytes] = await Promise.all([
        _fetchBytes({ url: source.publicKeySource.url, ...options }),
        _fetchBytes({ url: source.crsSource.url, ...options }),
    ]);
    return Object.freeze({
        publicKeyBytes: Object.freeze({
            id: source.publicKeySource.id,
            bytes: publicKeyBytes,
        }),
        crsBytes: Object.freeze({
            id: source.crsSource.id,
            capacity: source.crsSource.capacity,
            bytes: pkeCrsBytes,
        }),
    });
}
async function _fetchBytes(params) {
    const url = params.url;
    if (params.init?.method !== undefined && params.init.method !== "GET") {
        throw new FetchError_js_1.FetchError({
            url,
            message: `Invalid fetch method: expected 'GET', got '${params.init.method}'`,
        });
    }
    const response = await (0, fetch_js_1.fetchWithRetry)({
        url,
        init: params.init,
        retries: params.retries,
        retryDelayMs: params.retryDelayMs,
    });
    if (!response.ok) {
        throw new FetchError_js_1.FetchError({
            url,
            message: `HTTP error! status: ${response.status} on ${response.url}`,
        });
    }
    const compactPkeCrsBytes = await (0, fetch_js_1.getResponseBytes)(response);
    return compactPkeCrsBytes;
}
//# sourceMappingURL=fetchGlobalFhePkeParamsBytesWithSource.js.map