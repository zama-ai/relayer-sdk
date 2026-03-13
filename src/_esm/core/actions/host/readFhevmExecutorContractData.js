import { assertIsChecksummedAddress } from "../../base/address.js";
import { executeWithBatching } from "../../base/promise.js";
import { isUint8 } from "../../base/uint.js";
import { createFhevmExecutorContractData } from "../../host-contracts/FhevmExecutorContractData-p.js";
import { getACLAddress } from "./getACLAddress.js";
import { getHandleVersion } from "./getHandleVersion.js";
import { getHCULimitAddress } from "./getHCULimitAddress.js";
import { getInputVerifierAddress } from "./getInputVerifierAddress.js";
export async function readFhevmExecutorContractData(fhevm, parameters) {
    const fhevmExecutorContractAddress = parameters.address;
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
        () => getACLAddress(fhevm, parameters),
        () => getHCULimitAddress(fhevm, parameters),
        () => getInputVerifierAddress(fhevm, parameters),
        () => getHandleVersion(fhevm, parameters),
    ];
    const res = await executeWithBatching(rpcCalls, fhevm.options?.batchRpcCalls);
    const aclContractAddress = res[0];
    const hcuLimitContractAddress = res[1];
    const inputVerifierContractAddress = res[2];
    const handleVersion = res[3];
    if (!isUint8(handleVersion)) {
        throw new Error(`Invalid handle version.`);
    }
    assertIsChecksummedAddress(aclContractAddress, {});
    assertIsChecksummedAddress(hcuLimitContractAddress, {});
    assertIsChecksummedAddress(inputVerifierContractAddress, {});
    const data = createFhevmExecutorContractData(new WeakRef(fhevm.runtime), {
        address: fhevmExecutorContractAddress,
        aclContractAddress,
        inputVerifierContractAddress,
        hcuLimitContractAddress,
        handleVersion: Number(handleVersion),
    });
    return data;
}
//# sourceMappingURL=readFhevmExecutorContractData.js.map