import type { KmsDelegatedUserDecryptEIP712 } from "../types/kms.js";
export type CreateKmsDelegatedUserDecryptEIP712Parameters = {
    readonly verifyingContractAddressDecryption: string;
    readonly chainId: number | bigint;
    readonly publicKey: string | Uint8Array;
    readonly contractAddresses: readonly string[];
    readonly startTimestamp: number;
    readonly durationDays: number;
    readonly extraData: string;
    readonly delegatedAccount: string;
};
export declare function createKmsDelegatedUserDecryptEIP712({ verifyingContractAddressDecryption, chainId, publicKey, contractAddresses, startTimestamp, durationDays, extraData, delegatedAccount, }: CreateKmsDelegatedUserDecryptEIP712Parameters): KmsDelegatedUserDecryptEIP712;
//# sourceMappingURL=createKmsDelegatedUserDecryptEIP712.d.ts.map