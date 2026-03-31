// npx vitest run --config test/fheTest/vitest.config.ts ethers/clientDecrypt.delegateDecrypt

import { describe, it, expect, beforeAll } from "vitest";
import {
  createFhevmDecryptClient,
  setFhevmRuntimeConfig,
} from "@fhevm/sdk/ethers";
import { sepolia } from "@fhevm/sdk/chains";
import { getEthersTestConfig, type FheTestEthersConfig } from "./setup.js";
import handlesData from "../handles.json" with { type: "json" };
import { FHETestAddresses } from "../abi.js";
import type { ChecksummedAddress } from "../../../src/core/types/primitives.js";
import { ethers } from "ethers";

const publicHandles = handlesData.handles.filter((h) => h.public);

// Alice (config.alice) — owns the handles, delegates to Bob
// Bob (config.bob) — signs the delegated permit and decrypts

const ACL_DELEGATE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "delegate", type: "address" },
      { internalType: "address", name: "contractAddress", type: "address" },
      { internalType: "uint64", name: "expirationDate", type: "uint64" },
    ],
    name: "delegateForUserDecryption",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "delegator", type: "address" },
      { internalType: "address", name: "delegate", type: "address" },
      { internalType: "address", name: "contractAddress", type: "address" },
    ],
    name: "getUserDecryptionDelegationExpirationDate",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Alice calls `ACL.delegateForUserDecryption` on-chain, granting `delegate`
 * permission to decrypt her handles on `contractAddress` until `expirationDate`.
 */
async function delegateForUserDecryption(parameters: {
  readonly aclAddress: string;
  readonly delegatorSigner: ethers.Signer; // Alice
  readonly delegateAddress: string; // Bob
  readonly contractAddress: string;
  readonly durationSeconds: number;
}): Promise<ethers.TransactionReceipt> {
  const aclContract = new ethers.Contract(
    parameters.aclAddress,
    ACL_DELEGATE_ABI,
    parameters.delegatorSigner,
  );

  const expirationDate =
    Math.floor(Date.now() / 1000) + parameters.durationSeconds;

  const tx = await aclContract.getFunction("delegateForUserDecryption")(
    parameters.delegateAddress,
    parameters.contractAddress,
    expirationDate,
  );
  return tx.wait();
}

/**
 * Reads the expiration date of a delegation from the ACL contract.
 * Returns `0n` if no delegation exists.
 */
async function getUserDecryptionDelegationExpirationDate(parameters: {
  readonly aclAddress: string;
  readonly provider: ethers.Provider;
  readonly delegatorAddress: string;
  readonly delegateAddress: string;
  readonly contractAddress: string;
}): Promise<bigint> {
  const aclContract = new ethers.Contract(
    parameters.aclAddress,
    ACL_DELEGATE_ABI,
    parameters.provider,
  );

  return aclContract.getFunction("getUserDecryptionDelegationExpirationDate")(
    parameters.delegatorAddress,
    parameters.delegateAddress,
    parameters.contractAddress,
  );
}

describe("Decrypt client — delegated decrypt", () => {
  let config: FheTestEthersConfig;

  beforeAll(async () => {
    config = getEthersTestConfig();
    setFhevmRuntimeConfig({
      auth: {
        type: "ApiKeyHeader",
        value: config.zamaApiKey,
      },
    });
    console.log(`  Alice: ${config.alice.wallet.address}`);
    console.log(`  Bob:   ${config.bob.wallet.address}`);

    // Check if delegation already exists
    const existingExpiration = await getUserDecryptionDelegationExpirationDate({
      aclAddress: sepolia.fhevm.contracts.acl.address,
      provider: config.provider,
      delegatorAddress: config.alice.wallet.address,
      delegateAddress: config.bob.wallet.address,
      contractAddress: FHETestAddresses.testnet,
    });

    const now = Math.floor(Date.now() / 1000);
    if (existingExpiration > BigInt(now)) {
      console.log(
        `  Delegation already active (expires ${existingExpiration}), skipping tx`,
      );
    } else {
      console.log(
        `  Delegation not yet active, calling delegateForUserDecryption()...`,
      );
      // Alice delegates decryption to Bob
      const receipt = await delegateForUserDecryption({
        aclAddress: sepolia.fhevm.contracts.acl.address,
        delegatorSigner: config.alice.signer,
        delegateAddress: config.bob.wallet.address,
        contractAddress: FHETestAddresses.testnet,
        durationSeconds: 86400 * 360, // a bit less than a year
      });
      if (receipt.status !== 1) {
        throw new Error(`Delegation tx failed: ${receipt.hash}`);
      }
      console.log(`  Delegation tx: ${receipt.hash}`);
    }
  });

  it("should sign a delegated decryption permit", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      provider: config.provider,
    });
    await client.ready;

    const keypair = await client.generateE2eTransportKeypair();

    // Bob signs a delegated permit to decrypt Alice's handles
    const signedPermit = await client.signDecryptionPermit({
      e2eTransportKeypair: keypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.bob.wallet.address,
      signer: config.bob.signer,
      delegatorAddress: config.alice.wallet.address,
    });

    expect(signedPermit).toBeDefined();
    expect(signedPermit.isDelegated).toBe(true);
    expect(signedPermit.signerAddress.toLowerCase()).toBe(
      config.bob.wallet.address.toLowerCase(),
    );
    expect(signedPermit.userAddress.toLowerCase()).toBe(
      config.alice.wallet.address.toLowerCase(),
    );
  });

  it("should decrypt a public handle via delegated decrypt", async () => {
    const handle = publicHandles[1]!;

    const fhevm = createFhevmDecryptClient({
      chain: sepolia,
      provider: config.provider,
    });
    await fhevm.ready;

    const e2eTransportKeypair = await fhevm.generateE2eTransportKeypair();

    // Bob signs a delegated permit to decrypt Alice's handles
    const signedPermit = await fhevm.signDecryptionPermit({
      e2eTransportKeypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.bob.wallet.address,
      signer: config.bob.signer,
      delegatorAddress: config.alice.wallet.address,
    });

    const clearValues = await fhevm.decrypt({
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

  it("should decrypt all public handles via delegated decrypt", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      provider: config.provider,
    });
    await client.ready;

    const e2eTransportKeypair = await client.generateE2eTransportKeypair();

    // Bob signs a delegated permit to decrypt Alice's handles
    const signedPermit = await client.signDecryptionPermit({
      e2eTransportKeypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.bob.wallet.address,
      signer: config.bob.signer,
      delegatorAddress: config.alice.wallet.address,
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
