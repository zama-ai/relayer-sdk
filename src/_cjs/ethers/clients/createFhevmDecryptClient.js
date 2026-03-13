"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevmDecryptClient = createFhevmDecryptClient;
const index_js_1 = require("../../core/modules/decrypt/module/index.js");
const index_js_2 = require("../../core/modules/relayer/module/index.js");
const fhevmDecryptClient_js_1 = require("../../core/clients/fhevmDecryptClient.js");
const ethers_p_js_1 = require("../internal/ethers-p.js");
function createFhevmDecryptClient(parameters) {
    const runtime = (0, ethers_p_js_1.getEthersRuntime)()
        .extend(index_js_1.decryptModule)
        .extend(index_js_2.relayerModule);
    return (0, fhevmDecryptClient_js_1.createFhevmDecryptClient)(ethers_p_js_1.PRIVATE_ETHERS_TOKEN, {
        chain: parameters.chain,
        runtime,
        client: parameters.provider,
    });
}
//# sourceMappingURL=createFhevmDecryptClient.js.map