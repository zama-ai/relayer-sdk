import { assertIsChecksummedAddressArray } from "../../base/address.js";
import { getCoprocessorSignersAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getCoprocessorSigners(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getCoprocessorSignersAbi,
        args: [],
        functionName: getCoprocessorSignersAbi[0].name,
    });
    try {
        assertIsChecksummedAddressArray(res, {});
    }
    catch (e) {
        throw new Error(`Invalid coprocessor signers addresses.`, {
            cause: e,
        });
    }
    return res;
}
//# sourceMappingURL=getCoprocessorSigners.js.map