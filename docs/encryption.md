# Encryption

Encryption is how you get data into an FHEVM smart contract. You take plaintext values (like a number or a boolean), encrypt them client-side, and send the encrypted inputs + a proof to your contract. The contract can then operate on these values while they stay encrypted.

## What happens when you encrypt

1. The SDK downloads the network's **public encryption key** (~50MB, cached after first fetch)
2. Your values are encrypted using **TFHE** (a homomorphic encryption scheme) inside a WASM module
3. A **zero-knowledge proof** is generated proving the encryption was done correctly
4. The proof is sent to the **Relayer**, which returns coprocessor signatures
5. You get back a `VerifiedInputProof` containing encrypted handles and the proof bytes to pass to your contract

## Supported types

You specify types using Solidity-style names (`"uint32"`, `"bool"`, `"address"`):

| Type | Accepts | Value range | Encrypted bits |
| --- | --- | --- | --- |
| `"bool"` | `boolean`, `number`, `bigint` | `true`/`false` | 2 |
| `"uint8"` | `number`, `bigint` | 0–255 | 8 |
| `"uint16"` | `number`, `bigint` | 0–65,535 | 16 |
| `"uint32"` | `number`, `bigint` | 0–4,294,967,295 | 32 |
| `"uint64"` | `number`, `bigint` | 0–2^64-1 | 64 |
| `"uint128"` | `number`, `bigint` | 0–2^128-1 | 128 |
| `"uint256"` | `number`, `bigint` | 0–2^256-1 | 256 |
| `"address"` | `string` | Ethereum address | 160 |

**Capacity limit:** A single `encrypt()` call can hold at most **2048 encrypted bits** total. For example, you could encrypt 32 `uint64` values (32 x 64 = 2048), or 64 `uint32` values (64 x 32 = 2048). The SDK validates this before making any network calls.

## Basic usage

Call `encrypt()` with the values you want to encrypt. The SDK automatically fetches and caches the network's public encryption key (~50MB) on first use. Protocol context data (`extraData`) is fetched automatically — you don't need to provide it.

```ts
const encrypted = await client.encrypt({
  contractAddress: "0xYourContract...",
  userAddress: "0xYourWallet...",
  values: [
    { type: "uint32", value: 100 },
    { type: "bool", value: true },
    { type: "address", value: "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01" },
    { type: "uint256", value: 12345678901234567890n },
  ],
});
```

The first `encrypt()` call downloads the public key and initializes the TFHE WASM module. Subsequent calls reuse the cached key. If you want to control when this download happens (for example, behind a loading spinner), call `await client.init()` at app startup.

## Using the encrypted result

The `encrypt()` call returns a `VerifiedInputProof` with everything you need to pass to your smart contract:

```ts
encrypted.inputProof           // The encoded proof — pass this to your contract
encrypted.encryptedInputs      // One encrypted value per input, in the same order
encrypted.coprocessorSignatures  // Signatures proving the Relayer verified the proof
encrypted.verified             // Always true (the SDK already verified it)
```

Each value in `encryptedInputs` corresponds to one of your input values, in order:

```ts
const encryptedValue0 = encrypted.encryptedInputs[0]; // corresponds to { type: "uint32", value: 100 }
encryptedValue0.fheType;     // "euint32"
encryptedValue0.bytes32Hex;  // the 32-byte encrypted value as a hex string
encryptedValue0.index;       // 0 (position in the proof)
```

## Step-by-step encryption

The `encrypt()` method is a convenience wrapper that combines two lower-level steps. If you need more control (for example, to separate ZK proof generation from Relayer submission), you can use them individually:

### 1. Generate ZK proof

This step runs TFHE WASM to encrypt your values and generate a zero-knowledge proof. It's CPU-intensive and triggers WASM initialization on first call. Unlike `encrypt()`, you must explicitly pass the public encryption parameters.

```ts
import { generateZkProof, fetchGlobalFhePkeParams } from "@fhevm/sdk";

const params = await fetchGlobalFhePkeParams(client, {});

const zkProof = await generateZkProof(client, {
  globalFhePublicEncryptionParams: params,
  contractAddress: "0xYourContract...",
  userAddress: "0xYourWallet...",
  values: [{ type: "uint32", value: 42 }],
});
```

### 2. Fetch verified input proof

This step sends the ZK proof to the Relayer, which verifies it and returns coprocessor signatures and the final encrypted values. Protocol context data (`extraData`) is fetched automatically.

```ts
import { fetchVerifiedInputProof } from "@fhevm/sdk";

const proof = await fetchVerifiedInputProof(client, {
  zkProof,
});
```

## Serializing public key parameters

If you want to cache the public encryption parameters (e.g., in localStorage or a CDN) instead of re-downloading them each time, you can serialize and deserialize them:

```ts
// Serialize to a hex string for storage
const hex = await client.serializeGlobalFhePkeParamsToHex({
  globalFhePkeParams: params,
});

// Later, restore from hex
const restored = await client.deserializeGlobalFhePkeParamsFromHex({
  globalFhePkeParamsBytesHex: hex,
});
```

Standalone functions for byte-level serialization are also available:

```ts
import {
  serializeGlobalFhePkeParams,
  deserializeGlobalFhePkeParams,
} from "@fhevm/sdk";

const bytes = await serializeGlobalFhePkeParams(client, { globalFhePkeParams: params });
const restored = await deserializeGlobalFhePkeParams(client, { globalFhePkeParamsBytes: bytes });
```

## Cache management

`fetchGlobalFhePkeParams()` and `fetchGlobalFhePkeParamsBytes()` automatically cache results by Relayer URL. You can manage the cache manually:

```ts
import {
  clearGlobalFhePkeParamsCache,
  deleteGlobalFhePkeParamsCache,
} from "@fhevm/sdk";

// Clear the entire cache
clearGlobalFhePkeParamsCache();

// Remove a specific chain's cached parameters
deleteGlobalFhePkeParamsCache("https://relayer.mainnet.zama.org");
```
