"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevmClient = createFhevmClient;
const index_js_1 = require("../../core/modules/encrypt/module/index.js");
const index_js_2 = require("../../core/modules/relayer/module/index.js");
const ethers_p_js_1 = require("../internal/ethers-p.js");
const fhevmClient_js_1 = require("../../core/clients/fhevmClient.js");
const index_js_3 = require("../../core/modules/decrypt/module/index.js");
function createFhevmClient(parameters) {
    const runtime = (0, ethers_p_js_1.getEthersRuntime)()
        .extend(index_js_1.encryptModule)
        .extend(index_js_3.decryptModule)
        .extend(index_js_2.relayerModule);
    return (0, fhevmClient_js_1.createFhevmClient)(ethers_p_js_1.PRIVATE_ETHERS_TOKEN, {
        chain: parameters.chain,
        runtime,
        client: parameters.provider,
    });
}
//# sourceMappingURL=createFhevmClient.js.map