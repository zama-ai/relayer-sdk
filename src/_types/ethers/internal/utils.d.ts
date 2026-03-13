import type { ethers as EthersT } from "ethers";
import type { ChecksummedAddress } from "../../core/types/primitives.js";
import type { TrustedClient } from "../../core/modules/ethereum/types.js";
/**
 * Get ethers Network from an unknown client.
 * Supports Provider (has getNetwork) and ContractRunner (via its provider).
 */
export declare function getNetwork(hostPublicClient: TrustedClient<EthersT.ContractRunner>): Promise<EthersT.Network>;
export declare function getEthersContract<C>(hostPublicClient: TrustedClient<EthersT.ContractRunner>, contractAddress: ChecksummedAddress, abi: ReadonlyArray<Record<string, unknown>>): C;
//# sourceMappingURL=utils.d.ts.map