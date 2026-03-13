"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyKmsUserDecryptEIP712 = verifyKmsUserDecryptEIP712;
const SignersError_js_1 = require("../../errors/SignersError.js");
const createKmsEIP712Domain_js_1 = require("../../kms/createKmsEIP712Domain.js");
const kmsUserDecryptEIP712Types_js_1 = require("../../kms/kmsUserDecryptEIP712Types.js");
const recoverSigners_js_1 = require("../runtime/recoverSigners.js");
async function verifyKmsUserDecryptEIP712(fhevm, parameters) {
    const domain = (0, createKmsEIP712Domain_js_1.createKmsEIP712Domain)({
        chainId: fhevm.chain.id,
        verifyingContractAddressDecryption: fhevm.chain.fhevm.gateway.contracts.decryption.address,
    });
    const recoveredAddresses = await (0, recoverSigners_js_1.recoverSigners)(fhevm, {
        domain,
        types: kmsUserDecryptEIP712Types_js_1.kmsUserDecryptEIP712Types,
        primaryType: "UserDecryptRequestVerification",
        signatures: [parameters.signature],
        message: parameters.message,
    });
    if (recoveredAddresses.length !== 1) {
        throw new SignersError_js_1.ThresholdSignerError({
            type: "kms",
        });
    }
    if (recoveredAddresses[0] !== parameters.signer) {
        throw new SignersError_js_1.UnknownSignerError({
            unknownAddress: recoveredAddresses[0],
            type: "kms",
        });
    }
}
//# sourceMappingURL=verifyKmsUserDecryptEIP712.js.map