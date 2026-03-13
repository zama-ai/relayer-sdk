"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevmEncryptClient = createFhevmEncryptClient;
const index_js_1 = require("../../core/modules/encrypt/module/index.js");
const index_js_2 = require("../../core/modules/relayer/module/index.js");
const ethers_p_js_1 = require("../internal/ethers-p.js");
const fhevmEncryptClient_js_1 = require("../../core/clients/fhevmEncryptClient.js");
function createFhevmEncryptClient(parameters) {
    const runtime = (0, ethers_p_js_1.getEthersRuntime)()
        .extend(index_js_1.encryptModule)
        .extend(index_js_2.relayerModule);
    return (0, fhevmEncryptClient_js_1.createFhevmEncryptClient)(ethers_p_js_1.PRIVATE_ETHERS_TOKEN, {
        chain: parameters.chain,
        runtime,
        client: parameters.provider,
    });
}
//# sourceMappingURL=createFhevmEncryptClient.js.map