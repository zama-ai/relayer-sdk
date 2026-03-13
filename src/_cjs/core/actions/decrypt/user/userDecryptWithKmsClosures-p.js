"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDecryptWithKmsClosures = userDecryptWithKmsClosures;
const fetchKmsSignedcryptedShares_js_1 = require("./fetchKmsSignedcryptedShares.js");
async function userDecryptWithKmsClosures(fhevm, parameters) {
    const { getTkmsPublicKeyHex, decryptAndReconstruct, ...rest } = parameters;
    const tkmsPublicKeyHex = await getTkmsPublicKeyHex();
    if (tkmsPublicKeyHex !== parameters.userDecryptEIP712Message.publicKey) {
        throw new Error("");
    }
    const kmsSigncryptedShares = await (0, fetchKmsSignedcryptedShares_js_1.fetchKmsSignedcryptedShares)(fhevm, rest);
    const orderedDecryptedHandles = await decryptAndReconstruct({
        shares: kmsSigncryptedShares,
    });
    return orderedDecryptedHandles;
}
//# sourceMappingURL=userDecryptWithKmsClosures-p.js.map