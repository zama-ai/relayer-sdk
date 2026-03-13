import type { ChecksummedAddress, Uint8Number } from "../types/primitives.js";
import type { CoprocessorSignersContext } from "../types/coprocessorSignersContext.js";
import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
export declare function createCoprocessorSignersContext(owner: WeakRef<FhevmRuntime>, parameters: {
    readonly address: ChecksummedAddress;
    readonly coprocessorSigners: readonly ChecksummedAddress[];
    readonly coprocessorSignerThreshold: Uint8Number;
}): CoprocessorSignersContext;
/**
 * Verifies that the given `CoprocessorSignersContext` instance was created
 * by the given runtime. Throws if not.
 */
export declare function assertCoprocessorSignersContextOwnedBy(data: CoprocessorSignersContext, owner: FhevmRuntime): void;
export declare function assertCoprocessorSignerThreshold(coprocessorSignersContext: CoprocessorSignersContext, recoveredAddresses: readonly string[]): void;
export declare function isCoprocessorSignersContext(value: unknown): value is CoprocessorSignersContext;
export declare function assertIsCoprocessorSignersContext(value: unknown, options: {
    readonly subject?: string;
} & ErrorMetadataParams): asserts value is CoprocessorSignersContext;
//# sourceMappingURL=CoprocessorSignersContext-p.d.ts.map