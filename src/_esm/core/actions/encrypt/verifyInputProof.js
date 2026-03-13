import { InputProofError } from "../../errors/InputProofError.js";
import { verifyHandlesCoprocessorSignatures } from "./verifyHandlesCoprocessorSignatures.js";
export async function verifyInputProof(fhevm, parameters) {
    const coprocessorSignedParams = parameters.coprocessorSignedParams ??
        parameters.inputProof.coprocessorSignedParams;
    if (coprocessorSignedParams === undefined) {
        throw new InputProofError({
            message: "Missing coprocessorSignedParams argument.",
        });
    }
    const chainId = parameters.inputProof.externalHandles[0].chainId;
    await verifyHandlesCoprocessorSignatures(fhevm, {
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