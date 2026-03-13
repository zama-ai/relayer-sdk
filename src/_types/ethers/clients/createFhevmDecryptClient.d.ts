import type { ethers as EthersT } from "ethers";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithDecryptAndRelayer } from "../../core/types/coreFhevmRuntime.js";
import { type FhevmDecryptClient } from "../../core/clients/fhevmDecryptClient.js";
export declare function createFhevmDecryptClient<chain extends FhevmChain, provider extends EthersT.ContractRunner>(parameters: {
    readonly provider: provider;
    readonly chain: chain;
}): FhevmDecryptClient<chain, WithDecryptAndRelayer, provider>;
//# sourceMappingURL=createFhevmDecryptClient.d.ts.map