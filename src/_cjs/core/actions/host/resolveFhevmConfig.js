"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFhevmConfig = resolveFhevmConfig;
const address_js_1 = require("../../base/address.js");
const promise_js_1 = require("../../base/promise.js");
const getFHEVMExecutorAddress_js_1 = require("./getFHEVMExecutorAddress.js");
const readFhevmExecutorContractData_js_1 = require("./readFhevmExecutorContractData.js");
const readInputVerifierContractData_js_1 = require("./readInputVerifierContractData.js");
const readKmsVerifierContractData_js_1 = require("./readKmsVerifierContractData.js");
const resolveChainId_js_1 = require("./resolveChainId.js");
async function resolveFhevmConfig(fhevm, parameters) {
    const kmsVerifierAddress = parameters.fhevm.contracts.kmsVerifier.address;
    (0, address_js_1.assertIsAddress)(kmsVerifierAddress, {});
    const id = await (0, resolveChainId_js_1.resolveChainId)(fhevm, parameters);
    const fhevmExecutorData = await _resolveFhevmExecutor(fhevm, parameters.fhevm.contracts);
    _assertOptionalAddressMatch(parameters.fhevm.contracts.inputVerifier?.address, fhevmExecutorData.inputVerifierContractAddress, "InputVerifier");
    _assertOptionalAddressMatch(parameters.fhevm.contracts.hcuLimit?.address, fhevmExecutorData.hcuLimitContractAddress, "HCULimit");
    const rpcCalls = [
        () => (0, readInputVerifierContractData_js_1.readInputVerifierContractData)(fhevm, {
            address: fhevmExecutorData.inputVerifierContractAddress,
        }),
        () => (0, readKmsVerifierContractData_js_1.readKmsVerifierContractData)(fhevm, {
            address: (0, address_js_1.addressToChecksummedAddress)(kmsVerifierAddress),
        }),
    ];
    const res = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    const inputVerifierData = res[0];
    const kmsVerifierData = res[1];
    _assertOptionalAddressMatch(parameters.fhevm.gateway?.contracts?.decryption?.address, kmsVerifierData.eip712Domain.verifyingContract, "verifyingContractAddressDecryption");
    _assertOptionalAddressMatch(parameters.fhevm.gateway?.contracts?.inputVerification?.address, inputVerifierData.eip712Domain.verifyingContract, "verifyingContractAddressInputVerification");
    _assertOptionalNumericMatch(inputVerifierData.eip712Domain.chainId, kmsVerifierData.eip712Domain.chainId, "gatewayChainId");
    _assertOptionalNumericMatch(parameters.fhevm.gateway?.id, inputVerifierData.eip712Domain.chainId, "gatewayChainId");
    const returnValue = {
        id,
        acl: fhevmExecutorData.aclContractAddress,
        fhevmExecutor: fhevmExecutorData,
        inputVerifier: inputVerifierData,
        kmsVerifier: kmsVerifierData,
    };
    return Object.freeze(returnValue);
}
async function _resolveFhevmExecutor(fhevm, parameters) {
    const acl = parameters.acl?.address;
    const fhevmExecutor = parameters.fhevmExecutor?.address;
    if (acl !== undefined) {
        (0, address_js_1.assertIsAddress)(acl, {});
    }
    if (fhevmExecutor !== undefined) {
        (0, address_js_1.assertIsAddress)(fhevmExecutor, {});
    }
    let address;
    if (acl !== undefined) {
        const aclFhevmExecutor = await (0, getFHEVMExecutorAddress_js_1.getFHEVMExecutorAddress)(fhevm, {
            address: (0, address_js_1.addressToChecksummedAddress)(acl),
        });
        if (fhevmExecutor !== undefined) {
            if (aclFhevmExecutor !== fhevmExecutor) {
                throw new Error(`FHEVMExecutor address mismatch: ACL reports ${aclFhevmExecutor}, but ${fhevmExecutor} was provided`);
            }
        }
        address = aclFhevmExecutor;
    }
    else {
        if (fhevmExecutor === undefined) {
            throw new Error("Cannot resolve: either acl or fhevmExecutor address must be provided");
        }
        address = (0, address_js_1.addressToChecksummedAddress)(fhevmExecutor);
    }
    return await (0, readFhevmExecutorContractData_js_1.readFhevmExecutorContractData)(fhevm, { address });
}
function _assertOptionalAddressMatch(actual, expected, label) {
    if (actual !== undefined) {
        if (actual.toLowerCase() !== expected.toLowerCase()) {
            throw new Error(`${label} address mismatch: expected ${expected}, but ${actual} was provided`);
        }
    }
}
function _assertOptionalNumericMatch(actual, expected, label) {
    if (actual !== undefined) {
        if (BigInt(actual) !== expected) {
            throw new Error(`${label} mismatch: expected ${expected}, but ${actual} was provided`);
        }
    }
}
//# sourceMappingURL=resolveFhevmConfig.js.map