"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicDecrypt = publicDecrypt;
const FhevmHandle_js_1 = require("../../../handle/FhevmHandle.js");
const utils_js_1 = require("../../../kms/utils.js");
const checkAllowedForDecryption_js_1 = require("./checkAllowedForDecryption.js");
const createPublicDecryptionProof_js_1 = require("./createPublicDecryptionProof.js");
async function publicDecrypt(fhevm, parameters) {
    const fhevmHandles = parameters.handles;
    if (fhevmHandles.length === 0) {
        throw Error(`handles must not be empty, at least one handle is required`);
    }
    (0, utils_js_1.assertKmsDecryptionBitLimit)(fhevmHandles);
    (0, FhevmHandle_js_1.assertFhevmHandlesBelongToSameChainId)(fhevmHandles, BigInt(fhevm.chain.id));
    await (0, checkAllowedForDecryption_js_1.checkAllowedForDecryption)(fhevm, {
        handles: fhevmHandles,
        options: { checkArguments: true },
    });
    const { orderedAbiEncodedClearValues, kmsPublicDecryptEIP712Signatures } = await fhevm.runtime.relayer.fetchPublicDecrypt({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, {
        payload: {
            orderedHandles: fhevmHandles,
            extraData: parameters.extraData,
        },
        options: parameters.options,
    });
    const signedExtraData = "0x";
    const publicDecryptionProof = await (0, createPublicDecryptionProof_js_1.createPublicDecryptionProof)(fhevm, {
        orderedHandles: fhevmHandles,
        orderedAbiEncodedClearValues,
        kmsPublicDecryptEIP712Signatures,
        extraData: signedExtraData,
    });
    return publicDecryptionProof;
}
//# sourceMappingURL=publicDecrypt.js.map