// npx vitest run --config test/fheTest/vitest.config.ts clientBase.chain

import { describe, it, expect, beforeAll } from "vitest";
import {
  createFhevmBaseClient,
  setFhevmRuntimeConfig,
} from "@fhevm/sdk/ethers";
import { sepolia } from "@fhevm/sdk/chains";
import {
  getEthersTestConfig,
  type FheTestEthersConfig,
} from "./ethers/setup.js";
import { resolveFhevmConfig } from "@fhevm/sdk/actions/host";
import { safeJSONstringify } from "../../src/core/base/string.js";

describe("Base client — chain resolution", () => {
  let config: FheTestEthersConfig;

  beforeAll(() => {
    config = getEthersTestConfig();
    setFhevmRuntimeConfig({
      auth: {
        type: "ApiKeyHeader",
        value: config.zamaApiKey,
      },
    });
  });

  it("should resolve full FHEVM config from on-chain data", async () => {
    const client = createFhevmBaseClient({
      chain: sepolia,
      provider: config.provider,
    });
    const cfg = await resolveFhevmConfig(client, sepolia);
    console.log(safeJSONstringify(cfg, 2));

    expect(cfg.id).toBe(BigInt(sepolia.id));
    expect(cfg.acl.toLowerCase()).toBe(
      sepolia.fhevm.contracts.acl.address.toLowerCase(),
    );
    expect(cfg.kmsVerifier).toBeDefined();
    expect(cfg.kmsVerifier.address.toLowerCase()).toBe(
      sepolia.fhevm.contracts.kmsVerifier.address.toLowerCase(),
    );
    expect(cfg.inputVerifier).toBeDefined();
    expect(cfg.inputVerifier.address.toLowerCase()).toBe(
      sepolia.fhevm.contracts.inputVerifier.address.toLowerCase(),
    );
    expect(cfg.fhevmExecutor).toBeDefined();
    expect(Number(cfg.inputVerifier.gatewayChainId)).toBe(
      Number(cfg.kmsVerifier.gatewayChainId),
    );
    expect(Number(cfg.inputVerifier.gatewayChainId)).toBe(
      Number(sepolia.fhevm.gateway.id),
    );
    expect(cfg.inputVerifier.verifyingContractAddressInputVerification).toBe(
      sepolia.fhevm.gateway.contracts.inputVerification.address,
    );
    expect(cfg.kmsVerifier.verifyingContractAddressDecryption).toBe(
      sepolia.fhevm.gateway.contracts.decryption.address,
    );
  });
});
