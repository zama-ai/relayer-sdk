import { createInputProofFromComponents } from "../../coprocessor/InputProof-p.js";
import { verifyInputProof } from "./verifyInputProof.js";
export async function createVerifiedInputProofFromComponents(fhevm, parameters) {
    const inputProof = createInputProofFromComponents(parameters);
    return await verifyInputProof(fhevm, { inputProof });
}
//# sourceMappingURL=createVerifiedInputProofFromComponents.js.map