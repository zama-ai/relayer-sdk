import { createInputProofFromRawBytes } from "../../coprocessor/InputProof-p.js";
import { verifyInputProof } from "./verifyInputProof.js";
export async function createVerifiedInputProofFromRawBytes(fhevm, parameters) {
    const inputProof = createInputProofFromRawBytes(parameters);
    return await verifyInputProof(fhevm, { inputProof });
}
//# sourceMappingURL=createVerifiedInputProofFromRawBytes.js.map