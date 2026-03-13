"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAllowedForDecryption = checkAllowedForDecryption;
const ACLError_js_1 = require("../../../errors/ACLError.js");
const FhevmHandle_js_1 = require("../../../handle/FhevmHandle.js");
const isAllowedForDecryption_js_1 = require("./isAllowedForDecryption.js");
async function checkAllowedForDecryption(fhevm, parameters) {
    const { handles, options } = parameters;
    const handlesArray = Array.isArray(handles) ? handles : [handles];
    const results = await (0, isAllowedForDecryption_js_1.isAllowedForDecryption)(fhevm, {
        handles: handlesArray,
        options,
    });
    const failedHandles = handlesArray
        .filter((_, i) => results[i] !== true)
        .map((h) => (0, FhevmHandle_js_1.toFhevmHandle)(h).bytes32Hex);
    if (failedHandles.length > 0) {
        throw new ACLError_js_1.ACLPublicDecryptionError({
            contractAddress: fhevm.chain.fhevm.contracts.acl
                .address,
            handles: failedHandles,
        });
    }
}
//# sourceMappingURL=checkAllowedForDecryption.js.map