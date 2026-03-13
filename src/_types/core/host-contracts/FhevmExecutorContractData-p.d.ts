import type { ChecksummedAddress, Uint8Number } from "../types/primitives.js";
import type { FhevmExecutorContractData } from "../types/coprocessor.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
export declare function createFhevmExecutorContractData(owner: WeakRef<FhevmRuntime>, parameters: {
    readonly address: ChecksummedAddress;
    readonly aclContractAddress: ChecksummedAddress;
    readonly inputVerifierContractAddress: ChecksummedAddress;
    readonly hcuLimitContractAddress: ChecksummedAddress;
    readonly handleVersion: Uint8Number;
}): FhevmExecutorContractData;
/**
 * Verifies that the given `FHEVMExecutorContractData` instance is owned
 * by the given runtime. Throws if not.
 */
export declare function assertFHEVMExecutorContractDataOwnedBy(data: FhevmExecutorContractData, owner: FhevmRuntime): void;
//# sourceMappingURL=FhevmExecutorContractData-p.d.ts.map