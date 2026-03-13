import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { KmsVerifierContractData } from "../../types/kms.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type ReadKmsVerifierContractDataParameters = {
    readonly address: ChecksummedAddress;
};
export type ReadKmsVerifierContractDataReturnType = KmsVerifierContractData;
export declare function readKmsVerifierContractData(fhevm: Fhevm, parameters: ReadKmsVerifierContractDataParameters): Promise<ReadKmsVerifierContractDataReturnType>;
//# sourceMappingURL=readKmsVerifierContractData.d.ts.map