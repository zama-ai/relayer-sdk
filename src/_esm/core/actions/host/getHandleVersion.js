import { isUint8 } from "../../base/uint.js";
import { getHandleVersionAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getHandleVersion(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getHandleVersionAbi,
        args: [],
        functionName: getHandleVersionAbi[0].name,
    });
    if (!isUint8(res)) {
        throw new Error(`Invalid handle version.`);
    }
    return Number(res);
}
//# sourceMappingURL=getHandleVersion.js.map