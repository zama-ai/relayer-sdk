"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCoprocessorSignersContext = readCoprocessorSignersContext;
const address_js_1 = require("../../base/address.js");
const promise_js_1 = require("../../base/promise.js");
const uint_js_1 = require("../../base/uint.js");
const CoprocessorSignersContext_p_js_1 = require("../../host-contracts/CoprocessorSignersContext-p.js");
const getCoprocessorSigners_js_1 = require("../host/getCoprocessorSigners.js");
const getThreshold_js_1 = require("../host/getThreshold.js");
async function readCoprocessorSignersContext(fhevm) {
    const inputVerifierContractAddress = fhevm.chain.fhevm.contracts.inputVerifier
        .address;
    const rpcCalls = [
        () => (0, getThreshold_js_1.getThreshold)(fhevm, {
            address: inputVerifierContractAddress,
        }),
        () => (0, getCoprocessorSigners_js_1.getCoprocessorSigners)(fhevm, {
            address: inputVerifierContractAddress,
        }),
    ];
    const res = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    const threshold = res[0];
    const coprocessorSigners = res[1];
    if (!(0, uint_js_1.isUint8)(threshold)) {
        throw new Error(`Invalid InputVerifier coprocessor signers threshold.`);
    }
    try {
        (0, address_js_1.assertIsChecksummedAddressArray)(coprocessorSigners, {});
    }
    catch (e) {
        throw new Error(`Invalid InputVerifier coprocessor signers addresses.`, {
            cause: e,
        });
    }
    const data = (0, CoprocessorSignersContext_p_js_1.createCoprocessorSignersContext)(new WeakRef(fhevm.runtime), {
        address: inputVerifierContractAddress,
        coprocessorSigners,
        coprocessorSignerThreshold: (0, uint_js_1.asUint8Number)(Number(threshold)),
    });
    return data;
}
//# sourceMappingURL=readCoprocessorSignersContext.js.map