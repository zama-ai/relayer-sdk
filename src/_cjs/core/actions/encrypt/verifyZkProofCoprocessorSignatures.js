"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyZkProofCoprocessorSignatures = verifyZkProofCoprocessorSignatures;
const ZkProof_p_js_1 = require("../../coprocessor/ZkProof-p.js");
const verifyHandlesCoprocessorSignatures_js_1 = require("./verifyHandlesCoprocessorSignatures.js");
async function verifyZkProofCoprocessorSignatures(fhevm, parameters) {
    (0, ZkProof_p_js_1.assertIsZkProof)(parameters.zkProof, {});
    return (0, verifyHandlesCoprocessorSignatures_js_1.verifyHandlesCoprocessorSignatures)(fhevm, {
        handles: parameters.zkProof.getFhevmHandles(),
        userAddress: parameters.zkProof.userAddress,
        contractAddress: parameters.zkProof.contractAddress,
        chainId: parameters.zkProof.chainId,
        extraData: parameters.extraData,
        coprocessorSignatures: parameters.coprocessorSignatures,
    });
}
//# sourceMappingURL=verifyZkProofCoprocessorSignatures.js.map