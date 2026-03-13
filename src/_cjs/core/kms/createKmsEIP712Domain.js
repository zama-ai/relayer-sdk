"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKmsEIP712Domain = createKmsEIP712Domain;
exports.assertIsKmsEIP712Domain = assertIsKmsEIP712Domain;
const address_js_1 = require("../base/address.js");
const string_js_1 = require("../base/string.js");
const uint_js_1 = require("../base/uint.js");
function createKmsEIP712Domain({ chainId, verifyingContractAddressDecryption, }) {
    (0, uint_js_1.assertIsUint64)(chainId, {});
    (0, address_js_1.assertIsAddress)(verifyingContractAddressDecryption, {});
    const domain = {
        name: "Decryption",
        version: "1",
        chainId: BigInt(chainId),
        verifyingContract: (0, address_js_1.addressToChecksummedAddress)(verifyingContractAddressDecryption),
    };
    Object.freeze(domain);
    return domain;
}
function assertIsKmsEIP712Domain(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "name", name, {
        expectedValue: "Decryption",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "version", name, {
        expectedValue: "1",
        ...options,
    });
    (0, uint_js_1.assertRecordUintBigIntProperty)(value, "chainId", name, options);
    (0, address_js_1.assertRecordChecksummedAddressProperty)(value, "verifyingContract", name, options);
}
//# sourceMappingURL=createKmsEIP712Domain.js.map