"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readKmsVerifierContractData = readKmsVerifierContractData;
const address_js_1 = require("../../base/address.js");
const promise_js_1 = require("../../base/promise.js");
const uint_js_1 = require("../../base/uint.js");
const KmsVerifierContractData_p_js_1 = require("../../host-contracts/KmsVerifierContractData-p.js");
const createKmsEIP712Domain_js_1 = require("../../kms/createKmsEIP712Domain.js");
const eip712Domain_js_1 = require("./eip712Domain.js");
const getKmsSigners_js_1 = require("./getKmsSigners.js");
const getThreshold_js_1 = require("./getThreshold.js");
async function readKmsVerifierContractData(fhevm, parameters) {
    const kmsVerifierContractAddress = parameters.address;
    const rpcCalls = [
        () => (0, eip712Domain_js_1.eip712Domain)(fhevm, parameters),
        () => (0, getThreshold_js_1.getThreshold)(fhevm, parameters),
        () => (0, getKmsSigners_js_1.getKmsSigners)(fhevm, parameters),
    ];
    const res = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    const eip712DomainRes = res[0];
    const threshold = res[1];
    const kmsSigners = res[2];
    if (!(0, uint_js_1.isUint8)(threshold)) {
        throw new Error(`Invalid KMSVerifier kms signers threshold.`);
    }
    try {
        (0, address_js_1.assertIsChecksummedAddressArray)(kmsSigners, {});
    }
    catch (e) {
        throw new Error(`Invalid KMSVerifier kms signers addresses.`, {
            cause: e,
        });
    }
    try {
        (0, createKmsEIP712Domain_js_1.assertIsKmsEIP712Domain)(eip712DomainRes, "KMSVerifier.eip712Domain()", {});
    }
    catch (e) {
        throw new Error(`Invalid KMSVerifier EIP-712 domain.`, { cause: e });
    }
    if (eip712DomainRes.verifyingContract.toLowerCase() ===
        kmsVerifierContractAddress.toLowerCase()) {
        throw new Error(`Invalid KMSVerifier EIP-712 domain. Unexpected verifyingContract.`);
    }
    const data = (0, KmsVerifierContractData_p_js_1.createKmsVerifierContractData)(new WeakRef(fhevm.runtime), {
        address: kmsVerifierContractAddress,
        eip712Domain: eip712DomainRes,
        kmsSignerThreshold: (0, uint_js_1.asUint8Number)(Number(threshold)),
        kmsSigners,
    });
    return data;
}
//# sourceMappingURL=readKmsVerifierContractData.js.map