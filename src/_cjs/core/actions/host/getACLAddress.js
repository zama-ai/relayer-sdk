"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getACLAddress = getACLAddress;
const address_js_1 = require("../../base/address.js");
const fragments_js_1 = require("../../host-contracts/abi/fragments.js");
const CoreFhevm_p_js_1 = require("../../runtime/CoreFhevm-p.js");
async function getACLAddress(fhevm, parameters) {
    const trustedClient = (0, CoreFhevm_p_js_1.getTrustedClient)(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: fragments_js_1.getACLAddressAbi,
        args: [],
        functionName: fragments_js_1.getACLAddressAbi[0].name,
    });
    try {
        (0, address_js_1.assertIsChecksummedAddress)(res, {});
    }
    catch (e) {
        throw new Error(`Invalid ACL address.`, {
            cause: e,
        });
    }
    return res;
}
//# sourceMappingURL=getACLAddress.js.map