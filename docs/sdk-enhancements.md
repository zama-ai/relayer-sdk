# SDK Enhancements in v0.4.0-alpha.2

## Overview

SDK v0.4.0-alpha.2 introduces several enhancements including a new ZK proof verification API, enhanced instance methods, and method renames for improved clarity.

**For HTTP API V2 migration guide, see [Migrating to HTTP API V2](./migrating_to_v2.md).**

**For CLI tools reference, see [CLI Reference](./cli-reference.md).**

---

## Contents

- [ZK Proof Verification](#zk-proof-verification)
- [Enhanced Instance Methods](#enhanced-instance-methods)
- [Method Renames](#method-renames)
- [Advanced Utilities](#advanced-utilities)

---

## ZK Proof Verification

The SDK provides a dedicated API for verifying Zero-Knowledge proofs, enabling privacy-preserving computation workflows where proofs are generated client-side and verified before blockchain submission.

### When to Use

Use `requestZKProofVerification()` when you need to:

- Generate ZK proofs client-side using your own ZK proof system
- Verify proofs server-side before submitting to the blockchain
- Obtain encrypted handles and input proofs for contract interactions
- Implement privacy-preserving workflows with verifiable computation

### API Signature

```typescript
requestZKProofVerification(
  zkProof: ZKProof,
  options?: RelayerV2InputProofOptions
): Promise<{
  handles: Uint8Array[];
  inputProof: Uint8Array;
}>
```

**Parameters:**

- `zkProof`: Your Zero-Knowledge proof object
- `options`: Optional configuration including authentication

**Returns:**

- `handles`: Array of encrypted handles for use in contract calls
- `inputProof`: Input proof bytes for blockchain verification

### Basic Example

```typescript
import { createInstance } from '@zama-ai/relayer-sdk';

// Create instance with V2 API
const instance = await createInstance({
  relayerUrl: 'https://relayer.testnet.zama.org/v2',
  gatewayUrl: 'https://gateway.testnet.zama.org',
});

// Prepare your ZK proof
const zkProof = {
  // Your ZK proof structure
  proof: proofData,
  publicInputs: publicInputs,
  // ... other proof fields
};

// Request verification
const { handles, inputProof } = await instance.requestZKProofVerification(
  zkProof,
  {
    auth: {
      __type: 'ApiKeyHeader',
      value: 'your-api-key'
    }
  }
);

// Use handles in your contract calls
const tx = await contract.submitProof(handles, inputProof);
await tx.wait();

console.log('Proof verified and submitted:', tx.hash);
```

### With Authentication

On mainnet, authentication is required:

```typescript
const { handles, inputProof } = await instance.requestZKProofVerification(
  zkProof,
  {
    auth: {
      __type: 'ApiKeyHeader',
      header: 'x-api-key',  // optional, defaults to 'x-api-key'
      value: process.env.RELAYER_API_KEY
    }
  }
);
```

### Progress Tracking Support

Like all SDK operations, ZK proof verification supports progress tracking through the `onProgress` callback:

```typescript
const { handles, inputProof } = await instance.requestZKProofVerification(
  zkProof,
  {
    auth: {
      __type: 'ApiKeyHeader',
      value: 'your-api-key'
    },
    onProgress: (event) => {
      switch (event.type) {
        case 'queued':
          console.log('Verification queued...');
          break;
        case 'succeeded':
          console.log('Verification complete!');
          break;
        case 'failed':
          console.error('Verification failed:', event.relayerApiError.label);
          break;
      }
    }
  }
);
```

For complete details on progress events, event types, and error handling, see [Progress Tracking](./migrating_to_v2.md#progress-tracking) in the V2 migration guide.

### Request Cancellation

You can cancel in-flight verification requests using an `AbortController`:

```typescript
const controller = new AbortController();

try {
  const result = await instance.requestZKProofVerification(
    zkProof,
    {
      auth: { __type: 'ApiKeyHeader', value: 'your-api-key' },
      signal: controller.signal
    }
  );
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Verification cancelled by user');
  }
}

// Cancel from elsewhere (e.g., user navigation)
controller.abort();
```

For details on cancellation patterns, see [Request Cancellation](./migrating_to_v2.md#request-cancellation).

### Complete Workflow Example

```typescript
import { createInstance } from '@zama-ai/relayer-sdk';
import { generateZKProof } from './zkProofGenerator';

async function verifyAndSubmit(secretData: number[], contractAddress: string) {
  // Step 1: Create SDK instance
  const instance = await createInstance({
    relayerUrl: 'https://relayer.testnet.zama.org/v2',
    gatewayUrl: 'https://gateway.testnet.zama.org',
  });

  // Step 2: Generate ZK proof client-side
  const zkProof = await generateZKProof(secretData);

  // Step 3: Verify proof and get handles
  const { handles, inputProof } = await instance.requestZKProofVerification(
    zkProof,
    {
      auth: {
        __type: 'ApiKeyHeader',
        value: process.env.RELAYER_API_KEY
      },
      onProgress: (event) => {
        if (event.type === 'queued') {
          console.log(`Verifying... (retry in ${event.retryAfterMs / 1000}s)`);
        } else if (event.type === 'succeeded') {
          console.log(`Verified in ${event.elapsed}ms`);
        }
      }
    }
  );

  // Step 4: Submit to blockchain
  const contract = await ethers.getContractAt('MyContract', contractAddress);
  const tx = await contract.submitVerifiedProof(handles, inputProof);
  await tx.wait();

  return tx.hash;
}
```

### Error Handling

```typescript
try {
  const { handles, inputProof } = await instance.requestZKProofVerification(
    zkProof,
    {
      auth: { __type: 'ApiKeyHeader', value: 'your-api-key' },
      onProgress: (event) => {
        if (event.type === 'failed') {
          // Access structured error information
          console.error(`Error: ${event.relayerApiError.label}`);
          console.error(`Message: ${event.relayerApiError.message}`);

          // Handle specific error types
          if (event.relayerApiError.label === 'validation_failed') {
            console.error('Validation issues:', event.relayerApiError.details);
          }
        }
      }
    }
  );
} catch (error) {
  console.error('Verification request failed:', error);
}
```

For complete error label reference, see [Error Labels](./migrating_to_v2.md#error-labels).

---

## Enhanced Instance Methods

The SDK provides methods for querying metadata about cached public keys and parameters.

### getPublicKeyInfo()

Returns metadata about the currently cached public key:

```typescript
const keyInfo = instance.getPublicKeyInfo();

console.log(keyInfo.id);        // Key identifier (e.g., "pk-v1-abc123")
console.log(keyInfo.srcUrl);    // Source URL if available
```

**Use Case:** Verify which public key version is currently loaded, useful for debugging or cache validation.

### getPublicParamsInfo()

Returns metadata about public parameters for a specific bit width:

```typescript
const paramsInfo = instance.getPublicParamsInfo();

console.log(paramsInfo.id);     // Parameter identifier
console.log(paramsInfo.bits);   // Bit width (e.g., 2048, 4096)
console.log(paramsInfo.srcUrl); // Source URL if available
```

**Use Case:** Confirm parameter versions for different encryption bit widths.

### Example: Cache Validation

```typescript
import { createInstance } from '@zama-ai/relayer-sdk';

const instance = await createInstance({
  relayerUrl: 'https://relayer.testnet.zama.org/v2',
  gatewayUrl: 'https://gateway.testnet.zama.org',
});

// Get public key info
const keyInfo = instance.getPublicKeyInfo();
console.log(`Using public key: ${keyInfo.id}`);

if (keyInfo.srcUrl) {
  console.log(`Loaded from: ${keyInfo.srcUrl}`);
}

// Get parameter info
const paramsInfo = instance.getPublicParamsInfo();
console.log(`Parameters: ${paramsInfo.bits}-bit (${paramsInfo.id})`);
```

---

## Method Renames

Several methods were renamed for improved clarity and consistency. Update your code if using these methods directly.

### Breaking Changes

| Old Method | New Method | Status |
|-----------|-----------|--------|
| `getPublicParamsBytes(bits)` | `getPublicParamsBytesForBits(bits)` | ⚠️ Breaking |
| `getPublicParamsWasm(bits)` | `getPublicParamsWasmForBits(bits)` | ⚠️ Breaking |

### Migration

Update your code to use the new method names:

```typescript
// Before (old method names)
const params = instance.getPublicParamsBytes(2048);
const wasm = instance.getPublicParamsWasm(2048);

// After (new method names)
const params = instance.getPublicParamsBytesForBits(2048);
const wasm = instance.getPublicParamsWasmForBits(2048);
```

**Why Renamed:** The new names explicitly indicate that the parameter is the bit width, making the API more self-documenting and reducing ambiguity.

### Finding Usage

Search your codebase for these method names:

```bash
# Find old method usage
grep -r "getPublicParamsBytes" .
grep -r "getPublicParamsWasm" .
```

---

## Advanced Utilities

### FheType Module

For advanced use cases, the SDK exports a comprehensive FheType utility module from the `/internal` entry point:

```typescript
import {
  isFheTypeId,
  isFheTypeName,
  fheTypeIdFromName,
  fheTypeNameFromId,
  encryptionBitsFromFheTypeId,
  encryptionBitsFromFheTypeName,
} from '@zama-ai/relayer-sdk/internal';

// Type guards
if (isFheTypeId(value)) {
  // value is validated FheTypeId (0, 2-8)
}

if (isFheTypeName(name)) {
  // name is validated FheTypeName ('ebool', 'euint8', etc.)
}

// Conversions
const typeId = fheTypeIdFromName('euint32');           // 4
const typeName = fheTypeNameFromId(4);                 // 'euint32'
const bits = encryptionBitsFromFheTypeId(4);           // 32
const bitsFromName = encryptionBitsFromFheTypeName('euint32'); // 32
```

**Note:** These utilities are exported from `/internal` and are considered advanced features for library authors and power users. Most applications won't need direct access to these functions.

### Internal Entry Point

The SDK provides an `/internal` entry point that exports advanced APIs not intended for typical application use:

```typescript
import {
  FhevmHandle,
  TFHECrs,
  TFHEPublicKey,
  // ... other internal APIs
} from '@zama-ai/relayer-sdk/internal';
```

**Use Case:** Building tooling, libraries, or advanced integrations on top of the SDK.

**Warning:** The `/internal` API is subject to change between releases. Use the main entry point (`@zama-ai/relayer-sdk`) for stable, production code.

---

## Summary

SDK v0.4.0-alpha.2 introduces:

- ✅ **ZK Proof Verification API** - New `requestZKProofVerification()` for privacy-preserving workflows
- ✅ **Enhanced Instance Methods** - `getPublicKeyInfo()` and `getPublicParamsInfo()` for metadata access
- ⚠️ **Method Renames** - Clearer names for public parameter methods (breaking changes)
- 🔧 **Advanced Utilities** - FheType module and internal APIs for power users

---

## Related Documentation

- **[Migrating to HTTP API V2](./migrating_to_v2.md)** - HTTP API V2 features (progress tracking, structured errors, etc.)
- **[CLI Reference](./cli-reference.md)** - Command-line tools for testing and debugging
- **[TypeScript Types](../src/relayer-provider/v2/types/types.d.ts)** - Complete type definitions

---

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/zama-ai/relayer-sdk/issues)
- **Discussions:** [GitHub Discussions](https://github.com/zama-ai/relayer-sdk/discussions)
- **Documentation:** [Main README](../README.md)
