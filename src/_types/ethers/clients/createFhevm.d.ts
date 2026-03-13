import type { ethers as EthersT } from "ethers";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { FhevmRuntime } from "../../core/types/coreFhevmRuntime.js";
import type { Fhevm } from "../../core/types/coreFhevmClient.js";
export declare function createFhevm<chain extends FhevmChain | undefined = undefined, provider extends EthersT.ContractRunner | undefined = undefined>(parameters?: {
    readonly provider?: provider;
    readonly chain?: chain;
}): Fhevm<chain, FhevmRuntime, provider>;
//# sourceMappingURL=createFhevm.d.ts.map