"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGlobalFhePkeParamsSource = fetchGlobalFhePkeParamsSource;
const auth_js_1 = require("../../../base/auth.js");
const RelayerFetchError_js_1 = require("../../../errors/RelayerFetchError.js");
const record_js_1 = require("../../../base/record.js");
const fetch_js_1 = require("../../../base/fetch.js");
const _version_js_1 = require("../../../_version.js");
const string_js_1 = require("../../../base/string.js");
async function fetchGlobalFhePkeParamsSource(relayerClient, parameters) {
    const options = parameters.options;
    const relayerUrl = relayerClient.relayerUrl;
    const init = (0, auth_js_1.setAuth)({
        method: "GET",
        headers: {
            "ZAMA-SDK-VERSION": _version_js_1.version,
            "ZAMA-SDK-NAME": _version_js_1.sdkName,
        },
    }, options?.auth);
    const url = `${(0, string_js_1.removeSuffix)(relayerUrl, "/")}/keyurl`;
    let response;
    try {
        response = await (0, fetch_js_1.fetchWithRetry)({
            url,
            init,
            retries: options?.fetchRetries,
            retryDelayMs: options?.fetchRetryDelayInMilliseconds,
        });
    }
    catch (cause) {
        if (cause.name === "AbortError") {
            throw cause;
        }
        _throwFetchError({
            url,
            message: `Fetch ${url} failed!`,
            cause,
        });
    }
    if (!response.ok) {
        _throwFetchError({
            url,
            message: `HTTP error! status: ${response.status} on ${response.url}`,
        });
    }
    let json;
    try {
        json = (await response.json());
    }
    catch (e) {
        _throwFetchError({
            url,
            message: "JSON parsing failed.",
            cause: e,
        });
    }
    _assertIsRelayerFetchResponseJson(url, json);
    const result = json.response;
    _assertIsFetchKeyUrlResult(result, "response");
    return {
        publicKeySource: {
            id: result.fheKeyInfo[0].fhePublicKey.dataId,
            url: result.fheKeyInfo[0].fhePublicKey.urls[0],
        },
        crsSource: {
            id: result.crs[2048].dataId,
            url: result.crs[2048].urls[0],
            capacity: 2048,
        },
    };
}
function _throwFetchError(params) {
    throw new RelayerFetchError_js_1.RelayerFetchError({
        url: params.url,
        fetchMethod: "GET",
        operation: "KEY_URL",
        retryCount: 0,
        elapsed: 0,
        message: params.message,
        cause: params.cause,
    });
}
function _assertIsRelayerFetchResponseJson(url, json) {
    if (json === undefined || json === null || typeof json !== "object") {
        _throwFetchError({
            url,
            message: "Unexpected response JSON.",
        });
    }
    if (!("response" in json &&
        json.response !== null &&
        json.response !== undefined)) {
        _throwFetchError({
            url,
            message: "Unexpected response JSON format: missing 'response' property.",
        });
    }
}
function _assertIsFetchKeyUrlResult(value, valueName) {
    (0, record_js_1.assertRecordArrayProperty)(value, "fheKeyInfo", valueName, {});
    if (value.fheKeyInfo.length !== 1) {
        throw new Error(`Unexpected 'fheKeyInfo' array length.`);
    }
    const fheKeyInfo = value.fheKeyInfo[0];
    const fheKeyInfoName = `${valueName}.fheKeyInfo[0]`;
    (0, record_js_1.assertRecordNonNullableProperty)(fheKeyInfo, "fhePublicKey", fheKeyInfoName, {});
    const fhePublicKey = fheKeyInfo.fhePublicKey;
    const fhePublicKeyName = `${fheKeyInfoName}.fhePublicKey`;
    (0, string_js_1.assertRecordStringProperty)(fhePublicKey, "dataId", fhePublicKeyName, {});
    (0, string_js_1.assertRecordStringArrayProperty)(fhePublicKey, "urls", fhePublicKeyName, {});
    if (fhePublicKey.urls.length !== 1) {
        throw new Error(`Unexpected '${fhePublicKeyName}.urls' array length.`);
    }
    (0, record_js_1.assertRecordNonNullableProperty)(value, "crs", valueName, {});
    (0, record_js_1.assertRecordNonNullableProperty)(value.crs, "2048", `${valueName}.crs`, {});
    (0, string_js_1.assertRecordStringProperty)(value.crs[2048], "dataId", `${valueName}.crs[2048]`, {});
    (0, string_js_1.assertRecordStringArrayProperty)(value.crs[2048], "urls", `${valueName}.crs[2048]`, {});
    if (value.crs[2048].urls.length !== 1) {
        throw new Error(`Unexpected '${valueName}.crs[2048].urls' array length.`);
    }
}
//# sourceMappingURL=fetchGlobalFhePkeParamsSource.js.map