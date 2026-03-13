"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKmsUserDecryptEIP712 = createKmsUserDecryptEIP712;
const address_js_1 = require("../base/address.js");
const bytes_js_1 = require("../base/bytes.js");
const string_js_1 = require("../base/string.js");
const uint_js_1 = require("../base/uint.js");
const createKmsEIP712Domain_js_1 = require("./createKmsEIP712Domain.js");
const kmsUserDecryptEIP712Types_js_1 = require("./kmsUserDecryptEIP712Types.js");
function createKmsUserDecryptEIP712({ verifyingContractAddressDecryption, chainId, publicKey, contractAddresses, startTimestamp, durationDays, extraData, }) {
    const publicKeyBytesHex = _verifyPublicKeyArg(publicKey);
    (0, uint_js_1.assertIsUint64)(chainId, {});
    (0, address_js_1.assertIsAddress)(verifyingContractAddressDecryption, {});
    (0, address_js_1.assertIsAddressArray)(contractAddresses, {});
    (0, uint_js_1.assertIsUintNumber)(startTimestamp, {});
    (0, uint_js_1.assertIsUintNumber)(durationDays, {});
    (0, bytes_js_1.assertIsBytesHex)(extraData, {});
    const checksummedContractAddresses = contractAddresses.map(address_js_1.addressToChecksummedAddress);
    const primaryType = "UserDecryptRequestVerification";
    const domain = (0, createKmsEIP712Domain_js_1.createKmsEIP712Domain)({
        chainId,
        verifyingContractAddressDecryption,
    });
    const eip712 = {
        domain,
        types: kmsUserDecryptEIP712Types_js_1.kmsUserDecryptEIP712Types,
        primaryType,
        message: {
            publicKey: publicKeyBytesHex,
            contractAddresses: checksummedContractAddresses,
            startTimestamp: startTimestamp.toString(),
            durationDays: durationDays.toString(),
            extraData,
        },
    };
    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.UserDecryptRequestVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.contractAddresses);
    return eip712;
}
function _verifyPublicKeyArg(value) {
    if (value === null || value === undefined) {
        throw new Error(`Missing publicKey argument.`);
    }
    let publicKeyBytesHex;
    const pk = value;
    if (typeof pk === "string") {
        publicKeyBytesHex = (0, bytes_js_1.asBytesHex)((0, string_js_1.ensure0x)(pk));
    }
    else if (pk instanceof Uint8Array) {
        publicKeyBytesHex = (0, bytes_js_1.bytesToHexLarge)(pk);
    }
    else {
        throw new Error(`Invalid publicKey argument.`);
    }
    return publicKeyBytesHex;
}
//# sourceMappingURL=createKmsUserDecryptEIP712.js.map