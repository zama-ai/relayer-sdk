"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKmsEIP712Domain = createKmsEIP712Domain;
const createKmsEIP712Domain_js_1 = require("../../kms/createKmsEIP712Domain.js");
function createKmsEIP712Domain(fhevm) {
    return (0, createKmsEIP712Domain_js_1.createKmsEIP712Domain)({
        chainId: fhevm.chain.id,
        verifyingContractAddressDecryption: fhevm.chain.fhevm.gateway.contracts.decryption.address,
    });
}
//# sourceMappingURL=createKmsEIP712Domain.js.map