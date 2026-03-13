import { decryptActions } from "./decorators/decrypt.js";
import { createCoreFhevm, extendCoreFhevm, } from "../runtime/CoreFhevm-p.js";
export function createFhevmDecryptClient(ownerToken, parameters) {
    const c = createCoreFhevm(ownerToken, parameters);
    return extendCoreFhevm(c, decryptActions);
}
//# sourceMappingURL=fhevmDecryptClient.js.map