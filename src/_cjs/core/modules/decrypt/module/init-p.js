"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTkmsModule = initTkmsModule;
const kms_lib_js_1 = require("../../../../wasm/tkms/kms_lib.js");
const isomorphicWorker_js_1 = require("../../../base/isomorphicWorker.js");
const wasm_js_1 = require("../../../base/wasm.js");
const CoreFhevmRuntime_p_js_1 = require("../../../runtime/CoreFhevmRuntime-p.js");
function dynamicImportWasmBase64() {
    return Promise.resolve().then(() => require("../../../../wasm/tkms/kms_lib_bg.wasm.base64.js"));
}
const KMS_BG_WASM_FILENAME = "kms_lib_bg.wasm";
const wasmBaseUrl_js_1 = require("../../../../wasm/wasmBaseUrl.js");
const nodeDefaultLocateFile = (file) => {
    return new URL(`./tkms/${file}`, wasmBaseUrl_js_1.wasmBaseUrl);
};
let resolvedTkmsModuleConfig = undefined;
function _getOrResolveTkmsModuleConfig(runtime) {
    if (resolvedTkmsModuleConfig !== undefined)
        return resolvedTkmsModuleConfig;
    resolvedTkmsModuleConfig = _resolveTkmsModuleConfig(runtime.config);
    return resolvedTkmsModuleConfig;
}
function _resolveTkmsModuleConfig(parameters) {
    if (cachedTkmsModulePromise !== undefined) {
        throw new Error("Cannot configure module after initialization has started");
    }
    const { locateFile } = parameters;
    let wasmUrl;
    if (locateFile !== undefined) {
        wasmUrl = locateFile(KMS_BG_WASM_FILENAME);
    }
    else {
        if (!(0, isomorphicWorker_js_1.isBrowserLike)()) {
            wasmUrl = nodeDefaultLocateFile(KMS_BG_WASM_FILENAME);
        }
    }
    const cfg = {
        wasmUrl,
        logger: parameters.logger,
    };
    parameters.logger?.debug(JSON.stringify(resolvedTkmsModuleConfig, null, 2));
    return cfg;
}
let cachedTkmsModulePromise;
let ownerUid = undefined;
async function _initTkmsModule(cfg) {
    let wasmModule;
    if (cfg.wasmUrl !== undefined) {
        cfg.logger?.debug(`compile wasm at: ${cfg.wasmUrl}`);
        wasmModule = await (0, wasm_js_1.isomorphicCompileWasm)(cfg.wasmUrl);
    }
    else {
        cfg.logger?.debug(`compile wasm from embedded base64`);
        const { tkmsWasmBase64 } = await dynamicImportWasmBase64();
        wasmModule = await (0, wasm_js_1.isomorphicCompileWasmFromBase64)(tkmsWasmBase64);
    }
    const input = { module_or_path: wasmModule };
    await (0, kms_lib_js_1.default)(input);
}
async function initTkmsModule(runtime) {
    (0, CoreFhevmRuntime_p_js_1.assertIsFhevmRuntime)(runtime, {});
    if (ownerUid !== undefined && runtime.uid !== ownerUid) {
        throw new Error(`Decrypt WASM module is already owned by runtime '${ownerUid}' and cannot be shared with runtime '${runtime.uid}'`);
    }
    ownerUid = runtime.uid;
    if (cachedTkmsModulePromise !== undefined) {
        return cachedTkmsModulePromise;
    }
    const cfg = _getOrResolveTkmsModuleConfig(runtime);
    cachedTkmsModulePromise = _initTkmsModule(cfg);
    cachedTkmsModulePromise.catch(() => {
        cachedTkmsModulePromise = undefined;
    });
    return cachedTkmsModulePromise;
}
//# sourceMappingURL=init-p.js.map