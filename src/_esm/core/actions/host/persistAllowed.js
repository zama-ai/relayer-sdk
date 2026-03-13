import { persistAllowedAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function persistAllowed(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: persistAllowedAbi,
        args: [parameters.args.handle, parameters.args.account],
        functionName: persistAllowedAbi[0].name,
    });
    if (typeof res !== "boolean") {
        throw new Error(`Invalid persistAllowed result.`);
    }
    return res;
}
//# sourceMappingURL=persistAllowed.js.map