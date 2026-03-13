////////////////////////////////////////////////////////////////////////////////
// verifyZKProofCoprocessorSignatures
////////////////////////////////////////////////////////////////////////////////
import { assertIsZkProof } from "../../coprocessor/ZkProof-p.js";
import { verifyHandlesCoprocessorSignatures } from "./verifyHandlesCoprocessorSignatures.js";
export async function verifyZkProofCoprocessorSignatures(fhevm, parameters) {
    assertIsZkProof(parameters.zkProof, {});
    return verifyHandlesCoprocessorSignatures(fhevm, {
        handles: parameters.zkProof.getFhevmHandles(),
        userAddress: parameters.zkProof.userAddress,
        contractAddress: parameters.zkProof.contractAddress,
        chainId: parameters.zkProof.chainId,
        extraData: parameters.extraData,
        coprocessorSignatures: parameters.coprocessorSignatures,
    });
}
//# sourceMappingURL=verifyZkProofCoprocessorSignatures.js.map