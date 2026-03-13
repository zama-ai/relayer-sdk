"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIVATE_ETHERS_TOKEN = void 0;
exports.setFhevmRuntimeConfig = setFhevmRuntimeConfig;
exports.getEthersRuntime = getEthersRuntime;
exports.ethersContractRunnerToTrustedClient = ethersContractRunnerToTrustedClient;
exports.trustedClientToEthersContractRunner = trustedClientToEthersContractRunner;
exports.createFhevmRuntime = createFhevmRuntime;
const trustedValue_js_1 = require("../../core/base/trustedValue.js");
const CoreFhevmRuntime_p_js_1 = require("../../core/runtime/CoreFhevmRuntime-p.js");
const createTrustedClient_js_1 = require("../../core/modules/ethereum/createTrustedClient.js");
const ethereum_js_1 = require("./ethereum.js");
exports.PRIVATE_ETHERS_TOKEN = Symbol("ethers.token");
let cachedEthersRuntime;
let globalFhevmRuntimeConfig;
function setFhevmRuntimeConfig(config) {
    if (globalFhevmRuntimeConfig === undefined) {
        globalFhevmRuntimeConfig = { ...config };
        return;
    }
    if (globalFhevmRuntimeConfig.logger !== config.logger ||
        globalFhevmRuntimeConfig.locateFile !== config.locateFile ||
        globalFhevmRuntimeConfig.singleThread !== config.singleThread ||
        globalFhevmRuntimeConfig.numberOfThreads !== config.numberOfThreads) {
        throw new Error("FhevmRuntime config has already been set and cannot be changed. " +
            "Ensure setFhevmRuntimeConfig is called only once, or with identical parameters.");
    }
}
function getEthersRuntime() {
    if (globalFhevmRuntimeConfig === undefined) {
        throw new Error("Call setFhevmRuntimeConfig first.");
    }
    const em = (0, ethereum_js_1.ethereumModule)();
    cachedEthersRuntime ??= createFhevmRuntime({
        ethereum: em.ethereum,
        config: globalFhevmRuntimeConfig,
    });
    return cachedEthersRuntime;
}
function ethersContractRunnerToTrustedClient(runner) {
    return (0, createTrustedClient_js_1.createTrustedClient)(runner, exports.PRIVATE_ETHERS_TOKEN);
}
function trustedClientToEthersContractRunner(trustedClient) {
    return (0, trustedValue_js_1.verifyTrustedValue)(trustedClient, exports.PRIVATE_ETHERS_TOKEN);
}
function createFhevmRuntime(parameters) {
    return (0, CoreFhevmRuntime_p_js_1.createFhevmRuntime)(exports.PRIVATE_ETHERS_TOKEN, parameters);
}
//# sourceMappingURL=ethers-p.js.map