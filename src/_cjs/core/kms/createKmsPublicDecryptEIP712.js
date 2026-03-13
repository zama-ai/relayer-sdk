"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKmsPublicDecryptEIP712 = createKmsPublicDecryptEIP712;
const bytes_js_1 = require("../base/bytes.js");
const FhevmHandle_js_1 = require("../handle/FhevmHandle.js");
const createKmsEIP712Domain_js_1 = require("./createKmsEIP712Domain.js");
const kmsPublicDecryptEIP712Types_js_1 = require("./kmsPublicDecryptEIP712Types.js");
function createKmsPublicDecryptEIP712({ verifyingContractAddressDecryption, chainId, handles, decryptedResult, extraData, }) {
    (0, FhevmHandle_js_1.assertIsFhevmHandleLikeArray)(handles, {});
    (0, bytes_js_1.assertIsBytesHex)(decryptedResult, {});
    (0, bytes_js_1.assertIsBytesHex)(extraData, {});
    const primaryType = "PublicDecryptVerification";
    const domain = (0, createKmsEIP712Domain_js_1.createKmsEIP712Domain)({
        chainId,
        verifyingContractAddressDecryption,
    });
    const eip712 = {
        types: kmsPublicDecryptEIP712Types_js_1.kmsPublicDecryptEIP712Types,
        primaryType,
        domain,
        message: {
            ctHandles: handles.map((h) => {
                return (0, FhevmHandle_js_1.fhevmHandleLikeToFhevmHandle)(h).bytes32Hex;
            }),
            decryptedResult,
            extraData,
        },
    };
    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.PublicDecryptVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.ctHandles);
    return eip712;
}
//# sourceMappingURL=createKmsPublicDecryptEIP712.js.map