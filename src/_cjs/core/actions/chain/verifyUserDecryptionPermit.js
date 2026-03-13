"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserDecryptionPermit = verifyUserDecryptionPermit;
const verifyKmsUserDecryptEIP712_js_1 = require("./verifyKmsUserDecryptEIP712.js");
const FhevmUserDecryptionPermit_p_js_1 = require("../../kms/FhevmUserDecryptionPermit-p.js");
async function verifyUserDecryptionPermit(fhevm, parameters) {
    const { permit } = parameters;
    if ((0, FhevmUserDecryptionPermit_p_js_1.isVerifiedUserDecryptionPermit)(permit)) {
        return;
    }
    await (0, verifyKmsUserDecryptEIP712_js_1.verifyKmsUserDecryptEIP712)(fhevm, {
        signer: permit.signerAddress,
        message: permit.eip712.message,
        signature: permit.signature,
    });
}
//# sourceMappingURL=verifyUserDecryptionPermit.js.map