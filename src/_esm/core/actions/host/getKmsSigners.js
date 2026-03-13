import { assertIsChecksummedAddressArray } from "../../base/address.js";
import { getKmsSignersAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getKmsSigners(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getKmsSignersAbi,
        args: [],
        functionName: getKmsSignersAbi[0].name,
    });
    try {
        assertIsChecksummedAddressArray(res, {});
    }
    catch (e) {
        throw new Error(`Invalid kms signers addresses.`, {
            cause: e,
        });
    }
    return res;
}
//# sourceMappingURL=getKmsSigners.js.map