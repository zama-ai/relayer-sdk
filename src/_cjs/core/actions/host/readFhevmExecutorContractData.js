"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFhevmExecutorContractData = readFhevmExecutorContractData;
const address_js_1 = require("../../base/address.js");
const promise_js_1 = require("../../base/promise.js");
const uint_js_1 = require("../../base/uint.js");
const FhevmExecutorContractData_p_js_1 = require("../../host-contracts/FhevmExecutorContractData-p.js");
const getACLAddress_js_1 = require("./getACLAddress.js");
const getHandleVersion_js_1 = require("./getHandleVersion.js");
const getHCULimitAddress_js_1 = require("./getHCULimitAddress.js");
const getInputVerifierAddress_js_1 = require("./getInputVerifierAddress.js");
async function readFhevmExecutorContractData(fhevm, parameters) {
    const fhevmExecutorContractAddress = parameters.address;
    const rpcCalls = [
        () => (0, getACLAddress_js_1.getACLAddress)(fhevm, parameters),
        () => (0, getHCULimitAddress_js_1.getHCULimitAddress)(fhevm, parameters),
        () => (0, getInputVerifierAddress_js_1.getInputVerifierAddress)(fhevm, parameters),
        () => (0, getHandleVersion_js_1.getHandleVersion)(fhevm, parameters),
    ];
    const res = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    const aclContractAddress = res[0];
    const hcuLimitContractAddress = res[1];
    const inputVerifierContractAddress = res[2];
    const handleVersion = res[3];
    if (!(0, uint_js_1.isUint8)(handleVersion)) {
        throw new Error(`Invalid handle version.`);
    }
    (0, address_js_1.assertIsChecksummedAddress)(aclContractAddress, {});
    (0, address_js_1.assertIsChecksummedAddress)(hcuLimitContractAddress, {});
    (0, address_js_1.assertIsChecksummedAddress)(inputVerifierContractAddress, {});
    const data = (0, FhevmExecutorContractData_p_js_1.createFhevmExecutorContractData)(new WeakRef(fhevm.runtime), {
        address: fhevmExecutorContractAddress,
        aclContractAddress,
        inputVerifierContractAddress,
        hcuLimitContractAddress,
        handleVersion: Number(handleVersion),
    });
    return data;
}
//# sourceMappingURL=readFhevmExecutorContractData.js.map