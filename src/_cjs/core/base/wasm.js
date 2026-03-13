"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isomorphicCompileWasm = isomorphicCompileWasm;
exports.isomorphicCompileWasmFromBase64 = isomorphicCompileWasmFromBase64;
const FetchError_js_1 = require("./errors/FetchError.js");
const fetch_js_1 = require("./fetch.js");
const isomorphicWorker_js_1 = require("./isomorphicWorker.js");
async function isomorphicDecodeBase64(base64) {
    if (!(0, isomorphicWorker_js_1.isBrowserLike)()) {
        const { Buffer } = await Promise.resolve().then(() => require("node:buffer"));
        return Buffer.from(base64, "base64");
    }
    if (await (0, fetch_js_1.isDataUrlFetchSupported)()) {
        const res = await fetch(`data:application/octet-stream;base64,${base64}`);
        return res.arrayBuffer();
    }
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
}
async function isomorphicCompileWasm(wasmUrl) {
    const isBrowser = (0, isomorphicWorker_js_1.isBrowserLike)();
    let bytes;
    if (!isBrowser && wasmUrl.protocol === "file:") {
        const { readFile } = await Promise.resolve().then(() => require("node:fs/promises"));
        const { fileURLToPath } = await Promise.resolve().then(() => require("node:url"));
        bytes = await readFile(fileURLToPath(wasmUrl));
    }
    else {
        const res = await fetch(wasmUrl);
        if (!res.ok) {
            throw new FetchError_js_1.FetchError({
                message: `Failed to fetch WASM: ${res.status} ${res.statusText}`,
                url: wasmUrl.toString(),
            });
        }
        if (isBrowser) {
            if (typeof WebAssembly.compileStreaming === "function") {
                try {
                    return await WebAssembly.compileStreaming(res);
                }
                catch (e) {
                    throw new Error("WebAssembly.compileStreaming failed. Ensure the server serves .wasm files with Content-Type: application/wasm", { cause: e });
                }
            }
        }
        bytes = await res.arrayBuffer();
    }
    return WebAssembly.compile(bytes);
}
async function isomorphicCompileWasmFromBase64(wasmAsBase64) {
    const bytes = await isomorphicDecodeBase64(wasmAsBase64);
    return WebAssembly.compile(bytes);
}
//# sourceMappingURL=wasm.js.map