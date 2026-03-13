"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readInputVerifierContractData = readInputVerifierContractData;
const address_js_1 = require("../../base/address.js");
const promise_js_1 = require("../../base/promise.js");
const uint_js_1 = require("../../base/uint.js");
const assertIsCoprocessorEIP712Domain_js_1 = require("../../coprocessor/assertIsCoprocessorEIP712Domain.js");
const InputVerifierContractData_p_js_1 = require("../../host-contracts/InputVerifierContractData-p.js");
const eip712Domain_js_1 = require("./eip712Domain.js");
const getCoprocessorSigners_js_1 = require("./getCoprocessorSigners.js");
const getThreshold_js_1 = require("./getThreshold.js");
async function readInputVerifierContractData(fhevm, parameters) {
    const inputVerifierContractAddress = parameters.address;
    const rpcCalls = [
        () => (0, eip712Domain_js_1.eip712Domain)(fhevm, parameters),
        () => (0, getThreshold_js_1.getThreshold)(fhevm, parameters),
        () => (0, getCoprocessorSigners_js_1.getCoprocessorSigners)(fhevm, parameters),
    ];
    const res = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    const eip712DomainRes = res[0];
    const threshold = res[1];
    const coprocessorSigners = res[2];
    if (!(0, uint_js_1.isUint8)(threshold)) {
        throw new Error(`Invalid InputVerifier Coprocessor signers threshold.`);
    }
    try {
        (0, address_js_1.assertIsChecksummedAddressArray)(coprocessorSigners, {});
    }
    catch (e) {
        throw new Error(`Invalid InputVerifier Coprocessor signers addresses.`, {
            cause: e,
        });
    }
    try {
        (0, assertIsCoprocessorEIP712Domain_js_1.assertIsCoprocessorEIP712Domain)(eip712DomainRes, "InputVerifier.eip712Domain()", {});
    }
    catch (e) {
        throw new Error(`Invalid InputVerifier EIP-712 domain.`, { cause: e });
    }
    if (eip712DomainRes.verifyingContract.toLowerCase() ===
        inputVerifierContractAddress.toLowerCase()) {
        throw new Error(`Invalid InputVerifier EIP-712 domain. Unexpected verifyingContract.`);
    }
    const data = (0, InputVerifierContractData_p_js_1.createInputVerifierContractData)(new WeakRef(fhevm.runtime), {
        address: inputVerifierContractAddress,
        eip712Domain: eip712DomainRes,
        coprocessorSignerThreshold: (0, uint_js_1.asUint8Number)(Number(threshold)),
        coprocessorSigners,
    });
    return data;
}
//# sourceMappingURL=readInputVerifierContractData.js.map