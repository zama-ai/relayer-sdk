import { type PublicDecryptParameters, type PublicDecryptReturnType } from "../../actions/decrypt/public/publicDecrypt.js";
import { type UserDecryptParameters, type UserDecryptReturnType } from "../../actions/decrypt/user/userDecrypt.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { WithDecryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
export type DecryptActions = {
    readonly publicDecrypt: (parameters: PublicDecryptParameters) => Promise<PublicDecryptReturnType>;
    readonly userDecrypt: (parameters: UserDecryptParameters) => Promise<UserDecryptReturnType>;
};
export declare function decryptActions(fhevm: Fhevm<FhevmChain, WithDecryptAndRelayer>): DecryptActions;
//# sourceMappingURL=decrypt.d.ts.map