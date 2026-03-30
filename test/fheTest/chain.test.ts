// npx vitest run --config test/fheTest/vitest.config.ts chain

import { describe, it, expect, beforeAll } from "vitest";
import { sepolia } from "@fhevm/sdk/chains";
import {
  getEthersTestConfig,
  type FheTestEthersConfig,
} from "./ethers/setup.js";

describe("Chain — SDK chain config vs on-chain", () => {
  let config: FheTestEthersConfig;

  beforeAll(() => {
    config = getEthersTestConfig();
  });

  it("should import sepolia chain definition from @fhevm/sdk/chains", () => {
    expect(sepolia).toBeDefined();
    expect(sepolia.id).toBe(11_155_111);
  });

  it("should match ACL address", async () => {
    const coprocessorConfig = await config.fheTestContract.getFunction(
      "getCoprocessorConfig",
    )();
    const [aclAddress] = coprocessorConfig;
    console.log(`  On-chain ACL: ${aclAddress}`);
    console.log(`  SDK ACL:      ${sepolia.fhevm.contracts.acl.address}`);
    expect(aclAddress.toLowerCase()).toBe(
      sepolia.fhevm.contracts.acl.address.toLowerCase(),
    );
  });

  it("should match KMS Verifier address", async () => {
    const coprocessorConfig = await config.fheTestContract.getFunction(
      "getCoprocessorConfig",
    )();
    const [, , kmsVerifierAddress] = coprocessorConfig;
    console.log(`  On-chain KMS Verifier: ${kmsVerifierAddress}`);
    console.log(
      `  SDK KMS Verifier:      ${sepolia.fhevm.contracts.kmsVerifier.address}`,
    );
    expect(kmsVerifierAddress.toLowerCase()).toBe(
      sepolia.fhevm.contracts.kmsVerifier.address.toLowerCase(),
    );
  });
});
