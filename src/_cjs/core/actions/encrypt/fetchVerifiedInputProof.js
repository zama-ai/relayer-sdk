"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVerifiedInputProof = fetchVerifiedInputProof;
const InputProofError_js_1 = require("../../errors/InputProofError.js");
const FhevmHandle_js_1 = require("../../handle/FhevmHandle.js");
const createVerifiedInputProofFromComponents_js_1 = require("./createVerifiedInputProofFromComponents.js");
async function fetchVerifiedInputProof(fhevm, parameters) {
    const { zkProof, extraData, options } = parameters;
    const fhevmHandles = zkProof.getFhevmHandles();
    if (fhevmHandles.length === 0) {
        throw new InputProofError_js_1.InputProofError({
            message: `Input proof must contain at least one external handle`,
        });
    }
    const { handles: coprocessorSignedHandles, coprocessorEIP712Signatures: coprocessorSignatures, } = await fhevm.runtime.relayer.fetchCoprocessorSignatures({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, {
        payload: {
            zkProof,
            extraData,
        },
        options,
    });
    (0, FhevmHandle_js_1.assertFhevmHandleArrayEquals)(fhevmHandles, coprocessorSignedHandles);
    return await (0, createVerifiedInputProofFromComponents_js_1.createVerifiedInputProofFromComponents)(fhevm, {
        coprocessorEIP712Signatures: coprocessorSignatures,
        externalHandles: fhevmHandles,
        extraData: extraData,
        coprocessorSignedParams: {
            userAddress: zkProof.userAddress,
            contractAddress: zkProof.contractAddress,
        },
    });
}
//# sourceMappingURL=fetchVerifiedInputProof.js.map