// npx vitest run --config test/fheTest/vitest.config.ts clientDecrypt.e2eTransportKeypair

import { describe, it, expect, beforeAll } from "vitest";
import {
  createFhevmDecryptClient,
  setFhevmRuntimeConfig,
} from "@fhevm/sdk/ethers";
import { sepolia } from "@fhevm/sdk/chains";
import {
  serializeE2eTransportKeypair,
  parseE2eTransportKeypair,
} from "@fhevm/sdk/actions/chain";
import {
  getEthersTestConfig,
  type FheTestEthersConfig,
} from "./ethers/setup.js";

describe("Decrypt client — e2e transport keypair", () => {
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

  it("should generate an e2e transport keypair", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      provider: config.provider,
    });
    await client.ready;

    const keypair = await client.generateE2eTransportKeypair();
    expect(keypair).toBeDefined();
  });

  it("should serialize a keypair to hex strings", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      provider: config.provider,
    });
    await client.ready;

    const keypair = await client.generateE2eTransportKeypair();
    const serialized = serializeE2eTransportKeypair(client, { e2eTransportKeypair: keypair });

    expect(serialized).toBeDefined();
    expect(typeof serialized.publicKey).toBe("string");
    expect(typeof serialized.privateKey).toBe("string");
    expect(serialized.publicKey.startsWith("0x")).toBe(true);
    expect(serialized.privateKey.startsWith("0x")).toBe(true);
    expect(serialized.publicKey.length).toBeGreaterThan(2);
    expect(serialized.privateKey.length).toBeGreaterThan(2);
    console.log(
      `  publicKey: ${serialized.publicKey.slice(0, 20)}... (${serialized.publicKey.length} chars)`,
    );
    console.log(
      `  privateKey: ${serialized.privateKey.slice(0, 20)}... (${serialized.privateKey.length} chars)`,
    );
  });

  it("should round-trip: generate → serialize → parse", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      provider: config.provider,
    });
    await client.ready;

    // Generate
    const original = await client.generateE2eTransportKeypair();

    // Serialize to hex
    const serialized = serializeE2eTransportKeypair(client, { e2eTransportKeypair: original });

    // Parse back from hex
    const parsed = await parseE2eTransportKeypair(client, { serialized });
    expect(parsed).toBeDefined();

    // Serialize again and compare — should be identical
    const reSerialized = serializeE2eTransportKeypair(client, { e2eTransportKeypair: parsed });
    expect(reSerialized.publicKey).toBe(serialized.publicKey);
    expect(reSerialized.privateKey).toBe(serialized.privateKey);
  });
});
