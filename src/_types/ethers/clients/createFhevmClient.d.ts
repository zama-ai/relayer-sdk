import type { ethers as EthersT } from "ethers";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithAll } from "../../core/types/coreFhevmRuntime.js";
import { type FhevmClient } from "../../core/clients/fhevmClient.js";
export declare function createFhevmClient<chain extends FhevmChain, provider extends EthersT.ContractRunner>(parameters: {
    readonly provider: provider;
    readonly chain: chain;
}): FhevmClient<chain, WithAll, provider>;
//# sourceMappingURL=createFhevmClient.d.ts.map