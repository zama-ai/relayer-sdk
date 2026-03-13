import type { FhevmHandle } from "../types/fhevmHandle.js";
import type { UintNumber } from "../types/primitives.js";
/**
 * Asserts that the total encrypted bits across the given handles does not
 * exceed the maximum number of bits the KMS is able to decrypt in a single call.
 *
 * @param fhevmHandles - Handles to sum encrypted bits for
 * @returns The total encrypted bits across all handles
 * @throws {Error} If the total exceeds the limit
 */
export declare function assertKmsDecryptionBitLimit(fhevmHandles: readonly FhevmHandle[]): UintNumber;
export declare function assertKmsEIP712DeadlineValidity({ startTimestamp, durationDays, }: {
    startTimestamp: bigint | number | string;
    durationDays: bigint | number | string;
}, maxDurationDays: UintNumber): void;
//# sourceMappingURL=utils.d.ts.map