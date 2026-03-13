import { assertIsChecksummedAddress } from "../../base/address.js";
import { getInputVerifierAddressAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function getInputVerifierAddress(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: getInputVerifierAddressAbi,
        args: [],
        functionName: getInputVerifierAddressAbi[0].name,
    });
    try {
        assertIsChecksummedAddress(res, {});
    }
    catch (e) {
        throw new Error(`Invalid InputVerifier address.`, {
            cause: e,
        });
    }
    return res;
}
//# sourceMappingURL=getInputVerifierAddress.js.map