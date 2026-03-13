import type { FhevmUserDecryptionPermit } from "../types/fhevmUserDecryptionPermit.js";
import type { KmsUserDecryptEIP712 } from "../types/kms.js";
import type { Bytes65Hex, ChecksummedAddress } from "../types/primitives.js";
type VerifiedUserDecryptionPermit = FhevmUserDecryptionPermit & {
    readonly verified: true;
};
export declare function isVerifiedUserDecryptionPermit(value: unknown): value is VerifiedUserDecryptionPermit;
export declare function createFhevmUserDecryptionPermit(parameters: {
    readonly signerAddress: ChecksummedAddress;
    readonly eip712: KmsUserDecryptEIP712;
    readonly signature: Bytes65Hex;
}): VerifiedUserDecryptionPermit;
export {};
//# sourceMappingURL=FhevmUserDecryptionPermit-p.d.ts.map