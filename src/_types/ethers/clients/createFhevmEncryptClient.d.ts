import type { ethers as EthersT } from "ethers";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithEncryptAndRelayer } from "../../core/types/coreFhevmRuntime.js";
import { type FhevmEncryptClient } from "../../core/clients/fhevmEncryptClient.js";
export declare function createFhevmEncryptClient<chain extends FhevmChain, provider extends EthersT.ContractRunner>(parameters: {
    readonly provider: provider;
    readonly chain: chain;
}): FhevmEncryptClient<chain, WithEncryptAndRelayer, provider>;
//# sourceMappingURL=createFhevmEncryptClient.d.ts.map