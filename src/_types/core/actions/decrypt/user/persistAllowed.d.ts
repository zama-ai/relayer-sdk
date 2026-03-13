import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { FhevmHandleLike } from "../../../types/fhevmHandle.js";
import type { ChecksummedAddress } from "../../../types/primitives.js";
type HandleAddressPair = {
    readonly address: ChecksummedAddress;
    readonly handle: FhevmHandleLike;
};
export type PersistAllowedArrayParameters = {
    readonly handleAddressPairs: readonly HandleAddressPair[];
    readonly options?: {
        readonly checkArguments?: boolean;
    } | undefined;
};
export type PersistAllowedArrayReturnType = boolean[];
export type PersistAllowedSingleParameters = {
    readonly handleAddressPairs: HandleAddressPair;
    readonly options?: {
        readonly checkArguments?: boolean;
    } | undefined;
};
export type PersistAllowedSingleReturnType = boolean;
/**
 * Returns whether account is allowed to decrypt handle.
 *
 * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
 * @throws A {@link ChecksummedAddressError} If checkArguments is true and any address is not a valid checksummed address
 */
export declare function persistAllowed(fhevm: Fhevm<FhevmChain>, parameters: PersistAllowedArrayParameters): Promise<PersistAllowedArrayReturnType>;
export declare function persistAllowed(fhevm: Fhevm<FhevmChain>, parameters: PersistAllowedSingleParameters): Promise<PersistAllowedSingleReturnType>;
export {};
//# sourceMappingURL=persistAllowed.d.ts.map