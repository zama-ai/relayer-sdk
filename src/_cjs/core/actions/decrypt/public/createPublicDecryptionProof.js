"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublicDecryptionProof = createPublicDecryptionProof;
const bytes_js_1 = require("../../../base/bytes.js");
const DecryptedFhevmHandle_js_1 = require("../../../handle/DecryptedFhevmHandle.js");
const FheType_js_1 = require("../../../handle/FheType.js");
const PublicDecryptionProof_p_js_1 = require("../../../kms/PublicDecryptionProof-p.js");
const verifyKmsPublicDecryptEIP712_js_1 = require("./verifyKmsPublicDecryptEIP712.js");
async function createPublicDecryptionProof(fhevm, parameters) {
    await (0, verifyKmsPublicDecryptEIP712_js_1.verifyKmsPublicDecryptEIP712)(fhevm, parameters);
    const { orderedHandles, orderedAbiEncodedClearValues, kmsPublicDecryptEIP712Signatures, extraData, } = parameters;
    const packedNumSigners = fhevm.runtime.ethereum.encodePacked({
        types: ["uint8"],
        values: [kmsPublicDecryptEIP712Signatures.length],
    });
    const packedSignatures = fhevm.runtime.ethereum.encodePacked({
        types: Array(kmsPublicDecryptEIP712Signatures.length).fill("bytes"),
        values: kmsPublicDecryptEIP712Signatures,
    });
    const decryptionProof = (0, bytes_js_1.concatBytesHex)([
        packedNumSigners,
        packedSignatures,
        extraData,
    ]);
    const orderedAbiTypes = orderedHandles.map((h) => h.solidityPrimitiveTypeName);
    const decoded = fhevm.runtime.ethereum.decode({
        types: orderedAbiTypes,
        encodedData: orderedAbiEncodedClearValues,
    });
    if (decoded.length !== orderedHandles.length) {
        throw new Error("Invalid decrypted result.");
    }
    const orderedClearValues = orderedHandles.map((h, index) => (0, FheType_js_1.toDecryptedFheValue)(h.fheType, decoded[index]));
    const originToken = Symbol("asasa");
    const orderedDecryptedFhevmHandles = (0, DecryptedFhevmHandle_js_1.createDecryptedFhevmHandleArray)(orderedHandles, orderedClearValues, originToken);
    const orderedAbiEncodedDecryptedFhevmHandles = (0, DecryptedFhevmHandle_js_1.abiEncodeDecryptedFhevmHandles)(fhevm, {
        orderedHandles: orderedDecryptedFhevmHandles,
    });
    return new PublicDecryptionProof_p_js_1.PublicDecryptionProofImpl({
        decryptionProof: decryptionProof,
        orderedDecryptedHandles: orderedDecryptedFhevmHandles,
        orderedAbiEncodedClearValues: orderedAbiEncodedDecryptedFhevmHandles.abiEncodedClearValues,
        extraData,
    });
}
//# sourceMappingURL=createPublicDecryptionProof.js.map