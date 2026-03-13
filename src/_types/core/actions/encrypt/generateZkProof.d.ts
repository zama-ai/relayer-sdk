import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { WithEncrypt } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParams } from "../../types/globalFhePkeParams.js";
import type { TypedValueLike } from "../../types/primitives.js";
import type { ZkProof } from "../../types/zkProof.js";
export type GenerateZkProofParameters = {
    readonly globalFhePublicEncryptionParams: GlobalFhePkeParams;
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly values: readonly TypedValueLike[];
};
export type GenerateZkProofReturnType = ZkProof;
export declare function generateZkProof(fhevm: Fhevm<FhevmChain, WithEncrypt>, parameters: GenerateZkProofParameters): Promise<GenerateZkProofReturnType>;
//# sourceMappingURL=generateZkProof.d.ts.map