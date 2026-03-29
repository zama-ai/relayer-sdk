# Architecture

## Overview

The SDK encrypts/decrypts data using 2 WASM modules:

- **TFHE** — encryption, always multi-threaded (Web Workers + SharedArrayBuffer)
- **TKMS** — decryption, lightweight

The SDK is dual-compiled: CJS and ESM.

## Design Principles

- Order-independent, composable API
- Zero config must work
- Initialization is lazy, idempotent, and shared
- Multiple concurrent init calls are safe
- Creation is pure — no async at construction
- Extensions are reusable and composable
- Tree-shakeable: avoid loading WASM modules that aren't needed
- Throw clear errors on misconfiguration

## Runtime

- A composable `FhevmRuntime` with dynamically added modules
- Multiple runtimes can coexist (e.g. production + mock)
- Two runtimes can share the same modules
- Each module may need a CPU-intensive initialization step
- Init is always: idempotent, lazy or manual

## Clients

- A client = a runtime + additional parameters for specific features
- A runtime can be shared by multiple clients
- Clients are extensible: `client.extend(actions)` adds capabilities
- After extension, `client.init()` initializes any new modules
- If `init()` is not called, first usage triggers it automatically
- `client.ready` returns the init promise

### Client Types

```ts
createFhevmClient({ chain, provider }); // full (encrypt + decrypt)
createFhevmEncryptClient({ chain, provider }); // encrypt only
createFhevmDecryptClient({ chain, provider }); // decrypt only
createFhevmBaseClient({ chain, provider }); // empty, extend from here.
```

Partial clients can be extended to full clients:

```ts
const full = encryptClient.extend(decryptActions);
```

## WASM Loading

Two strategies:

- **URL-based (primary)**: `locateFile(filename) => URL` — fetches `.wasm` binary
- **Base64 (fallback)**: embedded base64 JS modules, dynamically imported

## Browser Requirements

Multi-threaded TFHE requires COOP/COEP headers:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

## Keys

- Encryption requires a specific public key, available to anyone. FheEncrytionKey
