import type { FhevmHandleLike } from "../../../types/fhevmHandle.js";
import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
export type IsAllowedForDecryptionArrayParameters = {
    readonly handles: readonly FhevmHandleLike[];
    readonly options?: {
        readonly checkArguments?: boolean;
    } | undefined;
};
export type IsAllowedForDecryptionArrayReturnType = boolean[];
export type IsAllowedForDecryptionSingleParameters = {
    readonly handles: FhevmHandleLike;
    readonly options?: {
        readonly checkArguments?: boolean;
    } | undefined;
};
export type IsAllowedForDecryptionSingleReturnType = boolean;
/**
 * Returns whether each handle is allowed for decryption.
 *
 * @throws A {@link FhevmHandleError} If checkArguments is true and any handle is not a valid Bytes32Hex
 */
export declare function isAllowedForDecryption(fhevm: Fhevm<FhevmChain>, parameters: IsAllowedForDecryptionArrayParameters): Promise<IsAllowedForDecryptionArrayReturnType>;
export declare function isAllowedForDecryption(fhevm: Fhevm<FhevmChain>, parameters: IsAllowedForDecryptionSingleParameters): Promise<IsAllowedForDecryptionSingleReturnType>;
//# sourceMappingURL=isAllowedForDecryption.d.ts.map