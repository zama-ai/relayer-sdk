import type { RelayerFetchOptions } from "../../modules/relayer/types.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { WithRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { VerifiedInputProof } from "../../types/inputProof.js";
import type { BytesHex } from "../../types/primitives.js";
import type { ZkProof } from "../../types/zkProof.js";
export type FetchInputProofParameters = {
    readonly zkProof: ZkProof;
    readonly extraData: BytesHex;
    readonly options?: RelayerFetchOptions;
};
export type FetchInputProofReturnType = VerifiedInputProof;
export declare function fetchVerifiedInputProof(fhevm: Fhevm<FhevmChain, WithRelayer>, parameters: FetchInputProofParameters): Promise<FetchInputProofReturnType>;
//# sourceMappingURL=fetchVerifiedInputProof.d.ts.map