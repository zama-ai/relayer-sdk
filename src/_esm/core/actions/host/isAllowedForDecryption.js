import { isAllowedForDecryptionAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function isAllowedForDecryption(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: isAllowedForDecryptionAbi,
        args: [parameters.args.handle],
        functionName: isAllowedForDecryptionAbi[0].name,
    });
    if (typeof res !== "boolean") {
        throw new Error(`Invalid isAllowedForDecryption result.`);
    }
    return res;
}
//# sourceMappingURL=isAllowedForDecryption.js.map