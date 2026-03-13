import { Contract, Interface } from "ethers";
import { trustedClientToEthersContractRunner } from "./ethers-p.js";
/**
 * Get ethers Network from an unknown client.
 * Supports Provider (has getNetwork) and ContractRunner (via its provider).
 */
export async function getNetwork(hostPublicClient) {
    const runner = trustedClientToEthersContractRunner(hostPublicClient);
    if (runner === undefined || runner === null) {
        throw new Error("Cannot get network: client is null or undefined.");
    }
    if (typeof runner === "object" &&
        "getNetwork" in runner &&
        typeof runner.getNetwork === "function") {
        return await runner.getNetwork();
    }
    if (runner.provider != null) {
        return await runner.provider.getNetwork();
    }
    throw new Error("Cannot get network: client is neither a Provider nor a ContractRunner with a provider.");
}
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function getEthersContract(hostPublicClient, contractAddress, abi) {
    const runner = trustedClientToEthersContractRunner(hostPublicClient);
    return new Contract(contractAddress, new Interface(abi), runner);
}
//# sourceMappingURL=utils.js.map