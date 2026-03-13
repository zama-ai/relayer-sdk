import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { Bytes65Hex, BytesHex } from "../../types/primitives.js";
import type { ZkProof } from "../../types/zkProof.js";
export type VerifyZkProofCoprocessorSignaturesParameters = {
    readonly zkProof: ZkProof;
    readonly coprocessorSignatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
};
export declare function verifyZkProofCoprocessorSignatures(fhevm: Fhevm<FhevmChain>, parameters: VerifyZkProofCoprocessorSignaturesParameters): Promise<void>;
//# sourceMappingURL=verifyZkProofCoprocessorSignatures.d.ts.map