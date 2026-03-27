# Relayer API Keys

The Relayer API key provides secure access to Zama's hosted Relayer service on mainnet. This guide explains how to obtain and use your API key.

## Overview

There are 2 options to access the FHEVM Relayer for mainnet deployment:

**Self-hosted Relayer:** Deploy and operate your own Relayer instance, fund your own gateway wallet, and handle transactions independently. See the [Self-host Relayer](https://github.com/zama-ai/fhevm/blob/main/relayer/docs/SELF_HOSTING.md) documentation for set-up guides and configuration references.

**Zama-hosted Relayer:** Connect to Zama's hosted Relayer using an API key for authentication. Transaction fees will be billed on a monthly basis according to the usage, with possible discounts and grants applied directly in the invoice. [Apply for an API key](https://forms.gle/jq84zEek1oiv3kBz9) to get started.

> **Note:** Before publishing the solution on mainnet, ensure that end-to-end integration has been successfully tested on testnet.

## Using Your API Key

Once you receive your API key, configure it in the Relayer SDK during initialization:

```typescript
import { createInstance, MainnetConfig } from '@zama-fhe/relayer-sdk';

const ZAMA_FHEVM_API_KEY = process.env.ZAMA_FHEVM_API_KEY; // Your Zama API key

const instance = await createInstance({
  ...MainnetConfig,
  network: 'https://ethereum-rpc.publicnode.com', // or your preferred Ethereum mainnet RPC
  auth: { __type: 'ApiKeyHeader', value: ZAMA_FHEVM_API_KEY },
});
```

_source:_ [relayer-sdk documentation](https://github.com/zama-ai/relayer-sdk/blob/main/docs/initialization.md#mainnet)

## Security Best Practices

Your API key grants access to Zama's hosted Relayer with sponsored operations. Follow these security guidelines to protect your key:

### Keep Your Key Private

- **Never expose your API key in client-side code** (frontend applications, mobile apps, etc.)
- **Never commit your API key** to version control systems
- **Never share your API key** with unauthorized parties

### Secure Implementation

The recommended approach depends on your application architecture:

- **In-browser applications**: Proxy all Relayer requests through your backend server so the API key remains server-side and never reaches the client.
- **Server-side applications**: Store the API key in environment variables and load it securely at runtime.

### Backend Proxy Pattern

Create an endpoint that forwards relayer requests and injects the API key. Store your credentials in environment variables.
The proxy must add the `x-api-key` header to every forwarded request. Your frontend never sees the key.

You can adapt this pattern to any server framework. The key requirements are:

- Forward the HTTP method, path, and body to the upstream relayer URL
- Inject the `x-api-key` header before forwarding
- Return the upstream response status and body to the client

#### Configure the SDK to use your proxy

Configure the `relayerUrl` to point to your backend endpoint rather than directly to the relayer, as described in the [initialization guide](initialization.md)

No `auth` field is needed on the client side — the proxy handles authentication transparently. The SDK sends requests to your proxy URL, and your proxy appends the API key before forwarding to the relayer.

## Compromised Keys

If you suspect your API key has been compromised:

1. **Immediately notify the Zama team** through [support@zama.org](mailto:support@zama.org).
2. **Request a new API key** from the Zama team
3. **Stop using the compromised key** in your applications

If Zama identifies that an API key has been compromised, the key holder will be notified immediately and the key may be suspended to prevent unauthorized usage.
