"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
const fetchVerifiedInputProof_js_1 = require("./fetchVerifiedInputProof.js");
const generateZkProof_js_1 = require("./generateZkProof.js");
async function encrypt(fhevm, parameters) {
    const { contractAddress, userAddress, values, globalFhePublicEncryptionParams, } = parameters;
    const zkProof = await (0, generateZkProof_js_1.generateZkProof)(fhevm, {
        globalFhePublicEncryptionParams,
        contractAddress,
        userAddress,
        values,
    });
    const inputProof = await (0, fetchVerifiedInputProof_js_1.fetchVerifiedInputProof)(fhevm, {
        zkProof,
        extraData: parameters.extraData,
        options: parameters.options,
    });
    return inputProof;
}
//# sourceMappingURL=encrypt.js.map