import type { FhevmUserDecryptionPermit } from "../../types/fhevmUserDecryptionPermit.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
export type VerifyUserDecryptionPermitParameters = {
    readonly permit: FhevmUserDecryptionPermit;
};
export declare function verifyUserDecryptionPermit(fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>, parameters: VerifyUserDecryptionPermitParameters): Promise<void>;
//# sourceMappingURL=verifyUserDecryptionPermit.d.ts.map