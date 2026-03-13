import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { FhevmHandleLike } from "../../../types/fhevmHandle.js";
export type CheckAllowedForDecryptionParameters = {
    readonly handles: readonly FhevmHandleLike[] | FhevmHandleLike;
    readonly options?: {
        readonly checkArguments?: boolean;
    };
};
/**
 * Throws ACLPublicDecryptionError if any handle is not allowed for decryption.
 *
 * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
 * @throws A {@link ACLPublicDecryptionError} If any handle is not allowed for public decryption
 */
export declare function checkAllowedForDecryption(fhevm: Fhevm<FhevmChain>, parameters: CheckAllowedForDecryptionParameters): Promise<void>;
//# sourceMappingURL=checkAllowedForDecryption.d.ts.map