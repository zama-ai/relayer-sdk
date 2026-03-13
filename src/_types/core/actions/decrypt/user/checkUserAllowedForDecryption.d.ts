import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { FhevmHandleLike } from "../../../types/fhevmHandle.js";
import type { ChecksummedAddress } from "../../../types/primitives.js";
export type CheckUserAllowedForDecryptionParameters = {
    readonly userAddress: ChecksummedAddress;
    readonly handleContractPairs: {
        readonly contractAddress: ChecksummedAddress;
        readonly handle: FhevmHandleLike;
    } | ReadonlyArray<{
        readonly contractAddress: ChecksummedAddress;
        readonly handle: FhevmHandleLike;
    }>;
    readonly options?: {
        readonly checkArguments?: boolean;
    };
};
/**
 * Verifies that a user is allowed to decrypt handles through specific contracts.
 *
 * For each (handle, contractAddress) pair, checks that:
 * 1. The userAddress has permission to decrypt the handle
 * 2. The contractAddress has permission to decrypt the handle
 * 3. The userAddress is not equal to any contractAddress
 *
 * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
 * @throws A {@link ChecksummedAddressError} If checkArguments is true and any address is not a valid checksummed address
 * @throws A {@link ACLUserDecryptionError} If userAddress equals any contractAddress
 * @throws A {@link ACLUserDecryptionError} If user is not authorized to decrypt any handle
 * @throws A {@link ACLUserDecryptionError} If any contract is not authorized to decrypt its handle
 */
export declare function checkUserAllowedForDecryption(fhevm: Fhevm<FhevmChain>, parameters: CheckUserAllowedForDecryptionParameters): Promise<void>;
//# sourceMappingURL=checkUserAllowedForDecryption.d.ts.map