import { FetchError } from "../base/errors/FetchError.js";
import { fetchWithRetry, getResponseBytes, } from "../base/fetch.js";
////////////////////////////////////////////////////////////////////////////////
// fetchGlobalFhePkeParamsBytes
////////////////////////////////////////////////////////////////////////////////
export async function fetchGlobalFhePkeParamsBytesWithSource(source, options) {
    if (source.crsSource.capacity !== 2048) {
        throw new FetchError({
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
////////////////////////////////////////////////////////////////////////////////
// _fetchBytes
////////////////////////////////////////////////////////////////////////////////
async function _fetchBytes(params) {
    const url = params.url;
    // Fetching a public key must use GET (the default method)
    if (params.init?.method !== undefined && params.init.method !== "GET") {
        throw new FetchError({
            url,
            message: `Invalid fetch method: expected 'GET', got '${params.init.method}'`,
        });
    }
    const response = await fetchWithRetry({
        url,
        init: params.init,
        retries: params.retries,
        retryDelayMs: params.retryDelayMs,
    });
    if (!response.ok) {
        throw new FetchError({
            url,
            message: `HTTP error! status: ${response.status} on ${response.url}`,
        });
    }
    const compactPkeCrsBytes = await getResponseBytes(response);
    return compactPkeCrsBytes;
}
//# sourceMappingURL=fetchGlobalFhePkeParamsBytesWithSource.js.map