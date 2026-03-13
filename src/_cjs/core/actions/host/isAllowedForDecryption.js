"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedForDecryption = isAllowedForDecryption;
const fragments_js_1 = require("../../host-contracts/abi/fragments.js");
const CoreFhevm_p_js_1 = require("../../runtime/CoreFhevm-p.js");
async function isAllowedForDecryption(fhevm, parameters) {
    const trustedClient = (0, CoreFhevm_p_js_1.getTrustedClient)(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: fragments_js_1.isAllowedForDecryptionAbi,
        args: [parameters.args.handle],
        functionName: fragments_js_1.isAllowedForDecryptionAbi[0].name,
    });
    if (typeof res !== "boolean") {
        throw new Error(`Invalid isAllowedForDecryption result.`);
    }
    return res;
}
//# sourceMappingURL=isAllowedForDecryption.js.map