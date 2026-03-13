"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoprocessorEIP712Domain = createCoprocessorEIP712Domain;
const address_js_1 = require("../base/address.js");
const uint_js_1 = require("../base/uint.js");
function createCoprocessorEIP712Domain({ gatewayChainId, verifyingContractAddressInputVerification, }) {
    (0, uint_js_1.assertIsUint64)(gatewayChainId, {});
    (0, address_js_1.assertIsAddress)(verifyingContractAddressInputVerification, {});
    const domain = {
        name: "InputVerification",
        version: "1",
        chainId: BigInt(gatewayChainId),
        verifyingContract: (0, address_js_1.addressToChecksummedAddress)(verifyingContractAddressInputVerification),
    };
    Object.freeze(domain);
    return domain;
}
//# sourceMappingURL=createCoprocessorEIP712Domain.js.map