"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistAllowed = persistAllowed;
const fragments_js_1 = require("../../host-contracts/abi/fragments.js");
const CoreFhevm_p_js_1 = require("../../runtime/CoreFhevm-p.js");
async function persistAllowed(fhevm, parameters) {
    const trustedClient = (0, CoreFhevm_p_js_1.getTrustedClient)(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: fragments_js_1.persistAllowedAbi,
        args: [parameters.args.handle, parameters.args.account],
        functionName: fragments_js_1.persistAllowedAbi[0].name,
    });
    if (typeof res !== "boolean") {
        throw new Error(`Invalid persistAllowed result.`);
    }
    return res;
}
//# sourceMappingURL=persistAllowed.js.map