import type { KmsUserDecryptEIP712 } from "../types/kms.js";
export type CreateKmsUserDecryptEIP712Parameters = {
    readonly verifyingContractAddressDecryption: string;
    readonly chainId: number | bigint;
    readonly publicKey: string | Uint8Array;
    readonly contractAddresses: readonly string[];
    readonly startTimestamp: number;
    readonly durationDays: number;
    readonly extraData: string;
};
export declare function createKmsUserDecryptEIP712({ verifyingContractAddressDecryption, chainId, publicKey, contractAddresses, startTimestamp, durationDays, extraData, }: CreateKmsUserDecryptEIP712Parameters): KmsUserDecryptEIP712;
//# sourceMappingURL=createKmsUserDecryptEIP712.d.ts.map