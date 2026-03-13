"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetwork = getNetwork;
exports.getEthersContract = getEthersContract;
const ethers_1 = require("ethers");
const ethers_p_js_1 = require("./ethers-p.js");
async function getNetwork(hostPublicClient) {
    const runner = (0, ethers_p_js_1.trustedClientToEthersContractRunner)(hostPublicClient);
    if (runner === undefined || runner === null) {
        throw new Error("Cannot get network: client is null or undefined.");
    }
    if (typeof runner === "object" &&
        "getNetwork" in runner &&
        typeof runner.getNetwork === "function") {
        return await runner.getNetwork();
    }
    if (runner.provider != null) {
        return await runner.provider.getNetwork();
    }
    throw new Error("Cannot get network: client is neither a Provider nor a ContractRunner with a provider.");
}
function getEthersContract(hostPublicClient, contractAddress, abi) {
    const runner = (0, ethers_p_js_1.trustedClientToEthersContractRunner)(hostPublicClient);
    return new ethers_1.Contract(contractAddress, new ethers_1.Interface(abi), runner);
}
//# sourceMappingURL=utils.js.map