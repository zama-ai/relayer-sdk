import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ethers } from "ethers";
import { FHETestAddresses, FHETestABI } from "./abi.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FheTestChain = "sepolia" | "mainnet";

export type FheTestConfig = {
  readonly chain: FheTestChain;
  readonly wallet: ethers.HDNodeWallet;
  readonly signer: ethers.Signer;
  readonly provider: ethers.JsonRpcProvider;
  readonly zamaApiKey: string;
  readonly fheTestAddress: string;
  readonly fheTestContract: ethers.Contract;
  readonly fheTestAbi: typeof FHETestABI;
};

// ---------------------------------------------------------------------------
// .env parser (no external dependency)
// ---------------------------------------------------------------------------

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }
  const content = readFileSync(filePath, "utf-8");
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Resolve chain
// ---------------------------------------------------------------------------

function resolveChain(): FheTestChain {
  const chain = process.env.CHAIN ?? "sepolia";
  if (chain !== "sepolia" && chain !== "mainnet") {
    throw new Error(
      `Invalid CHAIN env var: "${chain}". Expected "sepolia" or "mainnet".`,
    );
  }
  return chain;
}

// ---------------------------------------------------------------------------
// Build config
// ---------------------------------------------------------------------------

function buildConfig(): FheTestConfig {
  const testDir = resolve(__dirname, "..");
  const chain = resolveChain();

  // Load shared secrets
  const sharedEnv = parseEnvFile(resolve(testDir, ".env"));
  // Load chain-specific env
  const chainEnv = parseEnvFile(resolve(testDir, `.env.${chain}`));

  const mnemonic = sharedEnv.MNEMONIC ?? process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error(
      "MNEMONIC is missing. Set it in test/.env or as an environment variable.",
    );
  }

  const zamaApiKey =
    sharedEnv.ZAMA_FHEVM_API_KEY ?? process.env.ZAMA_FHEVM_API_KEY;
  if (!zamaApiKey) {
    throw new Error(
      "ZAMA_FHEVM_API_KEY is missing. Set it in test/.env or as an environment variable.",
    );
  }

  const rpcUrl = chainEnv.RPC_URL ?? process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error(
      `RPC_URL is missing. Set it in test/.env.${chain} or as an environment variable.`,
    );
  }

  const addressKey = chain === "sepolia" ? "testnet" : "mainnet";
  const fheTestAddress = FHETestAddresses[addressKey];

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(mnemonic),
  );
  const signer = wallet.connect(provider);
  const fheTestContract = new ethers.Contract(
    fheTestAddress,
    FHETestABI,
    signer,
  );

  return {
    chain,
    wallet,
    signer,
    provider,
    zamaApiKey,
    fheTestAddress,
    fheTestContract,
    fheTestAbi: FHETestABI,
  };
}

// ---------------------------------------------------------------------------
// Singleton — built once, shared across all test files
// ---------------------------------------------------------------------------

let _config: FheTestConfig | undefined;

export function getTestConfig(): FheTestConfig {
  if (!_config) {
    _config = buildConfig();
  }
  return _config;
}
