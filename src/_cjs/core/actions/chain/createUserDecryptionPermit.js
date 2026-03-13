"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserDecryptionPermit = createUserDecryptionPermit;
const FhevmUserDecryptionPermit_p_js_1 = require("../../kms/FhevmUserDecryptionPermit-p.js");
const verifyKmsUserDecryptEIP712_js_1 = require("./verifyKmsUserDecryptEIP712.js");
async function createUserDecryptionPermit(fhevm, parameters) {
    const { signerAddress, signature, eip712 } = parameters;
    await (0, verifyKmsUserDecryptEIP712_js_1.verifyKmsUserDecryptEIP712)(fhevm, {
        signer: signerAddress,
        message: eip712.message,
        signature,
    });
    return (0, FhevmUserDecryptionPermit_p_js_1.createFhevmUserDecryptionPermit)(parameters);
}
//# sourceMappingURL=createUserDecryptionPermit.js.map