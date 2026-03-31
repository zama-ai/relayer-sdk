import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { FHETestAddresses } from "./abi.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FheTestChain = "sepolia" | "mainnet";

export type FheTestBaseEnv = {
  readonly chain: FheTestChain;
  readonly rpcUrl: string;
  readonly mnemonic: string;
  readonly zamaApiKey: string;
  readonly fheTestAddress: string;
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
// Build base env
// ---------------------------------------------------------------------------

let _baseEnv: FheTestBaseEnv | undefined;

export function getBaseEnv(): FheTestBaseEnv {
  if (_baseEnv !== undefined) {
    return _baseEnv;
  }

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

  _baseEnv = {
    chain,
    rpcUrl,
    mnemonic,
    zamaApiKey,
    fheTestAddress,
  };

  return _baseEnv;
}
