import type { ChecksummedAddress, Uint8Number } from "../types/primitives.js";
import type { KmsEIP712Domain, KmsVerifierContractData } from "../types/kms.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
export declare function createKmsVerifierContractData(owner: WeakRef<FhevmRuntime>, parameters: {
    readonly address: ChecksummedAddress;
    readonly eip712Domain: KmsEIP712Domain;
    readonly kmsSigners: ChecksummedAddress[];
    readonly kmsSignerThreshold: Uint8Number;
}): KmsVerifierContractData;
/**
 * Verifies that the given `KmsVerifierContractData` instance is owned
 * by the given runtime. Throws if not.
 */
export declare function assertKmsVerifierContractDataOwnedBy(data: KmsVerifierContractData, owner: FhevmRuntime): void;
//# sourceMappingURL=KmsVerifierContractData-p.d.ts.map