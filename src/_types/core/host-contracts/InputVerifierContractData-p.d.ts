import type { ChecksummedAddress, Uint8Number } from "../types/primitives.js";
import type { CoprocessorEIP712Domain, InputVerifierContractData } from "../types/coprocessor.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
export declare function createInputVerifierContractData(owner: WeakRef<FhevmRuntime>, parameters: {
    readonly address: ChecksummedAddress;
    readonly eip712Domain: CoprocessorEIP712Domain;
    readonly coprocessorSigners: ChecksummedAddress[];
    readonly coprocessorSignerThreshold: Uint8Number;
}): InputVerifierContractData;
/**
 * Verifies that the given `InputVerifierContractData` instance is owned
 * by the given runtime. Throws if not.
 */
export declare function assertInputVerifierContractDataOwnedBy(data: InputVerifierContractData, owner: FhevmRuntime): void;
//# sourceMappingURL=InputVerifierContractData-p.d.ts.map