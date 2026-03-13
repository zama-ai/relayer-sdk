import { encryptActions } from "./decorators/encrypt.js";
import { globalFhePkeActions, } from "./decorators/globalFhePke.js";
import { decryptActions } from "./decorators/decrypt.js";
import { createCoreFhevm, extendCoreFhevm, } from "../runtime/CoreFhevm-p.js";
export function createFhevmClient(ownerToken, parameters) {
    const c = createCoreFhevm(ownerToken, parameters);
    const cEnc = extendCoreFhevm(c, encryptActions);
    const cDec = extendCoreFhevm(cEnc, decryptActions);
    return extendCoreFhevm(cDec, globalFhePkeActions);
}
//# sourceMappingURL=fhevmClient.js.map