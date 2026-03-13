"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZkProof = generateZkProof;
const typedvalue_js_1 = require("../../base/typedvalue.js");
const ZkProofBuilder_p_js_1 = require("../../coprocessor/ZkProofBuilder-p.js");
async function generateZkProof(fhevm, parameters) {
    const { values, contractAddress, userAddress, globalFhePublicEncryptionParams, } = parameters;
    const builder = (0, ZkProofBuilder_p_js_1.createZkProofBuilder)();
    for (const value of values) {
        builder.addTypedValue((0, typedvalue_js_1.createTypedValue)(value));
    }
    return builder.build(fhevm, {
        globalFhePublicEncryptionParams,
        contractAddress,
        userAddress,
    });
}
//# sourceMappingURL=generateZkProof.js.map