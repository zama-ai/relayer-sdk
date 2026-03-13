import { publicDecrypt, } from "../../actions/decrypt/public/publicDecrypt.js";
import { userDecrypt, } from "../../actions/decrypt/user/userDecrypt.js";
export function decryptActions(fhevm) {
    return {
        publicDecrypt: (parameters) => publicDecrypt(fhevm, parameters),
        userDecrypt: (parameters) => userDecrypt(fhevm, parameters),
    };
}
//# sourceMappingURL=decrypt.js.map