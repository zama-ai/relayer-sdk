import { ethers } from "ethers";
import { FHETestABI } from "../abi.js";
import { getBaseEnv, type FheTestChain } from "../setupCommon.js";

// Re-export for convenience
export type { FheTestChain } from "../setupCommon.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FheTestEthersConfig = {
  readonly chain: FheTestChain;
  readonly wallet: ethers.HDNodeWallet;
  readonly signer: ethers.Signer;
  readonly alice: {
    readonly wallet: ethers.HDNodeWallet;
    readonly signer: ethers.Signer;
  };
  readonly bob: {
    readonly wallet: ethers.HDNodeWallet;
    readonly signer: ethers.Signer;
  };
  readonly provider: ethers.JsonRpcProvider;
  readonly zamaApiKey: string;
  readonly fheTestAddress: string;
  readonly fheTestContract: ethers.Contract;
  readonly fheTestAbi: typeof FHETestABI;
};

// ---------------------------------------------------------------------------
// Build config
// ---------------------------------------------------------------------------

function buildConfig(): FheTestEthersConfig {
  const env = getBaseEnv();

  const provider = new ethers.JsonRpcProvider(env.rpcUrl);
  const wallet = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(env.mnemonic),
  );

  const bobWallet = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(env.mnemonic),
    "m/44'/60'/0'/0/1",
  );
  console.log(bobWallet.address);

  const signer = wallet.connect(provider);
  const fheTestContract = new ethers.Contract(
    env.fheTestAddress,
    FHETestABI,
    signer,
  );

  const bobSigner = bobWallet.connect(provider);

  return {
    chain: env.chain,
    wallet,
    signer,
    alice: {
      wallet,
      signer,
    },
    bob: {
      wallet: bobWallet,
      signer: bobSigner,
    },
    provider,
    zamaApiKey: env.zamaApiKey,
    fheTestAddress: env.fheTestAddress,
    fheTestContract,
    fheTestAbi: FHETestABI,
  };
}

// ---------------------------------------------------------------------------
// Singleton — built once, shared across all test files
// ---------------------------------------------------------------------------

let _config: FheTestEthersConfig | undefined;

export function getEthersTestConfig(): FheTestEthersConfig {
  if (_config === undefined) {
    _config = buildConfig();
  }
  return _config;
}
