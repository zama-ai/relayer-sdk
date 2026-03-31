// npx vitest run --config test/fheTest/vitest.config.ts viem/clientDecrypt.decrypt

import { describe, it, expect, beforeAll } from "vitest";
import {
  setFhevmRuntimeConfig,
  createFhevmDecryptClient,
} from "@fhevm/sdk/viem";
import { sepolia } from "@fhevm/sdk/chains";
import handlesData from "../handles.json" with { type: "json" };
import { FHETestAddresses } from "../abi.js";
import type { ChecksummedAddress } from "../../../src/core/types/primitives.js";
import { getViemTestConfig, type FheTestViemConfig } from "./setup.js";

const publicHandles = handlesData.handles.filter((h) => h.public);

describe("Decrypt client — user decrypt", () => {
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

  it("should create a decrypt client", () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });
    expect(client).toBeDefined();
    expect(typeof client.decrypt).toBe("function");
    expect(typeof client.generateE2eTransportKeypair).toBe("function");
    expect(typeof client.signDecryptionPermit).toBe("function");
  });

  it("should generate an e2e transport keypair", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });
    await client.ready;

    const keypair = await client.generateE2eTransportKeypair();
    expect(keypair).toBeDefined();
  });

  it("should sign a self decryption permit", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });
    await client.ready;

    const keypair = await client.generateE2eTransportKeypair();
    const signedPermit = await client.signDecryptionPermit({
      e2eTransportKeypair: keypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.account.address,
      signer: config.account,
    });

    expect(signedPermit).toBeDefined();
    expect(signedPermit.isDelegated).toBe(false);
  });

  it("should decrypt a public handle via user decrypt", async () => {
    const handle = publicHandles[1]!;

    const client = createFhevmDecryptClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });
    await client.ready;

    const e2eTransportKeypair = await client.generateE2eTransportKeypair();
    const signedPermit = await client.signDecryptionPermit({
      e2eTransportKeypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.account.address,
      signer: config.account,
    });

    const clearValues = await client.decrypt({
      encryptedValues: {
        encryptedValue: handle.bytes32Hex,
        contractAddress: FHETestAddresses.testnet as ChecksummedAddress,
      },
      signedPermit,
      e2eTransportKeypair,
    });

    expect(clearValues).toHaveLength(1);
    const clearValue = clearValues[0]?.value;
    console.log(`  ${handle.fheType}: ${clearValue}`);

    const expected = handle.clearValue;
    if (typeof expected === "boolean") {
      expect(clearValue).toBe(expected);
    } else if (typeof expected === "string") {
      expect(String(clearValue)).toBe(expected);
    } else {
      expect(clearValue).toBe(expected);
    }
  });

  it("should decrypt all public handles in a single call", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });
    await client.ready;

    const e2eTransportKeypair = await client.generateE2eTransportKeypair();
    const signedPermit = await client.signDecryptionPermit({
      e2eTransportKeypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.account.address,
      signer: config.account,
    });

    const allEncryptedValues = publicHandles.map((h) => ({
      encryptedValue: h.bytes32Hex,
      contractAddress: FHETestAddresses.testnet as ChecksummedAddress,
    }));

    const clearValues = await client.decrypt({
      encryptedValues: allEncryptedValues,
      signedPermit,
      e2eTransportKeypair,
    });

    expect(clearValues).toHaveLength(publicHandles.length);

    for (let i = 0; i < publicHandles.length; i++) {
      const handle = publicHandles[i]!;
      const clearValue = clearValues[i]?.value;
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
});
