import type { PublicClient, Chain, Transport } from "viem";
import type { FhevmChain } from "../../core/types/fhevmChain.js";
import type { WithAll } from "../../core/types/coreFhevmRuntime.js";
import {
  getViemRuntime,
  PRIVATE_VIEM_TOKEN,
} from "../internal/viem-p.js";
import type { FhevmClient } from "../../core/clients/fhevmClient.js";
import { createCoreFhevm } from "../../core/runtime/CoreFhevm-p.js";
import { decryptActions } from "./createFhevmDecryptClient.js";
import {
  encryptActions,
  globalFhePkeActions,
} from "./createFhevmEncryptClient.js";
import type { FhevmOptions } from "../../core/types/coreFhevmClient.js";

////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a full FHEVM client with encrypt, decrypt, and relayer capabilities.
 *
 * WASM modules are lazy-loaded on first use. Call `client.init()` or
 * `await client.ready` to eagerly initialize all modules.
 *
 * @param parameters.chain - The fhEVM chain definition (e.g. `sepolia`).
 * @param parameters.provider - A viem `PublicClient`.
 * @param parameters.options - Optional client options.
 * @returns A client with all encrypt, decrypt, and key management actions.
 */
export function createFhevmClient<
  chain extends FhevmChain,
  provider extends PublicClient<Transport, Chain>,
>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
  readonly options?: FhevmOptions | undefined;
}): FhevmClient<chain, WithAll, provider> {
  const c = createCoreFhevm(PRIVATE_VIEM_TOKEN, {
    chain: parameters.chain,
    runtime: getViemRuntime(),
    client: parameters.provider,
  });

  return c
    .extend(decryptActions)
    .extend(encryptActions)
    .extend(globalFhePkeActions);
}
