import type { ethers as EthersT } from "ethers";
import { decryptModule } from "../../core/modules/decrypt/module/index.js";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithDecrypt } from "../../core/types/coreFhevmRuntime.js";
import type { FhevmDecryptClient } from "../../core/clients/fhevmDecryptClient.js";
import {
  getEthersRuntime,
  PRIVATE_ETHERS_TOKEN,
} from "../internal/ethers-p.js";
import {
  decryptActions as decryptActions_,
  type DecryptActions,
} from "../../core/clients/decorators/decrypt.js";
import type {
  Fhevm,
  FhevmBase,
  FhevmExtension,
  OptionalNativeClient,
} from "../../core/types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../core/types/coreFhevmRuntime.js";
import { createCoreFhevm } from "../../core/runtime/CoreFhevm-p.js";

export function createFhevmDecryptClient<
  chain extends FhevmChain,
  provider extends EthersT.ContractRunner,
>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
}): FhevmDecryptClient<chain, WithDecrypt, provider> {
  const c = createCoreFhevm(PRIVATE_ETHERS_TOKEN, {
    chain: parameters.chain,
    runtime: getEthersRuntime(),
    client: parameters.provider,
  });

  return c.extend(decryptActions);
}

export function decryptActions(
  fhevm: FhevmBase<FhevmChain>,
): FhevmExtension<DecryptActions, WithDecrypt> {
  const runtime = fhevm.runtime.extend(decryptModule);
  const f = fhevm as unknown as Fhevm<FhevmChain, WithDecrypt>;
  return {
    actions: decryptActions_(f),
    runtime,
    init: initDecrypt,
  };
}

function initDecrypt(
  fhevm: FhevmBase<FhevmChain | undefined, FhevmRuntime, OptionalNativeClient>,
): Promise<void> {
  return (fhevm.runtime as WithDecrypt).decrypt.initTkmsModule();
}
