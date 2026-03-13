import type { RelayerFetchOptions } from "../../modules/relayer/types.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { WithEncryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParams } from "../../types/globalFhePkeParams.js";
import type { VerifiedInputProof } from "../../types/inputProof.js";
import type { BytesHex, TypedValueLike } from "../../types/primitives.js";
export type EncryptParameters = {
    readonly globalFhePublicEncryptionParams: GlobalFhePkeParams;
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly values: readonly TypedValueLike[];
    readonly extraData: BytesHex;
    readonly options?: RelayerFetchOptions;
};
export type EncryptReturnType = VerifiedInputProof;
export declare function encrypt(fhevm: Fhevm<FhevmChain, WithEncryptAndRelayer>, parameters: EncryptParameters): Promise<EncryptReturnType>;
//# sourceMappingURL=encrypt.d.ts.map