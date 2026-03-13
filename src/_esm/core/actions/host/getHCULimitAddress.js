import { assertIsChecksummedAddress } from "../../base/address.js";
import { getHCULimitAddressAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getHCULimitAddress(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getHCULimitAddressAbi,
        args: [],
        functionName: getHCULimitAddressAbi[0].name,
    });
    try {
        assertIsChecksummedAddress(res, {});
    }
    catch (e) {
        throw new Error(`Invalid HCULimit address.`, {
            cause: e,
        });
    }
    return res;
}
//# sourceMappingURL=getHCULimitAddress.js.map