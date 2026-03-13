import type { FhevmHandleLike } from "../types/fhevmHandle.js";
import type { KmsPublicDecryptEIP712 } from "../types/kms.js";
export type CreateKmsPublicDecryptEIP712Parameters = {
    readonly verifyingContractAddressDecryption: string;
    readonly chainId: number | bigint;
    readonly handles: readonly FhevmHandleLike[];
    readonly decryptedResult: string;
    readonly extraData: string;
};
export declare function createKmsPublicDecryptEIP712({ verifyingContractAddressDecryption, chainId, handles, decryptedResult, extraData, }: CreateKmsPublicDecryptEIP712Parameters): KmsPublicDecryptEIP712;
//# sourceMappingURL=createKmsPublicDecryptEIP712.d.ts.map