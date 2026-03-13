import { isUint8 } from "../../base/uint.js";
import { getThresholdAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getThreshold(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getThresholdAbi,
        args: [],
        functionName: getThresholdAbi[0].name,
    });
    if (!isUint8(res)) {
        throw new Error(`Invalid threshold.`);
    }
    return Number(res);
}
//# sourceMappingURL=getThreshold.js.map