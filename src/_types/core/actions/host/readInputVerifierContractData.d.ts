import type { InputVerifierContractData } from "../../types/coprocessor.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type ReadInputVerifierContractDataParameters = {
    readonly address: ChecksummedAddress;
};
export type ReadInputVerifierContractDataReturnType = InputVerifierContractData;
export declare function readInputVerifierContractData(fhevm: Fhevm, parameters: ReadInputVerifierContractDataParameters): Promise<InputVerifierContractData>;
//# sourceMappingURL=readInputVerifierContractData.d.ts.map