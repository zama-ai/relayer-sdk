"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTfheModule = initTfheModule;
const tfhe_v1_5_3_js_1 = require("../../../../wasm/tfhe/tfhe.v1.5.3.js");
const tfhe_v1_5_3_js_2 = require("../../../../wasm/tfhe/tfhe.v1.5.3.js");
const wasm_js_1 = require("../../../base/wasm.js");
const isomorphicWorker_js_1 = require("../../../base/isomorphicWorker.js");
const wasm_feature_detect_1 = require("wasm-feature-detect");
const CoreFhevmRuntime_p_js_1 = require("../../../runtime/CoreFhevmRuntime-p.js");
function dynamicImportWasmBase64() {
    return Promise.resolve().then(() => require("../../../../wasm/tfhe/tfhe_bg.v1.5.3.wasm.base64.js"));
}
const TFHE_WORKER_JS_FILENAME = "tfhe-worker.v1.5.3.mjs";
const TFHE_BG_WASM_FILENAME = "tfhe_bg.v1.5.3.wasm";
const wasmBaseUrl_js_1 = require("../../../../wasm/wasmBaseUrl.js");
const nodeDefaultLocateFile = (file) => {
    return new URL(`./tfhe/${file}`, wasmBaseUrl_js_1.wasmBaseUrl);
};
let resolvedTfheModuleConfig = undefined;
async function _getOrResolveTfheModuleConfig(runtime) {
    if (resolvedTfheModuleConfig !== undefined)
        return resolvedTfheModuleConfig;
    resolvedTfheModuleConfig = await _resolveTfheModuleConfig(runtime.config);
    return resolvedTfheModuleConfig;
}
async function _resolveTfheModuleConfig(parameters) {
    if (cachedTfheModulePromise !== undefined) {
        throw new Error("Cannot configure module after initialization has started");
    }
    const { locateFile, singleThread: singleThreadConfig, numberOfThreads: numberOfThreadsConfig, } = parameters;
    let singleThread = false;
    if (singleThreadConfig !== undefined) {
        singleThread = singleThreadConfig;
    }
    const canUseBlob = await (0, isomorphicWorker_js_1.isBlobWorkerSupported)();
    let wasmUrl;
    let workerUrl;
    if (locateFile !== undefined) {
        workerUrl = locateFile(TFHE_WORKER_JS_FILENAME);
        wasmUrl = locateFile(TFHE_BG_WASM_FILENAME);
    }
    else {
        if (!(0, isomorphicWorker_js_1.isBrowserLike)()) {
            workerUrl = nodeDefaultLocateFile(TFHE_WORKER_JS_FILENAME);
            wasmUrl = nodeDefaultLocateFile(TFHE_BG_WASM_FILENAME);
        }
        else {
            if (!canUseBlob) {
                throw new Error("Missing locate file function");
            }
        }
    }
    let numberOfThreads;
    if (!singleThread) {
        numberOfThreads = numberOfThreadsConfig ?? navigator.hardwareConcurrency;
        if (numberOfThreads > 0) {
            const supportsThreads = await (0, wasm_feature_detect_1.threads)();
            if (!supportsThreads) {
                console.warn("This browser does not support threads. Verify that your server returns correct headers:\n", "'Cross-Origin-Opener-Policy': 'same-origin'\n", "'Cross-Origin-Embedder-Policy': 'require-corp'");
                singleThread = true;
                numberOfThreads = 0;
            }
        }
        else {
            singleThread = true;
            numberOfThreads = 0;
        }
    }
    else {
        numberOfThreads = 0;
    }
    (0, tfhe_v1_5_3_js_1.setWorkerUrlConfig)({
        workerUrl,
        logger: parameters.logger,
    });
    const cfg = {
        numberOfThreads,
        workerUrl,
        wasmUrl,
        singleThread,
        logger: parameters.logger,
    };
    parameters.logger?.debug(JSON.stringify(cfg, null, 2));
    return cfg;
}
let cachedTfheModulePromise;
let ownerUid = undefined;
async function initTfheModule(runtime) {
    (0, CoreFhevmRuntime_p_js_1.assertIsFhevmRuntime)(runtime, {});
    if (ownerUid !== undefined && runtime.uid !== ownerUid) {
        throw new Error(`Encrypt WASM module is already owned by runtime '${ownerUid}' and cannot be shared with runtime '${runtime.uid}'`);
    }
    ownerUid = runtime.uid;
    if (cachedTfheModulePromise !== undefined) {
        return cachedTfheModulePromise;
    }
    const cfg = await _getOrResolveTfheModuleConfig(runtime);
    cachedTfheModulePromise = _initTfheModule(cfg);
    cachedTfheModulePromise.catch(() => {
        cachedTfheModulePromise = undefined;
    });
    return cachedTfheModulePromise;
}
async function _initTfheModule(cfg) {
    let wasmModule;
    if (cfg.wasmUrl !== undefined) {
        cfg.logger?.debug(`compile wasm at: ${cfg.wasmUrl}`);
        wasmModule = await (0, wasm_js_1.isomorphicCompileWasm)(cfg.wasmUrl);
    }
    else {
        cfg.logger?.debug(`compile wasm from embedded base64`);
        const { tfheWasmBase64 } = await dynamicImportWasmBase64();
        wasmModule = await (0, wasm_js_1.isomorphicCompileWasmFromBase64)(tfheWasmBase64);
    }
    const input = { module_or_path: wasmModule };
    await (0, tfhe_v1_5_3_js_2.default)(input);
    (0, tfhe_v1_5_3_js_1.init_panic_hook)();
    if (!cfg.singleThread) {
        cfg.logger?.debug(`initThreadPool(${cfg.numberOfThreads})`);
        await (0, tfhe_v1_5_3_js_1.initThreadPool)(cfg.numberOfThreads);
    }
}
//# sourceMappingURL=init-p.js.map