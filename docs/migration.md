# Migration from `@zama-fhe/relayer-sdk`

This guide helps you migrate from the old SDK (`@zama-fhe/relayer-sdk` v0.4.x) to the new SDK (`@fhevm/sdk`). The new SDK is a complete rewrite with a different API, but the concepts are the same.

## Overview of changes

| What changed | Old SDK (`@zama-fhe/relayer-sdk`) | New SDK (`@fhevm/sdk`) |
| --- | --- | --- |
| Package name | `@zama-fhe/relayer-sdk` | `@fhevm/sdk` |
| Entry points | `/web`, `/node`, `/bundle` | `/ethers`, `/viem`, `/chains` |
| Initialization | `initSDK()` + `createInstance(config)` | `setFhevmRuntimeConfig()` + `createFhevmClient({ chain, provider })` |
| Configuration | Flat config object (`SepoliaConfig`) | Chain definitions (`sepolia` from `@fhevm/sdk/chains`) |
| Encryption | Builder pattern: `.add32(42).encrypt()` | Declarative: `encrypt({ values: [{ type: "uint32", value: 42 }] })` — extraData auto-fetched |
| Key generation | `generateKeypair()` → raw `{ publicKey, privateKey }` | `generateE2eTransportKeyPair()` → opaque `E2eTransportKeyPair` |
| EIP-712 creation | Positional args: `createEIP712(key, addrs, start, days)` | Object: `createDecryptPermit({ e2eTransportPublicKey, contractAddresses, ... })` — extraData auto-fetched |
| Decrypt | 9 positional args | Object: `decrypt({ e2eTransportKeyPair, encryptedValues, signedPermit })` |
| Read public values | `publicDecrypt(handles)` → `{ clearValues }` | `readPublicValue([values])` → `PublicDecryptionProof` with `.values` |
| Provider | Passed in config as `network` | Passed directly as `provider` |
| Framework support | Framework-agnostic (single entry) | Explicit adapters (`/ethers`, `/viem`) |

---

## Step 1: Update imports

**Before:**

```ts
import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/web";
```

**After:**

```ts
import { setFhevmRuntimeConfig, createFhevmClient } from "@fhevm/sdk/ethers"; // or "@fhevm/sdk/viem"
import { sepolia } from "@fhevm/sdk/chains";
```

The new SDK has separate imports for ethers.js and viem. Choose the one matching your project. The APIs are identical — only the provider type differs.

---

## Step 2: Replace initialization

**Before:**

```ts
await initSDK();

const instance = await createInstance({
  ...SepoliaConfig,
  network: provider, // or a URL string
});
```

**After:**

```ts
setFhevmRuntimeConfig({ numberOfThreads: 4 }); // optional config

const client = createFhevmClient({
  chain: sepolia,
  provider, // ethers Provider or viem PublicClient
});
```

Key differences:
- `setFhevmRuntimeConfig()` replaces `initSDK()`. It's synchronous and configures WASM threading/logging.
- `createFhevmClient()` replaces `createInstance()`. It's also synchronous — no `await` needed. WASM loads lazily on first use.
- Chain config is a pre-built object (`sepolia`, `mainnet`) instead of a flat config. No more `chainId`, `gatewayChainId`, `aclContractAddress`, etc. — the chain object has all of it.

---

## Step 3: Migrate encryption

This is the biggest API change. The old builder pattern is replaced by a declarative object.

**Before:**

```ts
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add32(42);
input.add8(100);
input.addBool(true);
const { handles, inputProof } = await input.encrypt();
```

**After:**

```ts
const proof = await client.encrypt({
  contractAddress,
  userAddress,
  values: [
    { type: "uint32", value: 42 },
    { type: "uint8", value: 100 },
    { type: "bool", value: true },
  ],
});

const handles = proof.encryptedInputs;
const inputProof = proof.inputProof;
```

Key differences:
- The public encryption key is fetched and cached automatically on first `encrypt()` call. If you want to control when the ~50MB download happens (for example, behind a loading spinner), call `await client.init()` at app startup.
- Values are declared as an array of `{ type, value }` objects instead of chained `.add*()` calls.
- Type names use Solidity conventions: `"uint32"`, `"bool"`, `"address"` (not `add32`, `addBool`, `addAddress`).
- The result is a `VerifiedInputProof` with structured handles (`proof.encryptedInputs`) instead of raw `Uint8Array[]`.

---

## Step 4: Migrate key generation

**Before:**

```ts
const { publicKey, privateKey } = instance.generateKeypair();
// publicKey and privateKey are hex strings
```

**After:**

```ts
const e2eTransportKeyPair = await client.generateE2eTransportKeyPair();
const publicKey = await e2eTransportKeyPair.getTkmsPublicKeyHex();
// privateKey is hidden inside the key pair — never exposed
```

The new SDK wraps the private key in an opaque `E2eTransportKeyPair` object. You can't access the raw private key directly — this prevents accidental exposure. The key pair is what you pass to `decrypt()`.

---

## Step 5: Migrate EIP-712 permit creation

**Before:**

```ts
const eip712 = instance.createEIP712(
  publicKey,           // string
  contractAddresses,   // string[]
  startTimestamp,      // number
  durationDays,        // number
);
```

**After:**

```ts
const permit = await client.createDecryptPermit({
  e2eTransportPublicKey: await e2eTransportKeyPair.getTkmsPublicKeyHex(),
  contractAddresses: ["0xContractA..."],
  startTimestamp: Math.floor(Date.now() / 1000),
  durationDays: 7,
});
```

