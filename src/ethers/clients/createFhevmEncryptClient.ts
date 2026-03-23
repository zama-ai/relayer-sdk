import type { ethers as EthersT } from "ethers";
import { encryptModule } from "../../core/modules/encrypt/module/index.js";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithEncrypt } from "../../core/types/coreFhevmRuntime.js";
import {
  getEthersRuntime,
  PRIVATE_ETHERS_TOKEN,
} from "../internal/ethers-p.js";
import type { FhevmEncryptClient } from "../../core/clients/fhevmEncryptClient.js";
import { createCoreFhevm } from "../../core/runtime/CoreFhevm-p.js";
import type {
  Fhevm,
  FhevmBase,
  FhevmExtension,
  FhevmOptions,
  OptionalNativeClient,
} from "../../core/types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../core/types/coreFhevmRuntime.js";
import {
  encryptActions as encryptActions_,
  type EncryptActions,
} from "../../core/clients/decorators/encrypt.js";
import {
  globalFhePkeActions as globalFhePkeActions_,
  type GlobalFhePkeActions,
} from "../../core/clients/decorators/globalFhePke.js";

////////////////////////////////////////////////////////////////////////////////

export function createFhevmEncryptClient<
  chain extends FhevmChain,
  provider extends EthersT.ContractRunner,
>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
  readonly options?: FhevmOptions | undefined;
}): FhevmEncryptClient<chain, WithEncrypt, provider> {
  const c = createCoreFhevm(PRIVATE_ETHERS_TOKEN, {
    chain: parameters.chain,
    runtime: getEthersRuntime(),
    client: parameters.provider,
  });

  return c.extend(encryptActions).extend(globalFhePkeActions);
}

////////////////////////////////////////////////////////////////////////////////

export function encryptActions(
  fhevm: FhevmBase<FhevmChain>,
): FhevmExtension<EncryptActions, WithEncrypt> {
  const runtime = fhevm.runtime.extend(encryptModule);
  const f = fhevm as unknown as Fhevm<FhevmChain, WithEncrypt>;
  return {
    actions: encryptActions_(f),
    runtime,
    init: _initEncrypt,
  };
}

////////////////////////////////////////////////////////////////////////////////

export function globalFhePkeActions(
  fhevm: FhevmBase<FhevmChain>,
): FhevmExtension<GlobalFhePkeActions, WithEncrypt> {
  const runtime = fhevm.runtime.extend(encryptModule);
  const f = fhevm as unknown as Fhevm<FhevmChain, WithEncrypt>;
  return {
    actions: globalFhePkeActions_(f),
    runtime,
    init: _initEncrypt,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * @internal
 */
async function _initEncrypt(
  fhevm: FhevmBase<FhevmChain | undefined, FhevmRuntime, OptionalNativeClient>,
): Promise<void> {
  const runtime = fhevm.runtime as WithEncrypt;
  await Promise.all([
    runtime.relayer.fetchGlobalFhePkeParamsBytes(
      { relayerUrl: fhevm.chain!.fhevm.relayerUrl },
      {},
    ),
    // Must check if tfhe global key is available
    runtime.encrypt.initTfheModule(),
  ]);
}
