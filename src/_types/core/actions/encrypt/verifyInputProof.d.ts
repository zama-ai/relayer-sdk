import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { InputProof, VerifiedInputProof } from "../../types/inputProof.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type VerifyInputProofParameters = {
    readonly inputProof: InputProof;
    readonly coprocessorSignedParams?: {
        readonly userAddress: ChecksummedAddress;
        readonly contractAddress: ChecksummedAddress;
    };
};
export type VerifyInputProofReturnType = VerifiedInputProof;
export declare function verifyInputProof(fhevm: Fhevm<FhevmChain>, parameters: VerifyInputProofParameters): Promise<VerifyInputProofReturnType>;
//# sourceMappingURL=verifyInputProof.d.ts.map