import {
  createPublicClient,
  http,
  type PublicClient,
  type Transport,
  type Chain,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { sepolia as viemSepolia, mainnet as viemMainnet } from "viem/chains";
import { getBaseEnv, type FheTestChain } from "../setupCommon.js";

// Re-export for convenience
export type { FheTestChain } from "../setupCommon.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FheTestViemConfig = {
  readonly chain: FheTestChain;
  readonly publicClient: PublicClient<Transport, Chain>;
  readonly account: ReturnType<typeof mnemonicToAccount>;
  readonly alice: {
    readonly account: ReturnType<typeof mnemonicToAccount>;
  };
  readonly bob: {
    readonly account: ReturnType<typeof mnemonicToAccount>;
  };
  readonly zamaApiKey: string;
  readonly fheTestAddress: string;
};

// ---------------------------------------------------------------------------
// Build config
// ---------------------------------------------------------------------------

function buildConfig(): FheTestViemConfig {
  const env = getBaseEnv();

  const viemChain = env.chain === "sepolia" ? viemSepolia : viemMainnet;

  const account = mnemonicToAccount(env.mnemonic);
  const bobAccount = mnemonicToAccount(env.mnemonic, {
    path: "m/44'/60'/0'/0/1",
  });

  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(env.rpcUrl),
  });

  return {
    chain: env.chain,
    publicClient,
    account,
    alice: {
      account,
    },
    bob: {
      account: bobAccount,
    },
    zamaApiKey: env.zamaApiKey,
    fheTestAddress: env.fheTestAddress,
  };
}

// ---------------------------------------------------------------------------
// Singleton — built once, shared across all test files
// ---------------------------------------------------------------------------

let _config: FheTestViemConfig | undefined;

export function getViemTestConfig(): FheTestViemConfig {
  if (_config === undefined) {
    _config = buildConfig();
  }
  return _config;
}
