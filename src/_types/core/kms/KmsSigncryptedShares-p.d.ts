import type { KmsSigncryptedSharesMetadata, KmsSigncryptedShare } from "../types/kms-p.js";
import type { KmsSigncryptedShares } from "../types/kms.js";
/**
 * @internal
 */
export declare function createKmsSigncryptedShares(metadata: KmsSigncryptedSharesMetadata, shares: readonly KmsSigncryptedShare[]): KmsSigncryptedShares;
/**
 * @internal
 */
export declare function getShares(signcryptedShares: KmsSigncryptedShares): readonly KmsSigncryptedShare[];
/**
 * @internal
 */
export declare function getMetadata(signcryptedShares: KmsSigncryptedShares): KmsSigncryptedSharesMetadata;
//# sourceMappingURL=KmsSigncryptedShares-p.d.ts.map