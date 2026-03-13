"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDecrypt = userDecrypt;
const userDecryptWithKmsClosures_p_js_1 = require("./userDecryptWithKmsClosures-p.js");
async function userDecrypt(fhevm, parameters) {
    const { decryptionKey, ...rest } = parameters;
    return await (0, userDecryptWithKmsClosures_p_js_1.userDecryptWithKmsClosures)(fhevm, {
        ...rest,
        decryptAndReconstruct: (args) => decryptionKey.decryptAndReconstruct(args),
        getTkmsPublicKeyHex: () => decryptionKey.getTkmsPublicKeyHex(),
    });
}
//# sourceMappingURL=userDecrypt.js.map