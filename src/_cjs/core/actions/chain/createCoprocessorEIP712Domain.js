"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoprocessorEIP712Domain = createCoprocessorEIP712Domain;
const createCoprocessorEIP712Domain_js_1 = require("../../coprocessor/createCoprocessorEIP712Domain.js");
function createCoprocessorEIP712Domain(fhevm) {
    return (0, createCoprocessorEIP712Domain_js_1.createCoprocessorEIP712Domain)({
        gatewayChainId: fhevm.chain.fhevm.gateway.id,
        verifyingContractAddressInputVerification: fhevm.chain.fhevm.gateway.contracts.inputVerification.address,
    });
}
//# sourceMappingURL=createCoprocessorEIP712Domain.js.map