import { assertIsChecksummedAddress } from "../../base/address.js";
import { getFHEVMExecutorAddressAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getFHEVMExecutorAddress(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getFHEVMExecutorAddressAbi,
        args: [],
        functionName: getFHEVMExecutorAddressAbi[0].name,
    });
    try {
        assertIsChecksummedAddress(res, {});
    }
    catch (e) {
        throw new Error(`Invalid FHEVMExecutor address.`, {
            cause: e,
        });
    }
    return res;
}
//# sourceMappingURL=getFHEVMExecutorAddress.js.map