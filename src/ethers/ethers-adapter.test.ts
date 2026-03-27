import { describe, it, expect, beforeAll } from "vitest";
import { ethers } from "ethers";
import {
  setFhevmRuntimeConfig,
  createFhevmClient,
  createFhevmEncryptClient,
  createFhevmDecryptClient,
  createSignedPermit,
} from "./index.js";
import { decryptActions } from "./clients/createFhevmDecryptClient.js";
import { sepolia } from "../core/chains/index.js";
import { toFhevmHandle } from "../core/handle/FhevmHandle.js";
import { asBytesHex } from "../core/base/bytes.js";
import type { Bytes65Hex } from "../core/types/primitives.js";

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const CONTRACT_ADDRESS = "0x1E7eA8fE4877E6ea5dc8856f0dA92da8d5066241";

function makeProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

describe("ethers adapter", () => {
  beforeAll(() => {
    setFhevmRuntimeConfig({
      numberOfThreads: 4,
      logger: {
        debug: (_msg: string) => {},
        error: (_msg: string, _cause: unknown) => {},
      },
    });
  });

  // ── Client creation ───────────────────────────────────────────────────

  it("should create a full client with createFhevmClient()", () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    expect(client.uid).toBeDefined();
    expect(typeof client.encrypt).toBe("function");
    expect(typeof client.decrypt).toBe("function");
    expect(typeof client.readPublicValue).toBe("function");
    expect(typeof client.createDecryptPermit).toBe("function");

    expect(typeof client.fetchGlobalFhePkeParams).toBe("function");
  });

  it("should create an encrypt client with createFhevmEncryptClient()", () => {
    const provider = makeProvider();
    const client = createFhevmEncryptClient({ chain: sepolia, provider });

    expect(client.uid).toBeDefined();
    expect(typeof client.encrypt).toBe("function");
    expect(typeof client.fetchGlobalFhePkeParams).toBe("function");
  });

  it("should create a decrypt client with createFhevmDecryptClient()", () => {
    const provider = makeProvider();
    const client = createFhevmDecryptClient({ chain: sepolia, provider });

    expect(client.uid).toBeDefined();
    expect(typeof client.decrypt).toBe("function");
    expect(typeof client.readPublicValue).toBe("function");
    expect(typeof client.createDecryptPermit).toBe("function");

  });

  // ── Lazy init / manual init ───────────────────────────────────────────

  it("should expose init() and ready on createFhevmClient()", () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    expect(typeof client.init).toBe("function");
    expect(client.ready).toBeInstanceOf(Promise);
  });

  it("should expose init() and ready on createFhevmEncryptClient()", () => {
    const provider = makeProvider();
    const client = createFhevmEncryptClient({ chain: sepolia, provider });

    expect(typeof client.init).toBe("function");
    expect(client.ready).toBeInstanceOf(Promise);
  });

  it("should expose init() and ready on createFhevmDecryptClient()", () => {
    const provider = makeProvider();
    const client = createFhevmDecryptClient({ chain: sepolia, provider });

    expect(typeof client.init).toBe("function");
    expect(client.ready).toBeInstanceOf(Promise);
  });

  it("should return the same promise for multiple init() calls", () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    const p1 = client.init();
    const p2 = client.init();
    expect(p1).toBe(p2);
  });

  it("should return the same promise from ready and init()", () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    const p1 = client.ready;
    const p2 = client.init();
    expect(p1).toBe(p2);
  });

  // ── Extend ────────────────────────────────────────────────────────────

  it("should expose extend() on all client types", () => {
    const provider = makeProvider();

    const full = createFhevmClient({ chain: sepolia, provider });
    expect(typeof full.extend).toBe("function");

    const encrypt = createFhevmEncryptClient({ chain: sepolia, provider });
    expect(typeof encrypt.extend).toBe("function");

    const decrypt = createFhevmDecryptClient({ chain: sepolia, provider });
    expect(typeof decrypt.extend).toBe("function");
  });

  // ── Unique UIDs ───────────────────────────────────────────────────────

  it("should generate unique UIDs for each client", () => {
    const provider = makeProvider();

    const c1 = createFhevmClient({ chain: sepolia, provider });
    const c2 = createFhevmClient({ chain: sepolia, provider });
    expect(c1.uid).not.toBe(c2.uid);
  });

  // ── Chain binding ─────────────────────────────────────────────────────

  it("should bind chain to the client", () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    expect(client.chain).toBe(sepolia);
  });

  // ── EIP-712 permit ────────────────────────────────────────────────────

  it("should create an EIP-712 user decryption permit", async () => {
    const provider = makeProvider();
    const client = createFhevmDecryptClient({ chain: sepolia, provider });

    const eip712 = await client.createDecryptPermit({
      e2eTransportPublicKey: "0x" + "ab".repeat(32),
      contractAddresses: [CONTRACT_ADDRESS],
      startTimestamp: Math.floor(Date.now() / 1000),
      durationDays: 1,
    });

    expect(eip712.domain).toBeDefined();
    expect(eip712.domain.name).toBe("Decryption");
    expect(eip712.domain.version).toBe("1");
    expect(eip712.types).toBeDefined();
    expect(eip712.message).toBeDefined();
  });

  // ── Extend encrypt client with decrypt ──────────────────────────────

  it("should extend an encrypt-only client with decrypt capabilities", () => {
    const provider = makeProvider();
    const encryptClient = createFhevmEncryptClient({ chain: sepolia, provider });

    // Encrypt client should not have decrypt methods
    expect((encryptClient as Record<string, unknown>).userDecrypt).toBeUndefined();
    expect((encryptClient as Record<string, unknown>).publicDecrypt).toBeUndefined();

    // Extend with decrypt actions
    const fullClient = encryptClient.extend(decryptActions);

    // Now has both encrypt and decrypt methods
    expect(typeof fullClient.encrypt).toBe("function");
    expect(typeof fullClient.decrypt).toBe("function");
    expect(typeof fullClient.readPublicValue).toBe("function");
    expect(typeof fullClient.createDecryptPermit).toBe("function");
    expect(typeof fullClient.generateE2eTransportKeyPair).toBe("function");

    // Still the same client instance (extend mutates)
    expect(fullClient.uid).toBe(encryptClient.uid);
  });

  // ── Runtime actions ───────────────────────────────────────────────────

  it("should fetch global FHE public encryption parameters", async () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    const params = await client.fetchGlobalFhePkeParams();
    expect(params).toBeDefined();
  });

  it("should fetch, serialize, and deserialize global FHE PKE params", async () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    const params = await client.fetchGlobalFhePkeParams();
    expect(params).toBeDefined();

    const hex = await client.serializeGlobalFhePkeParamsToHex(params);
    expect(typeof hex).toBe("object");
    expect(hex.publicKeyBytesHex).toBeDefined();
    expect(hex.crsBytesHex).toBeDefined();

    const deserialized = await client.deserializeGlobalFhePkeParamsFromHex(hex);
    expect(deserialized).toBeDefined();
  });

  it("should encrypt values without explicit params (auto-resolve)", { timeout: 30_000 }, async () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    const proof = await client.encrypt({
      contractAddress: CONTRACT_ADDRESS,
      userAddress: "0x1DD7DdE99570E70E35573dC2017B28c280A978Da",
      values: [
        { type: "uint32", value: 42 },
        { type: "bool", value: true },
      ],
    });

    expect(proof.encryptedInputs).toHaveLength(2);
    expect(proof.encryptedInputs[0]?.fheType).toBe("euint32");
    expect(proof.encryptedInputs[1]?.fheType).toBe("ebool");
    expect(proof.inputProof.length).toBeGreaterThan(0);
  });

  // ── Encrypt via encrypt-only client ───────────────────────────────────

  it("should encrypt using createFhevmEncryptClient()", { timeout: 30_000 }, async () => {
    const provider = makeProvider();
    const client = createFhevmEncryptClient({ chain: sepolia, provider });

    const proof = await client.encrypt({
      contractAddress: CONTRACT_ADDRESS,
      userAddress: "0x1DD7DdE99570E70E35573dC2017B28c280A978Da",
      values: [{ type: "uint32", value: 100 }],
    });

    expect(proof.encryptedInputs).toHaveLength(1);
    expect(proof.encryptedInputs[0]?.fheType).toBe("euint32");
    expect(proof.inputProof.length).toBeGreaterThan(0);
  });

  // ── Public decrypt (TODO #10) ─────────────────────────────────────────

  it("should public-decrypt known testnet handles", { timeout: 60_000 }, async () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    const handles = [
      toFhevmHandle("0xf1673094de7c833604f1b62183cbcdf2cdc968db90ff0000000000aa36a70400"),
      toFhevmHandle("0x9797f8eb707b0a32c47a80ea86c0648df36bfe7cd0ff0000000000aa36a70300"),
      toFhevmHandle("0x6f17228bda73a5e57b94511c5bab2665e6a2870399ff0000000000aa36a70200"),
      toFhevmHandle("0xf6751d547a5c06123575aad93f22f76b7d841c4cacff0000000000aa36a70000"),
    ];

    const result = await client.readPublicValue(handles);

    expect(result.values).toHaveLength(4);

    const expected = [
      { fheType: "euint32", value: 1083783185 },
      { fheType: "euint16", value: 15764 },
      { fheType: "euint8", value: 171 },
      { fheType: "ebool", value: false },
    ];

    for (let i = 0; i < expected.length; i++) {
      const d = result.values[i];
      expect(d).toBeDefined();
      expect(d?.fheType).toBe(expected[i]?.fheType);
      expect(d?.value).toBe(expected[i]?.value);
    }
  });

  // ── Public decrypt via decrypt-only client (TODO #10) ─────────────────

  it("should public-decrypt using createFhevmDecryptClient()", { timeout: 60_000 }, async () => {
    const provider = makeProvider();
    const client = createFhevmDecryptClient({ chain: sepolia, provider });

    const handles = [
      toFhevmHandle("0xf6751d547a5c06123575aad93f22f76b7d841c4cacff0000000000aa36a70000"),
    ];

    const result = await client.readPublicValue(handles);

    expect(result.values).toHaveLength(1);
    expect(result.values[0]?.fheType).toBe("ebool");
    expect(result.values[0]?.value).toBe(false);
  });

  // ── getExtraData ──────────────────────────────────────────────────────

  it("should get extraData for KMS context", async () => {
    const provider = makeProvider();
    const client = createFhevmClient({ chain: sepolia, provider });

    const extraData = await client.getExtraData({});
    expect(extraData).toBeDefined();
    expect(typeof extraData).toBe("string");
    expect(extraData.startsWith("0x")).toBe(true);
    // Currently returns "0x00" as default
    expect(extraData).toBe("0x00");
  });

  // ── createSignedPermit utility ────────────────────────────────────────

  it("should create a signed permit with createSignedPermit()", async () => {
    const provider = makeProvider();
    const client = createFhevmDecryptClient({ chain: sepolia, provider });

    const permit = await client.createDecryptPermit({
      e2eTransportPublicKey: "0x" + "ab".repeat(32),
      contractAddresses: [CONTRACT_ADDRESS],
      startTimestamp: Math.floor(Date.now() / 1000),
      durationDays: 1,
    });

    const mockSignature = "0x" + "ff".repeat(65) as Bytes65Hex;
    const mockSigner = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

    const signedPermit = createSignedPermit(permit, mockSignature, mockSigner);

    expect(signedPermit.permit).toBe(permit);
    expect(signedPermit.signature).toBe(mockSignature);
    expect(signedPermit.signer).toBe(mockSigner);
  });

  // ── Delegated decrypt permit with onBehalfOf ─────────────────────────

  it("should create a delegated decrypt permit with onBehalfOf", async () => {
    const provider = makeProvider();
    const client = createFhevmDecryptClient({ chain: sepolia, provider });

    const permit = await client.createDecryptPermit({
      e2eTransportPublicKey: "0x" + "ab".repeat(32),
      contractAddresses: [CONTRACT_ADDRESS],
      startTimestamp: Math.floor(Date.now() / 1000),
      durationDays: 1,
      onBehalfOf: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    });

    expect(permit.domain).toBeDefined();
    expect(permit.types).toBeDefined();
    expect(permit.message).toBeDefined();
    // Delegated permit uses different primary type
    expect(permit.primaryType).toBe("DelegatedUserDecryptRequestVerification");
  });

  // ── E2E transport key pair serialization/loading ──────────────────────

  it("should serialize and load E2E transport key pair", async () => {
    const provider = makeProvider();
    const client = createFhevmDecryptClient({ chain: sepolia, provider });

    // Generate a key pair
    const keyPair = await client.generateE2eTransportKeyPair();
    expect(keyPair).toBeDefined();
    const publicKey = await keyPair.getTkmsPublicKeyHex();
    expect(typeof publicKey).toBe("string");

    // Serialize it
    const serialized = await keyPair.serialize();
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe("string");

    // Load it back
    const loaded = await client.loadE2eTransportKeyPair({
      tkmsPrivateKeyBytes: serialized,
    });
    expect(loaded).toBeDefined();
    const loadedPublicKey = await loaded.getTkmsPublicKeyHex();
    expect(loadedPublicKey).toBe(publicKey);
  });

});
