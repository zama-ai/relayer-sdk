import type { ethers as EthersT } from "ethers";
import { encryptModule } from "../../core/modules/encrypt/module/index.js";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithEncrypt } from "../../core/types/coreFhevmRuntime.js";
import {
  getEthersRuntime,
  PRIVATE_ETHERS_TOKEN,
} from "../internal/ethers-p.js";
import { type FhevmEncryptClient } from "../../core/clients/fhevmEncryptClient.js";
import {
  asFhevmClientWith,
  createCoreFhevm,
} from "../../core/runtime/CoreFhevm-p.js";
import type {
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
import { fetchGlobalFhePkeParamsBytes } from "../../core/actions/key/fetchGlobalFhePkeParamsBytes.js";

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
  // Extend runtime with the required encrypt module (if needed)
  const runtime = fhevm.runtime.extend(encryptModule);
  const f = asFhevmClientWith(fhevm, "encrypt");
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
  // Extend runtime with the required encrypt module (if needed)
  const runtime = fhevm.runtime.extend(encryptModule);
  const f = asFhevmClientWith(fhevm, "encrypt");
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
  const f = asFhevmClientWith(fhevm, "encrypt");
  await Promise.all([
    // Must check if tfhe global key is available
    fetchGlobalFhePkeParamsBytes(f, {}),
    f.runtime.encrypt.initTfheModule(),
  ]);
}
