import { assertIsFhevmHandleLikeArray, toFhevmHandle, } from "../../../handle/FhevmHandle.js";
import { executeWithBatching } from "../../../base/promise.js";
import { isAllowedForDecryption as isAllowedForDecryption_ } from "../../host/isAllowedForDecryption.js";
export async function isAllowedForDecryption(fhevm, parameters) {
    const { handles, options } = parameters;
    const isArray = Array.isArray(handles);
    const handlesArray = isArray ? handles : [handles];
    // By default, always check arguments
    if (options?.checkArguments !== false) {
        assertIsFhevmHandleLikeArray(handlesArray);
    }
    const rpcCalls = handlesArray.map((h) => () => isAllowedForDecryption_(fhevm, {
        address: fhevm.chain.fhevm.contracts.acl.address,
        args: { handle: toFhevmHandle(h).bytes32Hex },
    }));
    const results = await executeWithBatching(rpcCalls, fhevm.options?.batchRpcCalls);
    return isArray ? results : results[0];
}
//# sourceMappingURL=isAllowedForDecryption.js.map