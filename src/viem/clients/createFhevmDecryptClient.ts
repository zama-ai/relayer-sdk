import type { PublicClient, Chain, Transport } from "viem";
import { decryptModule } from "../../core/modules/decrypt/module/index.js";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithDecrypt } from "../../core/types/coreFhevmRuntime.js";
import type { FhevmDecryptClient } from "../../core/clients/fhevmDecryptClient.js";
import {
  getViemRuntime,
  PRIVATE_VIEM_TOKEN,
} from "../internal/viem-p.js";
import {
  decryptActions as decryptActions_,
  type DecryptActions,
} from "../../core/clients/decorators/decrypt.js";
import type {
  FhevmBase,
  FhevmExtension,
  FhevmOptions,
  OptionalNativeClient,
} from "../../core/types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../core/types/coreFhevmRuntime.js";
import {
  asFhevmClientWith,
  createCoreFhevm,
} from "../../core/runtime/CoreFhevm-p.js";

////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a decrypt-only FHEVM client. Loads only the TKMS WASM (~600KB).
 * No encryption WASM is loaded, keeping the bundle smaller.
 *
 * Use `client.extend(encryptActions)` to add encrypt capabilities later.
 *
 * @param parameters.chain - The fhEVM chain definition (e.g. `sepolia`).
 * @param parameters.provider - A viem `PublicClient`.
 * @param parameters.options - Optional client options.
 * @returns A client with decrypt, permit creation, and key management actions.
 */
export function createFhevmDecryptClient<
  chain extends FhevmChain,
  provider extends PublicClient<Transport, Chain>,
>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
  readonly options?: FhevmOptions | undefined;
}): FhevmDecryptClient<chain, WithDecrypt, provider> {
  const c = createCoreFhevm(PRIVATE_VIEM_TOKEN, {
    chain: parameters.chain,
    runtime: getViemRuntime(),
    client: parameters.provider,
    options: parameters.options,
  });

  return c.extend(decryptActions);
}

////////////////////////////////////////////////////////////////////////////////

export function decryptActions(
  fhevm: FhevmBase<FhevmChain>,
): FhevmExtension<DecryptActions, WithDecrypt> {
  const runtime = fhevm.runtime.extend(decryptModule);
  const f = asFhevmClientWith(fhevm, "decrypt");
  return {
    actions: decryptActions_(f),
    runtime,
    init: _initDecrypt,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * @internal
 */
function _initDecrypt(
  fhevm: FhevmBase<FhevmChain | undefined, FhevmRuntime, OptionalNativeClient>,
): Promise<void> {
  const f = asFhevmClientWith(fhevm, "decrypt");
  return f.runtime.decrypt.initTkmsModule();
}
