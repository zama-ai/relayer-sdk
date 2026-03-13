"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUserDecryptionPermit = signUserDecryptionPermit;
const address_js_1 = require("../../base/address.js");
const createKmsUserDecryptEIP712_js_1 = require("../../kms/createKmsUserDecryptEIP712.js");
const FhevmUserDecryptionPermit_p_js_1 = require("../../kms/FhevmUserDecryptionPermit-p.js");
const verifyKmsUserDecryptEIP712_js_1 = require("./verifyKmsUserDecryptEIP712.js");
async function signUserDecryptionPermit(signer, fhevm, parameters) {
    (0, address_js_1.assertIsChecksummedAddress)(parameters.signerAddress, {});
    const eip712 = (0, createKmsUserDecryptEIP712_js_1.createKmsUserDecryptEIP712)(parameters);
    const signature = await signer.signTypedData(eip712);
    await (0, verifyKmsUserDecryptEIP712_js_1.verifyKmsUserDecryptEIP712)(fhevm, {
        signer: parameters.signerAddress,
        message: eip712.message,
        signature,
    });
    return (0, FhevmUserDecryptionPermit_p_js_1.createFhevmUserDecryptionPermit)({
        eip712,
        signature,
        signerAddress: parameters.signerAddress,
    });
}
//# sourceMappingURL=signUserDecryptionPermit.js.map