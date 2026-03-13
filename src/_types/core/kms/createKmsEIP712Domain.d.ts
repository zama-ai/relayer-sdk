import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { KmsEIP712Domain } from "../types/kms.js";
export declare function createKmsEIP712Domain({ chainId, // any chainId could be host or gateway
verifyingContractAddressDecryption, }: {
    chainId: number | bigint;
    verifyingContractAddressDecryption: string;
}): KmsEIP712Domain;
export declare function assertIsKmsEIP712Domain(value: unknown, name: string, options: ErrorMetadataParams): asserts value is KmsEIP712Domain;
//# sourceMappingURL=createKmsEIP712Domain.d.ts.map