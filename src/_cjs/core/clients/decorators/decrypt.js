"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptActions = decryptActions;
const publicDecrypt_js_1 = require("../../actions/decrypt/public/publicDecrypt.js");
const userDecrypt_js_1 = require("../../actions/decrypt/user/userDecrypt.js");
function decryptActions(fhevm) {
    return {
        publicDecrypt: (parameters) => (0, publicDecrypt_js_1.publicDecrypt)(fhevm, parameters),
        userDecrypt: (parameters) => (0, userDecrypt_js_1.userDecrypt)(fhevm, parameters),
    };
}
//# sourceMappingURL=decrypt.js.map