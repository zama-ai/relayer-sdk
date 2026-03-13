"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponseBytes = getResponseBytes;
exports.formatFetchErrorMetaMessages = formatFetchErrorMetaMessages;
exports.fetchWithRetry = fetchWithRetry;
exports.isDataUrlFetchSupported = isDataUrlFetchSupported;
const bytes_js_1 = require("./bytes.js");
const timeout_js_1 = require("./timeout.js");
async function getResponseBytes(response) {
    const bytes = typeof response.bytes === "function"
        ? (0, bytes_js_1.normalizeBytes)(await response.bytes())
        : (0, bytes_js_1.normalizeBytes)(await response.arrayBuffer());
    return bytes;
}
function getFetchErrorInfo(error) {
    const errors = [];
    let current = error;
    const skipProps = new Set(["message", "cause", "stack", "name"]);
    while (current !== null && typeof current === "object") {
        const obj = current;
        if (typeof obj.message !== "string") {
            break;
        }
        const name = typeof obj.name === "string" ? obj.name : "Error";
        const props = {};
        for (const key of Object.keys(obj)) {
            if (skipProps.has(key))
                continue;
            const value = obj[key];
            if (typeof value === "string" || typeof value === "number") {
                props[key] = value;
            }
        }
        errors.push({ name, message: obj.message, props });
        current = obj.cause;
    }
    return errors;
}
function formatFetchErrorMetaMessages(error) {
    const infos = getFetchErrorInfo(error);
    if (infos.length === 0) {
        return [String(error)];
    }
    return infos.map((info, index) => {
        const isRoot = index === 0;
        const propEntries = Object.entries(info.props);
        if (isRoot) {
            const propsStr = propEntries.length > 0
                ? ` [${propEntries.map(([k, v]) => `${k}=${v}`).join(", ")}]`
                : "";
            return `${info.name}: ${info.message}${propsStr}`;
        }
        else {
            const allProps = [
                ["name", info.name],
                ...propEntries,
            ];
            const propsStr = ` [${allProps.map(([k, v]) => `${k}=${v}`).join(", ")}]`;
            return `Cause: ${info.message}${propsStr}`;
        }
    });
}
async function fetchWithRetry(args) {
    let lastError;
    const retries = args.retries ?? 3;
    const retryDelayMs = args.retryDelayMs ?? 1000;
    const { url, init } = args;
    for (let attempt = 0; attempt <= retries; attempt++) {
        init?.signal?.throwIfAborted();
        try {
            return await fetch(url, init);
        }
        catch (error) {
            if (error.name === "AbortError") {
                throw error;
            }
            lastError = error;
            if (attempt < retries) {
                await (0, timeout_js_1.abortableSleep)(retryDelayMs, init?.signal ?? undefined);
            }
        }
    }
    throw lastError;
}
let _isDataUrlFetchSupportedPromise;
function isDataUrlFetchSupported() {
    _isDataUrlFetchSupportedPromise ??= _isDataUrlFetchSupported();
    return _isDataUrlFetchSupportedPromise;
}
async function _isDataUrlFetchSupported() {
    try {
        const res = await fetch("data:text/plain;base64,YQ==");
        if (!res.ok) {
            return false;
        }
        const buf = await res.arrayBuffer();
        return buf.byteLength === 1 && new Uint8Array(buf)[0] === 0x61;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=fetch.js.map