"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readKmsSignersContext = readKmsSignersContext;
const address_js_1 = require("../../base/address.js");
const promise_js_1 = require("../../base/promise.js");
const uint_js_1 = require("../../base/uint.js");
const KmsSignersContext_p_js_1 = require("../../host-contracts/KmsSignersContext-p.js");
const getThreshold_js_1 = require("../host/getThreshold.js");
const getKmsSigners_js_1 = require("../host/getKmsSigners.js");
async function readKmsSignersContext(fhevm) {
    const kmsVerifierContractAddress = fhevm.chain.fhevm.contracts.kmsVerifier
        .address;
    const rpcCalls = [
        () => (0, getThreshold_js_1.getThreshold)(fhevm, {
            address: kmsVerifierContractAddress,
        }),
        () => (0, getKmsSigners_js_1.getKmsSigners)(fhevm, {
            address: kmsVerifierContractAddress,
        }),
    ];
    const res = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    const threshold = res[0];
    const kmsSigners = res[1];
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
    const data = (0, KmsSignersContext_p_js_1.createKmsSignersContext)(new WeakRef(fhevm.runtime), {
        address: kmsVerifierContractAddress,
        kmsSigners,
        kmsSignerThreshold: (0, uint_js_1.asUint8Number)(Number(threshold)),
    });
    return data;
}
//# sourceMappingURL=readKmsSignersContext.js.map