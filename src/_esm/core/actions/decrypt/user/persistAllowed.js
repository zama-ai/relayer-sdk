import { assertIsChecksummedAddress } from "../../../base/address.js";
import { executeWithBatching } from "../../../base/promise.js";
import { assertIsFhevmHandleLike, toFhevmHandle, } from "../../../handle/FhevmHandle.js";
import { persistAllowed as persistAllowed_ } from "../../host/persistAllowed.js";
export async function persistAllowed(fhevm, parameters) {
    const { handleAddressPairs, options } = parameters;
    const isArray = Array.isArray(handleAddressPairs);
    const pairsArray = isArray
        ? handleAddressPairs
        : [handleAddressPairs];
    // By default, always check arguments
    if (options?.checkArguments !== false) {
        for (const p of pairsArray) {
            assertIsFhevmHandleLike(p.handle);
            assertIsChecksummedAddress(p.address, {});
        }
    }
    const rpcCalls = pairsArray.map((p) => () => persistAllowed_(fhevm, {
        address: fhevm.chain.fhevm.contracts.acl.address,
        args: {
            handle: toFhevmHandle(p.handle).bytes32Hex,
            account: p.address,
        },
    }));
    const results = await executeWithBatching(rpcCalls, fhevm.options?.batchRpcCalls);
    return isArray ? results : results[0];
}
//# sourceMappingURL=persistAllowed.js.map