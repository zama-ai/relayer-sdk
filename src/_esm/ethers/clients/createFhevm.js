import { createFhevm as createFhevm_ } from "../../core/clients/fhevm.js";
import { getEthersRuntime, PRIVATE_ETHERS_TOKEN, } from "../internal/ethers-p.js";
export function createFhevm(parameters) {
    const runtime = getEthersRuntime();
    return createFhevm_(PRIVATE_ETHERS_TOKEN, {
        chain: parameters?.chain,
        runtime,
        client: parameters?.provider,
    });
}
//# sourceMappingURL=createFhevm.js.map