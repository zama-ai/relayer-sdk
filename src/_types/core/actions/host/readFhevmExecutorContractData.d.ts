import type { FhevmExecutorContractData } from "../../types/coprocessor.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { ChecksummedAddress } from "../../types/primitives.js";
export type ReadFhevmExecutorContractDataParameters = {
    readonly address: ChecksummedAddress;
};
export type ReadFhevmExecutorContractDataReturnType = FhevmExecutorContractData;
export declare function readFhevmExecutorContractData(fhevm: Fhevm, parameters: ReadFhevmExecutorContractDataParameters): Promise<FhevmExecutorContractData>;
//# sourceMappingURL=readFhevmExecutorContractData.d.ts.map