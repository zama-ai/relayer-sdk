import { encryptActions } from "./decorators/encrypt.js";
import { createCoreFhevm, extendCoreFhevm, } from "../runtime/CoreFhevm-p.js";
import { globalFhePkeActions, } from "./decorators/globalFhePke.js";
export function createFhevmEncryptClient(ownerToken, parameters) {
    const c = createCoreFhevm(ownerToken, parameters);
    const cEnc = extendCoreFhevm(c, encryptActions);
    return extendCoreFhevm(cEnc, globalFhePkeActions);
}
//# sourceMappingURL=fhevmEncryptClient.js.map