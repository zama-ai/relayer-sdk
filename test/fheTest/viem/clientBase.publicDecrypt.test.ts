// npx vitest run --config test/fheTest/vitest.config.ts viem/clientBase.publicDecrypt

import { describe, it, expect, beforeAll } from "vitest";
import { createFhevmBaseClient, setFhevmRuntimeConfig } from "@fhevm/sdk/viem";
import { sepolia } from "@fhevm/sdk/chains";
import { getViemTestConfig, type FheTestViemConfig } from "./setup.js";
import handlesData from "../handles.json" with { type: "json" };

const publicHandles = handlesData.handles.filter((h) => h.public);

describe("Base client — public decrypt", () => {
  let config: FheTestViemConfig;

  beforeAll(() => {
    config = getViemTestConfig();
    setFhevmRuntimeConfig({
      auth: {
        type: "ApiKeyHeader",
        value: config.zamaApiKey,
      },
    });
  });

  it("should public decrypt all handles in a single call", async () => {
    const client = createFhevmBaseClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });

    const allBytes32 = publicHandles.map((h) => h.bytes32Hex);
    const proof = await client.publicDecrypt({
      encryptedValues: allBytes32,
    });

    expect(proof).toBeDefined();
    expect(proof.orderedClearValues).toHaveLength(publicHandles.length);

    for (let i = 0; i < publicHandles.length; i++) {
      const handle = publicHandles[i]!;
      const clearValue = proof.orderedClearValues[i]?.value;
      console.log(`  ${handle.fheType}: ${clearValue}`);

      const expected = handle.clearValue;
      if (typeof expected === "boolean") {
        expect(clearValue).toBe(expected);
      } else if (typeof expected === "string") {
        expect(String(clearValue)).toBe(expected);
      } else {
        expect(clearValue).toBe(expected);
      }
    }
  });

  for (const handle of publicHandles) {
    it(`should public decrypt ${handle.fheType} (${handle.bytes32Hex.slice(0, 10)}...)`, async () => {
      const client = createFhevmBaseClient({
        chain: sepolia,
        publicClient: config.publicClient,
      });

      const publicDecryptionProof = await client.readPublicValue({
        encryptedValues: [handle.bytes32Hex],
      });

      expect(publicDecryptionProof).toBeDefined();
      expect(publicDecryptionProof.orderedClearValues).toHaveLength(1);

      const clearValue = publicDecryptionProof.orderedClearValues[0]?.value;
      console.log(`  ${handle.fheType}: ${clearValue}`);

      // Compare with known clear values from handles.json
      const expected = handle.clearValue;
      if (typeof expected === "boolean") {
        expect(clearValue).toBe(expected);
      } else if (typeof expected === "string") {
        // uint64+ stored as string in JSON to avoid precision loss
        expect(String(clearValue)).toBe(expected);
      } else {
        expect(clearValue).toBe(expected);
      }
    });
  }
});
