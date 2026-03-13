"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyKmsPublicDecryptEIP712 = verifyKmsPublicDecryptEIP712;
const KmsSignersContext_p_js_1 = require("../../../host-contracts/KmsSignersContext-p.js");
const createKmsEIP712Domain_js_1 = require("../../../kms/createKmsEIP712Domain.js");
const kmsPublicDecryptEIP712Types_js_1 = require("../../../kms/kmsPublicDecryptEIP712Types.js");
const recoverSigners_js_1 = require("../../runtime/recoverSigners.js");
const readKmsSignersContext_js_1 = require("../readKmsSignersContext.js");
async function verifyKmsPublicDecryptEIP712(fhevm, parameters) {
    const handlesBytes32Hex = parameters.orderedHandles.map((h) => h.bytes32Hex);
    const message = {
        ctHandles: handlesBytes32Hex,
        decryptedResult: parameters.orderedAbiEncodedClearValues,
        extraData: parameters.extraData,
    };
    const domain = (0, createKmsEIP712Domain_js_1.createKmsEIP712Domain)({
        chainId: fhevm.chain.fhevm.gateway.id,
        verifyingContractAddressDecryption: fhevm.chain.fhevm.gateway.contracts.decryption.address,
    });
    const recoveredAddresses = await (0, recoverSigners_js_1.recoverSigners)(fhevm, {
        domain,
        types: kmsPublicDecryptEIP712Types_js_1.kmsPublicDecryptEIP712Types,
        primaryType: "PublicDecryptVerification",
        signatures: parameters.kmsPublicDecryptEIP712Signatures,
        message,
    });
    const kmsSignersContext = await (0, readKmsSignersContext_js_1.readKmsSignersContext)(fhevm);
    (0, KmsSignersContext_p_js_1.assertKmsSignerThreshold)(kmsSignersContext, recoveredAddresses);
}
//# sourceMappingURL=verifyKmsPublicDecryptEIP712.js.map