import type { RelayerFetchOptions } from "../../../modules/relayer/types.js";
import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { WithRelayer } from "../../../types/coreFhevmRuntime.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { KmsSigncryptedShares, KmsUserDecryptEIP712Message } from "../../../types/kms.js";
import type { Bytes65Hex, ChecksummedAddress } from "../../../types/primitives.js";
import type { Prettify } from "../../../types/utils.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
type FetchKmsSignedcryptedSharesParameters = Prettify<{
    readonly handleContractPairs: ReadonlyArray<{
        handle: FhevmHandle;
        contractAddress: ChecksummedAddress;
    }>;
    readonly userDecryptEIP712Signer: ChecksummedAddress;
    readonly userDecryptEIP712Message: KmsUserDecryptEIP712Message;
    readonly userDecryptEIP712Signature: Bytes65Hex;
    readonly options?: RelayerFetchOptions;
}>;
export type FetchKmsSignedcryptedSharesReturnType = KmsSigncryptedShares;
export declare function fetchKmsSignedcryptedShares(fhevm: Fhevm<FhevmChain, WithRelayer>, parameters: FetchKmsSignedcryptedSharesParameters): Promise<FetchKmsSignedcryptedSharesReturnType>;
export {};
//# sourceMappingURL=fetchKmsSignedcryptedShares.d.ts.map