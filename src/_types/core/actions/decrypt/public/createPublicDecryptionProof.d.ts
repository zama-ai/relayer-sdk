import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { Bytes65Hex, BytesHex } from "../../../types/primitives.js";
import type { PublicDecryptionProof } from "../../../types/publicDecryptionProof.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
export type CreatePublicDecryptionProofParameters = {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly kmsPublicDecryptEIP712Signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
};
export type CreatePublicDecryptionProofReturnType = PublicDecryptionProof;
export declare function createPublicDecryptionProof(fhevm: Fhevm<FhevmChain>, parameters: CreatePublicDecryptionProofParameters): Promise<CreatePublicDecryptionProofReturnType>;
//# sourceMappingURL=createPublicDecryptionProof.d.ts.map