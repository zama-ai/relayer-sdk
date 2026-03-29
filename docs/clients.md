# Clients

A **client** is your main interface to the SDK. You create one, and it gives you methods like `encrypt()`, `readPublicValue()`, and `decrypt()`. Each client is bound to a specific chain and provider.

The SDK offers three client types so you only load the WASM modules you actually need.

## Which client should I use?

| If you need to... | Use this | WASM loaded |
| --- | --- | --- |
| Encrypt **and** decrypt | `createFhevmClient()` | TFHE (~5MB) + TKMS (~600KB) |
| Only encrypt (e.g., a form submission page) | `createFhevmEncryptClient()` | TFHE (~5MB) only |
| Only decrypt (e.g., a results page) | `createFhevmDecryptClient()` | TKMS (~600KB) only |

**Why does this matter?** WASM modules are large. If your page only decrypts results, there's no reason to download the 5MB encryption module. Using the right client type makes your app load faster.

Methods that don't belong to your client type are **compile-time errors** — TypeScript catches them before your code runs.

## Creating a client

All client factories take the same parameters: a `chain` definition and a `provider` (your Ethereum connection).

### Full client

Use when your page needs both encryption and decryption.

**With viem:**

```ts
import { setFhevmRuntimeConfig, createFhevmClient } from "@fhevm/sdk/viem";
import { sepolia } from "@fhevm/sdk/chains";
import { createPublicClient, http } from "viem";
import { sepolia as viemSepolia } from "viem/chains";

// Configure once at app startup
setFhevmRuntimeConfig({ numberOfThreads: 4 });

// Create your provider
const provider = createPublicClient({
  chain: viemSepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});

// Create the FHEVM client
const client = createFhevmClient({ chain: sepolia, provider });
```

**With ethers.js:**

```ts
import { setFhevmRuntimeConfig, createFhevmClient } from "@fhevm/sdk/ethers";
import { sepolia } from "@fhevm/sdk/chains";
import { ethers } from "ethers";

setFhevmRuntimeConfig({ numberOfThreads: 4 });

const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const client = createFhevmClient({ chain: sepolia, provider });
```

### Encrypt-only client

Use when you only need to submit encrypted data — no decryption needed on this page.

```ts
import { createFhevmEncryptClient } from "@fhevm/sdk/viem"; // or "@fhevm/sdk/ethers"

const client = createFhevmEncryptClient({ chain: sepolia, provider });

await client.encrypt({ ... });           // ✓ works
await client.decrypt({ ... });           // ✗ compile-time error
```

### Decrypt-only client

Use when you only need to read encrypted results — no new encryption needed.

```ts
import { createFhevmDecryptClient } from "@fhevm/sdk/viem"; // or "@fhevm/sdk/ethers"

const client = createFhevmDecryptClient({ chain: sepolia, provider });

await client.readPublicValue([...]);      // ✓ works
await client.decrypt({ ... });           // ✓ works
await client.encrypt({ ... });           // ✗ compile-time error
```

## When does WASM load?

WASM modules load **lazily** — not when you create the client, but the first time you call an action that needs them:

- First `encrypt()` call → loads TFHE WASM (~5MB) + fetches the network's public key (~50MB)
- First `decrypt()` call → loads TKMS WASM (~600KB)

If you want to load WASM eagerly (for example, behind a loading spinner at app startup), call:

```ts
await client.init();
// or equivalently:
await client.ready;
```

## Available methods

### `FhevmClient` (full client)

| Method | Sync/Async | What it does |
| --- | --- | --- |
| `encrypt(params)` | async | Encrypt values and get a verified input proof |
| `fetchGlobalFhePkeParams(params?)` | async | Fetch the network's public encryption parameters |
| `fetchGlobalFhePkeParamsBytes(params?)` | async | Same as above, but returns raw bytes |
| `readPublicValue(encryptedValues)` | async | Read publicly readable encrypted values |
| `decrypt(params)` | async | Decrypt private encrypted values with a signed permit |
| `createDecryptPermit(params)` | async | Build the EIP-712 message for a decrypt permit (auto-fetches extraData). Pass `onBehalfOf` to decrypt on behalf of another user. |
| `generateE2eTransportKeyPair()` | async | Generate a new E2E transport key pair for decryption |
| `loadE2eTransportKeyPair(params)` | async | Restore a key pair from serialized bytes |
| `getExtraData(params)` | async | Get protocol context data (extraData) |
| `deserializeGlobalFhePkeParamsFromHex(params)` | async | Restore cached public key parameters from hex |
| `serializeGlobalFhePkeParamsToHex(params)` | async | Serialize public key parameters for caching |
| `resolveGlobalFhePkeParams(params)` | async | Fetch or use cached public key parameters |

### `FhevmEncryptClient`

Has all the encrypt and public-key-parameter methods from the table above. Does **not** have decrypt methods.

### `FhevmDecryptClient`

Has all the decrypt methods from the table above. Does **not** have encrypt methods.

## Client properties

Every client exposes these read-only properties:

| Property | Type | What it is |
| --- | --- | --- |
| `chain` | `FhevmChain` | The chain definition this client is bound to |
| `runtime` | `FhevmRuntime` | The runtime with its loaded modules |
| `uid` | `string` | A unique ID for this client instance |

## Standalone functions vs. client methods

Every action is available in two forms:

```ts
import { encrypt, publicDecrypt } from "@fhevm/sdk";

// As a standalone function — pass the client as the first argument
const proof = await encrypt(client, { ... });
const result = await publicDecrypt(client, { encryptedValues: [...] });

// As a client method — the client is implicit
const proof = await client.encrypt({ ... });
const result = await client.readPublicValue([...]);
```

Both are equivalent. Standalone functions are **tree-shakable** — bundlers can eliminate unused functions from your bundle. Client methods are more convenient for everyday use.
