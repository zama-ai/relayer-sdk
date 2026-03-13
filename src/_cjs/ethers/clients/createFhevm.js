"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevm = createFhevm;
const fhevm_js_1 = require("../../core/clients/fhevm.js");
const ethers_p_js_1 = require("../internal/ethers-p.js");
function createFhevm(parameters) {
    const runtime = (0, ethers_p_js_1.getEthersRuntime)();
    return (0, fhevm_js_1.createFhevm)(ethers_p_js_1.PRIVATE_ETHERS_TOKEN, {
        chain: parameters?.chain,
        runtime,
        client: parameters?.provider,
    });
}
//# sourceMappingURL=createFhevm.js.map