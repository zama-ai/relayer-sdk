import type { DecryptAndReconstructUserModuleFunction, GetTkmsPublicKeyHexUserModuleFunction } from "../../../modules/decrypt/types.js";
import type { RelayerFetchOptions } from "../../../modules/relayer/types.js";
import type { DecryptedFhevmHandle } from "../../../types/decryptedFhevmHandle.js";
import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { KmsUserDecryptEIP712Message } from "../../../types/kms.js";
import type { Bytes65Hex, ChecksummedAddress } from "../../../types/primitives.js";
import type { Prettify } from "../../../types/utils.js";
import type { WithRelayer } from "../../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
type UserDecryptWithKmsClosuresParameters = Prettify<{
    readonly handleContractPairs: ReadonlyArray<{
        readonly handle: FhevmHandle;
        readonly contractAddress: ChecksummedAddress;
    }>;
    readonly userDecryptEIP712Signer: ChecksummedAddress;
    readonly userDecryptEIP712Message: KmsUserDecryptEIP712Message;
    readonly userDecryptEIP712Signature: Bytes65Hex;
    readonly options?: RelayerFetchOptions;
} & GetTkmsPublicKeyHexUserModuleFunction & DecryptAndReconstructUserModuleFunction>;
export type UserDecryptWithKmsClosuresReturnType = readonly DecryptedFhevmHandle[];
export declare function userDecryptWithKmsClosures(fhevm: Fhevm<FhevmChain, WithRelayer>, parameters: UserDecryptWithKmsClosuresParameters): Promise<UserDecryptWithKmsClosuresReturnType>;
export {};
//# sourceMappingURL=userDecryptWithKmsClosures-p.d.ts.map