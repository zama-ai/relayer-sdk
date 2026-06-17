# Migrating to HTTP API V2

## Contents

- [Introduction](#introduction)
- [Quick Migration Steps](#quick-migration-steps)
- [How HTTP API V2 Works](#how-http-api-v2-works)
- [Using V2 Features](#using-v2-features)
- [Reference](#reference)

---

## Introduction

**TL;DR:** HTTP API V2 is fully backward compatible. Change one line in your config, and your existing code works unchanged. Optionally adopt new features like progress tracking and request cancellation.

```typescript
// Before (V1)
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v1',
});

// After (V2) - existing code works unchanged!
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v2', // Just change this
});
```

**Installation:**

```bash
npm install @zama-ai/relayer-sdk@0.4.0-alpha.2
```

---

## Quick Migration Steps

### Step 1: Update Your relayerUrl

Change the URL suffix from `/v1` to `/v2` when creating your instance:

```typescript
import { createInstance, SepoliaConfig } from '@zama-ai/relayer-sdk';

const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v2', // Changed from /v1 to /v2
});
```

**That's it!** Your existing code continues to work exactly as before.

### Step 2: Everything Still Works (Backward Compatible)

The SDK's JavaScript API hasn't changed. All your existing operations work unchanged:

```typescript
// Input proof encryption - works exactly like V1
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42).add16(100);
const result = await input.encrypt();

// Public decryption - works exactly like V1
const decrypted = await instance.publicDecrypt(handles);

// User decryption - works exactly like V1
const userDecrypted = await instance.userDecrypt(
  handles,
  privateKey,
  publicKey,
  signature,
  contractAddresses,
  userAddress,
  startTimestamp,
  durationDays,
);
```

### Step 3: Optionally Add V2 Features

V2 enables new capabilities through an optional `options` parameter. Add them when you're ready:

- **Progress tracking** - Real-time visibility into request status
- **Request cancellation** - Cancel operations using AbortSignal
- **Structured errors** - Programmatic error handling with stable identifiers
- **Request tracing** - Unique IDs for debugging and support

See [Using V2 Features](#using-v2-features) to learn how to adopt these capabilities.

---

## How HTTP API V2 Works

### The Async Job Pattern

HTTP API V2 introduces an async job pattern that enables better UX when requests take longer than a few seconds to process (e.g., during peak loads). Instead of blocking while your request is processed, the server immediately returns a job identifier and tells you when to check back. The SDK automatically handles all the polling in the background—you just await the promise as usual.

**V1 (Synchronous Blocking):**
```
  INITIAL ─► POST ────────────────┬─► 200 ────────► SUCCESS
                                  │
                                  ├─► 429 ────────► RATE LIMITED
                                  │
                                  └─► 400/500/503 ─► FAILED

  Client waits (blocks) until server completes processing
```

**V2 (Async Job Pattern):**
```
 POST PHASE                                                GET PHASE

  INITIAL ─► POST ─┬─► 202 ─────────► QUEUED ─► ①           ① ─► POLLING ─► GET ─┬─► 200 ─────────► SUCCESS
                   │                                                             │
                   ├─► 429 ─────────► RATE LIMITED                               ├─► 202 ─────────► QUEUED
                   │                       │                                     │                    │
                   │                       └─► retry POST                        │                    └─► retry GET
                   │                                                             │
                   └─► 400/500/503 ─► FAILED                                     └─► 400/500/503/504 ─► FAILED


  ① = jobId passed from POST to GET phase
```

**How it works:**

1. You make a request (POST) → Server creates a job and returns `jobId`, `requestId`, and `retryAfterMs` (milliseconds)
2. SDK waits the specified interval, then polls (GET) to check job status
3. If still processing, server returns another `retryAfterMs` interval
4. When complete, server returns your result (200)

All of this happens automatically when you await the promise. The SDK handles polling, retries, and error handling intelligently.

### Why This Matters

The async job pattern provides several key benefits:

- **Better UX** - No timeouts during peak loads; users see progress instead of generic spinners
- **Automatic retry management** - Server-directed retry intervals optimize throughput
- **Request traceability** - Unique identifiers (`requestId`, `jobId`) for debugging and support
- **Resource efficiency** - Cancel requests when no longer needed
- **Transparent errors** - Structured error information for programmatic handling

### V1 and V2 Support Timeline

**V2 is the recommended API for all new development.** V1 support varies by network:

#### Testnet (Sepolia)
- **V1**: Supported for transition period
- **V2**: Fully available and recommended
- Both V1 and V2 work side-by-side

#### Mainnet
- **V1**: Temporarily supported for existing applications
- **V2**: Fully available and recommended
- **Important**: For the auction and after, only V2 may be supported on mainnet

> **Note**: Mainnet V1 support is temporary. Starting with the auction period, only V2 may be available. Migrate to V2 before the auction to ensure uninterrupted service.

#### Migration Flexibility

- URLs without a version suffix default to `/v1` for backward compatibility
- Existing V1 code continues to work unchanged during the support period
- V2 is purely additive - no breaking changes
- Both V1 and V2 can coexist in the same application (different instances)

```typescript
// Mix V1 and V2 in the same app if needed
const v1Instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v1',
});

const v2Instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v2',
});
```

**Recommendation**: Migrate to V2 as soon as possible, especially for mainnet deployments.

Now that you understand how V2 works and its backward compatibility guarantees, let's explore how to use V2 features in your application.

---

## Using V2 Features

HTTP API V2 applies to all three types of operations:

- Input proof encryption (`input.encrypt()`)
- Public decryption (`instance.publicDecrypt()`)
- User decryption (`instance.userDecrypt()`)

The examples below primarily use `input.encrypt()` for illustration, but the same patterns apply to all operations.

### Progressive Enhancement Levels

V2 features are opt-in through an optional `options` parameter. Choose your complexity level:

#### Level 1: Zero Changes (Just Migration)

Simply change the URL. Your V1 code works unchanged on V2:

```typescript
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v2',
});

// Same V1 code - no changes needed
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42).add16(100);
const result = await input.encrypt();
```

#### Level 2: Add Progress Tracking

Show users meaningful progress updates with just a few lines:

```typescript
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42).add16(100);

const result = await input.encrypt({
  onProgress: (event) => {
    if (event.type === 'queued') {
      console.log(`Waiting... retry in ${event.retryAfterMs / 1000}s`);
    } else if (event.type === 'succeeded') {
      console.log(`Done in ${event.elapsed}ms`);
    }
  },
});
```

#### Level 3: Full V2 Features

Use all V2 capabilities together:

```typescript
const controller = new AbortController();
let requestId: string | undefined;
let errorInfo = null;

const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42);

try {
  const result = await input.encrypt({
    signal: controller.signal, // Cancellation support
    onProgress: (event) => {
      // Track request ID
      if (event.type === 'queued' || event.type === 'succeeded') {
        requestId = event.requestId;
      }

      // Capture structured errors
      if (event.type === 'failed') {
        errorInfo = event.relayerApiError;
      }

      // Show progress
      console.log(`State: ${event.type}, Elapsed: ${event.elapsed}ms`);
    },
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request cancelled');
  } else if (errorInfo) {
    console.error(`[${errorInfo.label}] ${errorInfo.message}`);
  }
}

// Cancel from anywhere
// controller.abort();
```

### Feature Reference

#### Function Signatures

V2 adds an optional `options` parameter to existing methods:

```typescript
// V1 (still works exactly as before)
input.encrypt()
instance.publicDecrypt(handles)
instance.userDecrypt(handles, privateKey, publicKey, signature, contractAddresses, userAddress, startTimestamp, durationDays)

// SDK v0.4.0-alpha.2+ (adds optional options parameter for V2 features)
input.encrypt(options?)
instance.publicDecrypt(handles, options?)
instance.userDecrypt(handles, privateKey, publicKey, signature, contractAddresses, userAddress, startTimestamp, durationDays, options?)
```

The `options` parameter includes:

- `signal?: AbortSignal` - for request cancellation
- `onProgress?: (event) => void` - for progress tracking

#### Parameters Reference

| Parameter | Purpose                                          | Fields                                                 |
| --------- | ------------------------------------------------ | ------------------------------------------------------ |
| `options` | Request lifecycle (SDK v0.4.0-alpha.2, optional) | `signal?: AbortSignal`, `onProgress?: (event) => void` |

The same `options` parameter is available for all operations:

- `input.encrypt(options?)` - For input proof encryption
- `instance.publicDecrypt(handles, options?)` - For public decryption
- `instance.userDecrypt(..., options?)` - For user decryption (last parameter)

**Note:** Authentication is configured once during instance creation via the `auth` field in `FhevmInstanceConfig`, not passed per-request.

#### Authentication

Authentication works the same as in V1. Configure it once during instance creation:

```typescript
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v2',
  auth: {
    __type: 'ApiKeyHeader',
    header: 'x-api-key', // Optional, defaults to 'x-api-key'
    value: 'your-api-key-here',
  }, // Required on mainnet, optional on testnet
});

// Then use instance methods - auth is handled automatically
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42);
const result = await input.encrypt({
  onProgress: (event) => {
    /* ... */
  },
});
```

The examples above show the three levels of V2 adoption. Below are detailed guides for each V2 feature:

### Detailed Feature Guides

#### Progress Tracking

Track your requests as they move through the system—queued, rate-limited, succeeded, or failed. Each progress event includes timing information and retry counts:

```typescript
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42).add16(100);

const result = await input.encrypt({
  onProgress: (event) => {
    switch (event.type) {
      case 'queued':
        console.log(`Waiting... retry in ${event.retryAfterMs / 1000}s`);
        break;

      case 'ratelimited':
        console.log(`Rate limited, retry in ${event.retryAfterMs / 1000}s`);
        console.log(`Error: ${event.relayerApiError.label}`);
        break;

      case 'succeeded':
        console.log(`Done in ${event.elapsed}ms`);
        break;

      case 'failed':
        console.error(`Failed: ${event.relayerApiError.label}`);
        break;

      case 'timeout':
        console.error('Request timed out');
        break;

      case 'abort':
        console.log('Request was cancelled');
        break;
    }
  },
});
```

All events include:

- `elapsed` - Milliseconds since request started
- `retryCount` - Number of retries attempted

For complete type definitions, refer to `src/relayer-provider/v2/types/types.d.ts`.

> **Note:** Timing values are reported in milliseconds (`retryAfterMs`, `elapsed`). Convert to seconds by dividing by 1000 if needed for display purposes.

#### Request Cancellation

Cancel in-flight requests using `AbortController` when they're no longer needed—whether users navigate away, requests time out, or operations become obsolete:

```typescript
const controller = new AbortController();

const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42);

const result = await input.encrypt({
  signal: controller.signal,
});

// Cancel anytime before completion
controller.abort();

// Handle cancellation in your catch block
try {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add8(42);

  const result = await input.encrypt({
    signal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request cancelled by user');
  }
}
```

The SDK immediately stops polling and cleans up resources when a request is cancelled.

#### Structured Errors

Errors include stable identifiers (`label`) for programmatic handling, human-readable messages for display, and field-specific details when applicable:

- **`label`**: Stable identifier for programmatic handling. Use it in your code logic to handle specific error types (e.g., retry on `rate_limited`, show user-friendly message for `validation_failed`).
- **`message`**: Human-readable description for displaying to users or logging.
- **`details`**: Additional debugging information. For validation errors, includes field-specific issues.

Without the progress callback, errors throw an exception with only `message` and `status`. To access structured error details, use the progress callback:

```typescript
let errorInfo = null;

try {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add8(42);

  const result = await input.encrypt({
    onProgress: (event) => {
      if (event.type === 'failed') {
        errorInfo = event.relayerApiError;
      }
    },
  });
} catch (error) {
  if (errorInfo) {
    console.error(`[${errorInfo.label}] ${errorInfo.message}`);

    // Some errors include field-specific details
    if (errorInfo.details) {
      errorInfo.details.forEach((d) => {
        console.error(`  ${d.field}: ${d.issue}`);
      });
    }
  }
}
```

See [Error Labels](#error-labels) in the Reference section for a complete list of error types.

#### Request Tracking

The `requestId` is a unique identifier for the entire round-trip request. Use it when contacting support:

```typescript
let requestId: string | undefined;

const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42);

await input.encrypt({
  onProgress: (event) => {
    if (event.type === 'queued' || event.type === 'succeeded') {
      requestId = event.requestId;
    }
  },
});
```

Note: `ratelimited` and `failed` events do not include `requestId`.

#### Job Tracking

The `jobId` identifies the async job on the server. Available in `queued` and `succeeded` events. Also present in `failed` events when failure occurs after job creation:

```typescript
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(42);

await input.encrypt({
  onProgress: (event) => {
    if (event.type === 'queued') {
      console.log(`Job ${event.jobId} queued, polling...`);
    } else if (event.type === 'failed' && event.jobId) {
      console.error(`Job ${event.jobId} failed during processing`);
    } else if (event.type === 'failed' && !event.jobId) {
      console.error('Request failed before job was created');
    }
  },
});
```

---

## Reference

### Technical Details

#### How Async Jobs Work

The async job flow involves two phases: POST (job creation) and GET (polling for results). The diagram in [How HTTP API V2 Works](#the-async-job-pattern) illustrates this flow.

All of this happens automatically when you await the promise. The SDK handles polling, retries, and error handling.

#### Key Identifiers

The system uses two identifiers:

- **`jobId`**: Identifies the async job on the server. Used internally for polling. Available in progress events.
- **`requestId`**: Unique identifier for the entire round-trip request. Use this when contacting support about a specific request.

Both identifiers are available in `queued` and `succeeded` progress events.

#### Failure Points

Requests can fail at different stages:

**Before Job Creation (POST fails):**

- Status codes: 400, 429, 500, 503
- No `jobId` in the `failed` event
- Common causes: Validation errors, rate limiting, server errors

**After Job Creation (GET fails):**

- Status codes: 400, 404, 500, 503, 504
- `jobId` present in the `failed` event
- Common causes: Job not found, processing errors, timeouts

**Rate Limiting (429):**

- Triggers automatic retry after server-specified interval
- Fires `ratelimited` progress event
- Only applies to POST requests; GET polling is never rate-limited

The SDK handles retries automatically in all cases. Use the progress callback to observe what's happening.

#### Limits

To prevent infinite loops, the SDK enforces limits:

- **Timeout**: 1 hour (3,600,000ms) default. Throws `RelayerV2TimeoutError` when exceeded. Fires `type: 'timeout'` progress event before throwing.
- **Max retries**: 1800 per phase (POST phase and GET phase are tracked separately). Throws `RelayerV2MaxRetryError` when exceeded.
- **Minimum retry interval**: 1000ms (1 second). Server-suggested intervals below this are enforced to this minimum.

The `retryCount` metric in progress events includes all retry attempts for visibility into the request lifecycle.

#### Managed Retries

The SDK automatically manages polling for queued or rate-limited responses using server-suggested retry intervals. This handles the majority of retry scenarios. However, applications should still handle edge cases where delays exceed the timeout (such as when user API quota is exhausted or system load is very high causing processing times longer than the timeout limit).

### API Reference

For complete API type definitions, refer to the TypeScript types in `src/relayer-provider/v2/types/types.d.ts`.

#### Error Labels

The SDK provides detailed error labels for programmatic error handling. Alpha.2 introduced dedicated error classes (`RelayerV2TimeoutError`, `RelayerV2AbortError`) for timeout and cancellation scenarios.

Complete list of error labels for programmatic error handling:

| Status | Label                      | Description                          | Note                     |
| ------ | -------------------------- | ------------------------------------ | ------------------------ |
| 400    | `malformed_json`           | Invalid JSON in request body         |                          |
| 400    | `request_error`            | General request error                |                          |
| 400    | `not_ready_for_decryption` | Ciphertext not ready for decryption  | Decrypt operations only  |
| 400    | `missing_fields`           | Required fields missing from request | Includes `details`       |
| 400    | `validation_failed`        | Field validation failed              | Includes `details`       |
| 404    | `not_found`                | Resource not found                   | Includes `details`       |
| 429    | `rate_limited`             | Rate limit exceeded                  | Triggers automatic retry |
| 500    | `internal_server_error`    | Internal server error                |                          |
| 503    | `protocol_paused`          | Protocol is paused                   |                          |
| 503    | `gateway_not_reachable`    | Gateway service unavailable          |                          |
| 504    | `readiness_check_timedout` | Readiness check exceeded timeout     | Decrypt operations only  |
| 504    | `response_timedout`        | Response processing exceeded timeout |                          |

For error handling examples, see [Structured Errors](#structured-errors).
