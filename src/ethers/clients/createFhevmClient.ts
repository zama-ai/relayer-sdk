import type { ethers as EthersT } from "ethers";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithAll } from "../../core/types/coreFhevmRuntime.js";
import {
  getEthersRuntime,
  PRIVATE_ETHERS_TOKEN,
} from "../internal/ethers-p.js";
import type { FhevmClient } from "../../core/clients/fhevmClient.js";
import { createCoreFhevm } from "../../core/runtime/CoreFhevm-p.js";
import { decryptActions } from "./createFhevmDecryptClient.js";
import {
  encryptActions,
  globalFhePkeActions,
} from "./createFhevmEncryptClient.js";
import type { FhevmOptions } from "../../core/types/coreFhevmClient.js";

////////////////////////////////////////////////////////////////////////////////

export function createFhevmClient<
  chain extends FhevmChain,
  provider extends EthersT.ContractRunner,
>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
  readonly options?: FhevmOptions | undefined;
}): FhevmClient<chain, WithAll, provider> {
  const c = createCoreFhevm(PRIVATE_ETHERS_TOKEN, {
    chain: parameters.chain,
    runtime: getEthersRuntime(),
    client: parameters.provider,
  });

  return c
    .extend(decryptActions)
    .extend(encryptActions)
    .extend(globalFhePkeActions);
}
