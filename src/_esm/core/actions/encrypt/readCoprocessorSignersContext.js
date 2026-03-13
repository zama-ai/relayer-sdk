import { assertIsChecksummedAddressArray } from "../../base/address.js";
import { executeWithBatching } from "../../base/promise.js";
import { asUint8Number, isUint8 } from "../../base/uint.js";
import { createCoprocessorSignersContext } from "../../host-contracts/CoprocessorSignersContext-p.js";
import { getCoprocessorSigners } from "../host/getCoprocessorSigners.js";
import { getThreshold } from "../host/getThreshold.js";
export async function readCoprocessorSignersContext(fhevm) {
    const inputVerifierContractAddress = fhevm.chain.fhevm.contracts.inputVerifier
        .address;
    ////////////////////////////////////////////////////////////////////////////
    //
    // Important remark:
    // =================
    // Do NOTE USE `Promise.all` here!
    // You may get a server response 500 Internal Server Error
    // "Batch of more than 3 requests are not allowed on free tier, to use this
    // feature register paid account at drpc.org"
    //
    ////////////////////////////////////////////////////////////////////////////
    const rpcCalls = [
        () => getThreshold(fhevm, {
            address: inputVerifierContractAddress,
        }),
        () => getCoprocessorSigners(fhevm, {
            address: inputVerifierContractAddress,
        }),
    ];
    const res = await executeWithBatching(rpcCalls, fhevm.options?.batchRpcCalls);
    const threshold = res[0];
    const coprocessorSigners = res[1];
    if (!isUint8(threshold)) {
        throw new Error(`Invalid InputVerifier coprocessor signers threshold.`);
    }
    try {
        assertIsChecksummedAddressArray(coprocessorSigners, {});
    }
    catch (e) {
        throw new Error(`Invalid InputVerifier coprocessor signers addresses.`, {
            cause: e,
        });
    }
    // No need to verify args, create class directly
    const data = createCoprocessorSignersContext(new WeakRef(fhevm.runtime), {
        address: inputVerifierContractAddress,
        coprocessorSigners,
        coprocessorSignerThreshold: asUint8Number(Number(threshold)),
    });
    return data;
}
//# sourceMappingURL=readCoprocessorSignersContext.js.map