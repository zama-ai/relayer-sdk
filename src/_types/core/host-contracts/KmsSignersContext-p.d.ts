import type { ChecksummedAddress, Uint8Number } from "../types/primitives.js";
import type { KmsSignersContext } from "../types/kmsSignersContext.js";
import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
export declare function createKmsSignersContext(owner: WeakRef<FhevmRuntime>, parameters: {
    readonly address: ChecksummedAddress;
    readonly kmsSigners: ChecksummedAddress[];
    readonly kmsSignerThreshold: Uint8Number;
}): KmsSignersContext;
/**
 * Verifies that the given `KmsSignersContext` instance is owned
 * by the given runtime. Throws if not.
 */
export declare function assertKmsSignersContextOwnedBy(data: KmsSignersContext, owner: FhevmRuntime): void;
export declare function assertKmsSignerThreshold(kmsSignersContext: KmsSignersContext, recoveredAddresses: readonly string[]): void;
export declare function isKmsSignersContext(value: unknown): value is KmsSignersContext;
export declare function assertIsKmsSignersContext(value: unknown, options: {
    readonly subject?: string;
} & ErrorMetadataParams): asserts value is KmsSignersContext;
//# sourceMappingURL=KmsSignersContext-p.d.ts.map