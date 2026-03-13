import type { FhevmExecutorContractData, InputVerifierContractData } from "../../types/coprocessor.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { KmsVerifierContractData } from "../../types/kms.js";
import type { ChecksummedAddress, Uint64BigInt } from "../../types/primitives.js";
type OptionalChainContract = {
    readonly address?: string;
};
export type ResolveFhevmConfigParameters = {
    readonly id?: number | bigint | undefined;
    readonly fhevm: {
        readonly contracts: {
            readonly acl?: OptionalChainContract | undefined;
            readonly fhevmExecutor?: OptionalChainContract | undefined;
            readonly hcuLimit?: OptionalChainContract | undefined;
            readonly inputVerifier?: OptionalChainContract | undefined;
            readonly kmsVerifier: {
                readonly address: string;
            };
        };
        readonly gateway?: {
            readonly id?: number | bigint | undefined;
            readonly contracts?: {
                readonly decryption?: OptionalChainContract | undefined;
                readonly inputVerification?: OptionalChainContract | undefined;
            } | undefined;
        } | undefined;
    };
};
export type ResolveFhevmConfigReturnType = {
    readonly id: Uint64BigInt;
    readonly acl: ChecksummedAddress;
    readonly fhevmExecutor: FhevmExecutorContractData;
    readonly inputVerifier: InputVerifierContractData;
    readonly kmsVerifier: KmsVerifierContractData;
};
export declare function resolveFhevmConfig(fhevm: Fhevm, parameters: ResolveFhevmConfigParameters): Promise<ResolveFhevmConfigReturnType>;
export {};
//# sourceMappingURL=resolveFhevmConfig.d.ts.map