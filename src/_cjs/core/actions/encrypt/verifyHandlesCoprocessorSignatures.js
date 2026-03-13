"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyHandlesCoprocessorSignatures = verifyHandlesCoprocessorSignatures;
const coprocessorEIP712Types_js_1 = require("../../coprocessor/coprocessorEIP712Types.js");
const createCoprocessorEIP712Domain_js_1 = require("../../coprocessor/createCoprocessorEIP712Domain.js");
const CoprocessorSignersContext_p_js_1 = require("../../host-contracts/CoprocessorSignersContext-p.js");
const recoverSigners_js_1 = require("../runtime/recoverSigners.js");
const readCoprocessorSignersContext_js_1 = require("./readCoprocessorSignersContext.js");
async function verifyHandlesCoprocessorSignatures(fhevm, parameters) {
    const handlesBytes32 = parameters.handles.map((h) => h.bytes32);
    const message = {
        ctHandles: handlesBytes32,
        userAddress: parameters.userAddress,
        contractAddress: parameters.contractAddress,
        contractChainId: parameters.chainId,
        extraData: parameters.extraData,
    };
    const domain = (0, createCoprocessorEIP712Domain_js_1.createCoprocessorEIP712Domain)({
        gatewayChainId: fhevm.chain.fhevm.gateway.id,
        verifyingContractAddressInputVerification: fhevm.chain.fhevm.gateway.contracts.inputVerification.address,
    });
    const recoveredAddresses = await (0, recoverSigners_js_1.recoverSigners)(fhevm, {
        domain,
        primaryType: coprocessorEIP712Types_js_1.coprocessorEIP712PrimaryType,
        types: coprocessorEIP712Types_js_1.coprocessorEIP712Types,
        signatures: parameters.coprocessorSignatures,
        message,
    });
    const coprocessorSignersContext = await (0, readCoprocessorSignersContext_js_1.readCoprocessorSignersContext)(fhevm);
    (0, CoprocessorSignersContext_p_js_1.assertCoprocessorSignerThreshold)(coprocessorSignersContext, recoveredAddresses);
}
//# sourceMappingURL=verifyHandlesCoprocessorSignatures.js.map