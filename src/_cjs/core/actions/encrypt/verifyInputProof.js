"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInputProof = verifyInputProof;
const InputProofError_js_1 = require("../../errors/InputProofError.js");
const verifyHandlesCoprocessorSignatures_js_1 = require("./verifyHandlesCoprocessorSignatures.js");
async function verifyInputProof(fhevm, parameters) {
    const coprocessorSignedParams = parameters.coprocessorSignedParams ??
        parameters.inputProof.coprocessorSignedParams;
    if (coprocessorSignedParams === undefined) {
        throw new InputProofError_js_1.InputProofError({
            message: "Missing coprocessorSignedParams argument.",
        });
    }
    const chainId = parameters.inputProof.externalHandles[0].chainId;
    await (0, verifyHandlesCoprocessorSignatures_js_1.verifyHandlesCoprocessorSignatures)(fhevm, {
        chainId,
        coprocessorSignatures: parameters.inputProof.coprocessorSignatures,
        extraData: parameters.inputProof.extraData,
        handles: parameters.inputProof.externalHandles,
        userAddress: coprocessorSignedParams.userAddress,
        contractAddress: coprocessorSignedParams.contractAddress,
    });
    return parameters.inputProof;
}
//# sourceMappingURL=verifyInputProof.js.map