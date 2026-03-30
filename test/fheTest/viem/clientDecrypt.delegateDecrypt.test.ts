// npx vitest run --config test/fheTest/vitest.config.ts viem/clientDecrypt.delegateDecrypt

import { describe, it, expect, beforeAll } from "vitest";
import {
  createFhevmDecryptClient,
  setFhevmRuntimeConfig,
} from "@fhevm/sdk/viem";
import { sepolia } from "@fhevm/sdk/chains";
import { getViemTestConfig, type FheTestViemConfig } from "./setup.js";
import { getBaseEnv } from "../setupCommon.js";
import handlesData from "../handles.json" with { type: "json" };
import { FHETestAddresses } from "../abi.js";
import type { ChecksummedAddress } from "../../../src/core/types/primitives.js";
import {
  createWalletClient,
  http,
  type PublicClient,
  type Account,
} from "viem";
import { sepolia as viemSepolia } from "viem/chains";

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
  readonly aclAddress: `0x${string}`;
  readonly delegatorAccount: Account; // Alice
  readonly delegateAddress: `0x${string}`; // Bob
  readonly contractAddress: `0x${string}`;
  readonly durationSeconds: number;
  readonly publicClient: PublicClient;
  readonly rpcUrl: string;
}): Promise<`0x${string}`> {
  const walletClient = createWalletClient({
    account: parameters.delegatorAccount,
    chain: viemSepolia,
    transport: http(parameters.rpcUrl),
  });

  const expirationDate = BigInt(
    Math.floor(Date.now() / 1000) + parameters.durationSeconds,
  );

  const hash = await walletClient.writeContract({
    address: parameters.aclAddress,
    abi: ACL_DELEGATE_ABI,
    functionName: "delegateForUserDecryption",
    args: [
      parameters.delegateAddress,
      parameters.contractAddress,
      expirationDate,
    ],
  });

  await parameters.publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Reads the expiration date of a delegation from the ACL contract.
 * Returns `0n` if no delegation exists.
 */
async function getUserDecryptionDelegationExpirationDate(parameters: {
  readonly aclAddress: `0x${string}`;
  readonly publicClient: PublicClient;
  readonly delegatorAddress: `0x${string}`;
  readonly delegateAddress: `0x${string}`;
  readonly contractAddress: `0x${string}`;
}): Promise<bigint> {
  return parameters.publicClient.readContract({
    address: parameters.aclAddress,
    abi: ACL_DELEGATE_ABI,
    functionName: "getUserDecryptionDelegationExpirationDate",
    args: [
      parameters.delegatorAddress,
      parameters.delegateAddress,
      parameters.contractAddress,
    ],
  });
}

describe("Decrypt client — delegated decrypt", () => {
  let config: FheTestViemConfig;

  beforeAll(async () => {
    config = getViemTestConfig();
    setFhevmRuntimeConfig({
      auth: {
        type: "ApiKeyHeader",
        value: config.zamaApiKey,
      },
    });
    console.log(`  Alice: ${config.alice.account.address}`);
    console.log(`  Bob:   ${config.bob.account.address}`);

    // Check if delegation already exists
    const aclAddress = sepolia.fhevm.contracts.acl.address as `0x${string}`;
    const contractAddress = FHETestAddresses.testnet as `0x${string}`;

    const existingExpiration = await getUserDecryptionDelegationExpirationDate({
      aclAddress,
      publicClient: config.publicClient,
      delegatorAddress: config.alice.account.address,
      delegateAddress: config.bob.account.address,
      contractAddress,
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
      const txHash = await delegateForUserDecryption({
        aclAddress,
        delegatorAccount: config.alice.account,
        delegateAddress: config.bob.account.address,
        contractAddress,
        durationSeconds: 86400 * 360, // a bit less than a year
        publicClient: config.publicClient,
        rpcUrl: getBaseEnv().rpcUrl,
      });
      console.log(`  Delegation tx: ${txHash}`);
    }
  });

  it("should sign a delegated decryption permit", async () => {
    const client = createFhevmDecryptClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });
    await client.ready;

    const keypair = await client.generateE2eTransportKeypair();

    // Bob signs a delegated permit to decrypt Alice's handles
    const signedPermit = await client.signDecryptionPermit({
      e2eTransportKeypair: keypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.bob.account.address,
      signer: config.bob.account,
      delegatorAddress: config.alice.account.address,
    });

    expect(signedPermit).toBeDefined();
    expect(signedPermit.isDelegated).toBe(true);
    expect(signedPermit.signerAddress.toLowerCase()).toBe(
      config.bob.account.address.toLowerCase(),
    );
    expect(signedPermit.userAddress.toLowerCase()).toBe(
      config.alice.account.address.toLowerCase(),
    );
  });

  it("should decrypt a public handle via delegated decrypt", async () => {
    const handle = publicHandles[1]!;

    const fhevm = createFhevmDecryptClient({
      chain: sepolia,
      publicClient: config.publicClient,
    });
    await fhevm.ready;

    const e2eTransportKeypair = await fhevm.generateE2eTransportKeypair();

    // Bob signs a delegated permit to decrypt Alice's handles
    const signedPermit = await fhevm.signDecryptionPermit({
      e2eTransportKeypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.bob.account.address,
      signer: config.bob.account,
      delegatorAddress: config.alice.account.address,
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
      publicClient: config.publicClient,
    });
    await client.ready;

    const e2eTransportKeypair = await client.generateE2eTransportKeypair();

    // Bob signs a delegated permit to decrypt Alice's handles
    const signedPermit = await client.signDecryptionPermit({
      e2eTransportKeypair,
      contractAddresses: [FHETestAddresses.testnet],
      durationDays: 1,
      startTimestamp: Math.floor(Date.now() / 1000),
      signerAddress: config.bob.account.address,
      signer: config.bob.account,
      delegatorAddress: config.alice.account.address,
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
