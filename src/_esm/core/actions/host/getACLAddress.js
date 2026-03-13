import { assertIsChecksummedAddress } from "../../base/address.js";
import { getACLAddressAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getACLAddress(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getACLAddressAbi,
        args: [],
        functionName: getACLAddressAbi[0].name,
    });
    try {
        assertIsChecksummedAddress(res, {});
    }
    catch (e) {
        throw new Error(`Invalid ACL address.`, {
            cause: e,
        });
    }
    return res;
}
//# sourceMappingURL=getACLAddress.js.map