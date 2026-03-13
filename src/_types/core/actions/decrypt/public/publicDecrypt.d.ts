import type { RelayerFetchOptions } from "../../../modules/relayer/types.js";
import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { WithRelayer } from "../../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { BytesHex } from "../../../types/primitives.js";
import type { PublicDecryptionProof } from "../../../types/publicDecryptionProof.js";
export type PublicDecryptParameters = {
    readonly handles: readonly FhevmHandle[];
    readonly extraData: BytesHex;
    readonly options?: RelayerFetchOptions;
};
export type PublicDecryptReturnType = PublicDecryptionProof;
export declare function publicDecrypt(fhevm: Fhevm<FhevmChain, WithRelayer>, parameters: PublicDecryptParameters): Promise<PublicDecryptReturnType>;
//# sourceMappingURL=publicDecrypt.d.ts.map