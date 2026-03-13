import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { VerifiedInputProof } from "../../types/inputProof.js";
import type { Bytes, ChecksummedAddress } from "../../types/primitives.js";
export type CreateVerifiedInputProofFromRawBytesParameters = {
    readonly inputProofBytes: Bytes;
    readonly coprocessorSignedParams: {
        readonly userAddress: ChecksummedAddress;
        readonly contractAddress: ChecksummedAddress;
    };
};
export type CreateVerifiedInputProofFromRawBytesReturnType = VerifiedInputProof;
export declare function createVerifiedInputProofFromRawBytes(fhevm: Fhevm<FhevmChain>, parameters: CreateVerifiedInputProofFromRawBytesParameters): Promise<CreateVerifiedInputProofFromRawBytesReturnType>;
//# sourceMappingURL=createVerifiedInputProofFromRawBytes.d.ts.map