Key differences:
- Named parameters instead of positional (no more guessing argument order).
- `extraData` is auto-fetched — you don't need to provide it.
- The function name changed from `createEIP712` to `createDecryptPermit`.
- The signing step is unchanged — you still call `signer.signTypedData()` with the domain, types, and message.

---

## Step 6: Migrate decryption

**Before:**

```ts
const results = await instance.userDecrypt(
  handleContractPairs,  // HandleContractPair[]
  privateKey,           // string
  publicKey,            // string
  signature,            // string
  contractAddresses,    // string[]
  userAddress,          // string
  startTimestamp,       // number
  durationDays,         // number
);
// results is a Record<handle, value>
```

**After:**

```ts
import { createSignedPermit } from "@fhevm/sdk";

const signedPermit = createSignedPermit(permit, signature, userAddress);

const results = await client.decrypt({
  e2eTransportKeyPair,
  encryptedValues: [
    { encrypted: "0x...", contractAddress: "0xContractA..." },
  ],
  signedPermit,
});
// results is DecryptedFhevmHandle[] with typed values
```

Key differences:
- Named parameters instead of 9 positional arguments.
- Pass the `e2eTransportKeyPair` object instead of separate `privateKey` + `publicKey` strings.
- Bundle the permit and signature into a reusable `SignedPermit` via `createSignedPermit()`.
- The result is a typed array (`DecryptedFhevmHandle[]`) instead of a plain `Record`. Each entry has `.value` (typed correctly as `number`, `bigint`, `boolean`, or `string`) and `.fheType`.

---

## Step 7: Migrate reading public values

**Before:**

```ts
const { clearValues, decryptionProof } = await instance.publicDecrypt(handles);
// clearValues is Record<handle, bigint | boolean | string>
```

**After:**

```ts
const result = await client.readPublicValue([handle1, handle2]);

const values = result.values;
// values[0].value — typed correctly
// values[0].fheType — "euint32", "ebool", etc.
```

Key differences:
- Pass handles as an array directly — no object wrapper needed.
- `extraData` is auto-fetched — you don't need to provide it.
- Results are ordered `DecryptedFhevmHandle[]` via `result.values` instead of a handle-keyed record.

---

## Step 8: Migrate decrypting on behalf of

**Before:**

```ts
const eip712 = instance.createDelegatedUserDecryptEIP712(
  publicKey, contractAddresses, delegatorAddress, startTimestamp, durationDays,
);

const results = await instance.delegatedUserDecrypt(
  handleContractPairs, privateKey, publicKey, signature,
  contractAddresses, delegatorAddress, delegateAddress,
  startTimestamp, durationDays,
);
```

**After:**

```ts
const permit = await client.createDecryptPermit({
  e2eTransportPublicKey: await e2eTransportKeyPair.getTkmsPublicKeyHex(),
  contractAddresses: ["0xContract..."],
  startTimestamp: Math.floor(Date.now() / 1000),
  durationDays: 1,
  onBehalfOf: "0xDataOwnerAddress...",
});
```

Same flow as regular decryption — `onBehalfOf` replaces the separate function. ExtraData is auto-fetched.

---

## Removed APIs

These old SDK APIs have no direct equivalent in the new SDK:

| Old API | What to do instead |
| --- | --- |
| `instance.getPublicKey()` | Use `client.fetchGlobalFhePkeParams()` |
| `instance.getPublicParams(bits)` | Use `client.fetchGlobalFhePkeParamsBytes()` |
| `instance.config` | Access `client.chain` for chain info |
| `instance.requestZKProofVerification()` | Built into `client.encrypt()` automatically |
| `initSDK({ tfheParams, kmsParams })` | Use `setFhevmRuntimeConfig({ locateFile })` for custom WASM paths |

---

## Full before/after example

**Before (old SDK):**

```ts
import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/web";

await initSDK();
const instance = await createInstance({ ...SepoliaConfig, network: provider });

// Encrypt
const input = instance.createEncryptedInput(contractAddr, userAddr);
input.add32(42);
input.add8(100);
const { handles, inputProof } = await input.encrypt();

// User decrypt
const { publicKey, privateKey } = instance.generateKeypair();
const eip712 = instance.createEIP712(publicKey, [contractAddr], startTs, 7);
const sig = await signer.signTypedData(eip712.domain, eip712.types, eip712.message);
const results = await instance.userDecrypt(
  [{ handle, contractAddress: contractAddr }],
  privateKey, publicKey, sig,
  [contractAddr], userAddr, startTs, 7,
);
```

**After (new SDK):**

```ts
import { setFhevmRuntimeConfig, createFhevmClient, createSignedPermit } from "@fhevm/sdk/ethers";
import { sepolia } from "@fhevm/sdk/chains";

setFhevmRuntimeConfig({});
const client = createFhevmClient({ chain: sepolia, provider });

// Encrypt
const proof = await client.encrypt({
  contractAddress: contractAddr,
  userAddress: userAddr,
  values: [
    { type: "uint32", value: 42 },
    { type: "uint8", value: 100 },
  ],
});

// Decrypt
const e2eTransportKeyPair = await client.generateE2eTransportKeyPair();
const permit = await client.createDecryptPermit({
  e2eTransportPublicKey: await e2eTransportKeyPair.getTkmsPublicKeyHex(),
  contractAddresses: [contractAddr],
  startTimestamp: startTs,
  durationDays: 7,
});
const sig = await signer.signTypedData(permit.domain, permit.types, permit.message);
const signedPermit = createSignedPermit(permit, sig, userAddr);
const results = await client.decrypt({
  e2eTransportKeyPair,
  encryptedValues: [{ encrypted: handle, contractAddress: contractAddr }],
  signedPermit,
});
```
