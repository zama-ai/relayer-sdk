"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThreshold = getThreshold;
const uint_js_1 = require("../../base/uint.js");
const fragments_js_1 = require("../../host-contracts/abi/fragments.js");
const CoreFhevm_p_js_1 = require("../../runtime/CoreFhevm-p.js");
async function getThreshold(fhevm, parameters) {
    const trustedClient = (0, CoreFhevm_p_js_1.getTrustedClient)(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: fragments_js_1.getThresholdAbi,
        args: [],
        functionName: fragments_js_1.getThresholdAbi[0].name,
    });
    if (!(0, uint_js_1.isUint8)(res)) {
        throw new Error(`Invalid threshold.`);
    }
    return Number(res);
}
//# sourceMappingURL=getThreshold.js.map