# Migrating to HTTP API V2

## Contents

**Migration Guide**

- [Introduction](#introduction)
- [Backward Compatibility](#backward-compatibility)
- [What is HTTP API V2](#what-is-http-api-v2)
- [What's New in HTTP API V2](#whats-new-in-http-api-v2)
- [How to Choose the API Version](#how-to-choose-the-api-version)
- [Function Signatures Comparison](#function-signatures-comparison)
- [Quick Start](#quick-start)

**Reference**

- [Working with V2 Features](#working-with-v2-features)
- [Technical Details](#technical-details)
- [API Reference](#api-reference)

---

## Introduction

### Release Information

The relayer was upgraded on testnet, introducing **HTTP API V2** with improved async job handling (December 23, 2025).

The Relayer SDK **[v0.4.0-alpha.1](https://github.com/zama-ai/relayer-sdk/releases/tag/v0.4.0-alpha.1)** adds support for HTTP API V2. Can be installed using the following command:

```bash
npm install @zama-ai/relayer-sdk@0.4.0-alpha.1
```

You could start trying out the new features using SDK v0.4.0-alpha.1 by following this guide. When the next release is available, you can adopt additional features incrementally. _(Alternatively, you can wait for the stable release, though you'll need to adopt all changes at once.)_

**Key point**: The SDK's JavaScript API remains backward compatible. So, your existing code works unchanged. This guide explains the new capabilities enabled by HTTP API V2.

### About This Guide

This document will help you understand what's new in HTTP API V2 and how to take advantage of its features.

HTTP API V2 applies to all three operations: `fetchPostInputProof`, `fetchPostUserDecrypt`, and `fetchPostPublicDecrypt`. The examples throughout this guide use `fetchPostInputProof` for illustration, but the same patterns apply to all operations.

Whether you're a current V1 user or new to the SDK, this guide covers:

- What makes HTTP API V2 better (async job pattern with managed retries)
- How to migrate your code (the SDK API is backward compatible)
- How to use new V2 features (progress tracking, cancellation, structured errors)
- Complete API reference (progress events, error labels)

## Backward Compatibility

The SDK API is fully backward compatible—your existing code works unchanged. V2 features are fully opt-in, allowing you to gradually adopt new capabilities like progress tracking, cancellation, and structured errors as per your application needs.

## What is HTTP API V2

HTTP API V2 introduces an async job pattern designed for reliability and transparency. Instead of blocking while your request is processed, the server immediately returns a job identifier and tells you when to check back. The SDK automatically handles all the polling in the background—you just await the promise as usual.

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

1. You make a request (POST) → Server creates a job and returns `jobId`, `requestId`, and `retryAfter`
2. SDK waits the specified interval, then polls (GET) to check job status
3. If still processing, server returns another `retryAfter` interval
4. When complete, server returns your result (200)

This pattern enables the SDK to handle retries intelligently, expose progress events at each stage, support request cancellation, and provide complete traceability through identifiers. The SDK handles polling automatically, and you can opt-in to V2 features (progress tracking, cancellation, structured errors) as per your application needs.

For detailed mechanics including failure modes and limits, see [Technical Details](#technical-details).

## What's New in HTTP API V2

The async job pattern enables five key improvements:

### Progress Tracking

Track your requests as they move through the system—queued, rate-limited, succeeded, or failed. Each progress event includes timing information and retry counts, giving you real-time visibility into long-running operations. Show users meaningful progress updates instead of generic loading spinners.

### Structured Errors

Errors include stable identifiers (`label`) for programmatic handling, human-readable messages for display, and field-specific details when applicable. Handle specific error types in your code while showing user-friendly messages—no more parsing error strings.

### Managed Retries

The SDK automatically manages polling for queued or rate-limited responses using server-suggested retry intervals. This handles the majority of retry scenarios. However, applications should still handle edge cases where delays exceed the timeout (such as when user API quota is exhausted or system load is very high causing processing times longer than the timeout limit).

### Request Traceability

Every request gets a unique `requestId` for tracking the complete roundtrip. When issues arise, share the requestId with support for full visibility into what happened.

### Request Cancellation

Cancel in-flight requests using AbortSignal when they're no longer needed—whether users navigate away, requests time out, or operations become obsolete. The SDK immediately stops polling and cleans up resources.

---

These features are fully opt-in—enable them by passing the `fetchOptions` parameter. Adopt them gradually as per your application needs.

## How to Choose the API Version

The SDK determines which HTTP API version to use based on the `relayerUrl` you provide when calling `createInstance()`:

```typescript
import { createInstance, SepoliaConfig } from '@zama-ai/relayer-sdk';

// Option 1: Use HTTP API V1 (current default behavior)
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v1', // explicit V1
});

// Option 2: Use HTTP API V2 (for new features)
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v2', // explicit V2
});

// Option 3: No version suffix (defaults to /v1 for backward compatibility)
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org', // defaults to /v1
});
```

**Key points:**

- **Existing code continues to work** because URLs without a version suffix default to `/v1`
- **To use HTTP API V2**, append `/v2` to your relayerUrl
- **V2 features** (progress tracking, cancellation, structured errors) are only available when using HTTP API V2

## Function Signatures Comparison

The function signatures show how V2 extends V1 with an optional parameter:

```typescript
// V1 (still works exactly as before)
fetchPostInputProof(payload, instanceOptions?)
fetchPostUserDecrypt(payload, instanceOptions?)
fetchPostPublicDecrypt(payload, instanceOptions?)

// SDK v0.4.0+ (adds optional fetchOptions parameter)
fetchPostInputProof(payload, instanceOptions?, fetchOptions?)
fetchPostUserDecrypt(payload, instanceOptions?, fetchOptions?)
fetchPostPublicDecrypt(payload, instanceOptions?, fetchOptions?)
```

The only difference is the optional third parameter (`fetchOptions`), which unlocks V2 features (progress tracking, cancellation, structured errors). If you don't pass it, the SDK behaves exactly like V1.

## Quick Start

This section provides minimal examples to get started with HTTP API V2 quickly.

### Simple Example: Same SDK API as V1

To use HTTP API V2, change your relayerUrl to `/v2`. The SDK API remains the same:

```typescript
// Change relayerUrl when creating instance
const instance = await createInstance({
  ...SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.org/v2', // Changed from /v1 to /v2
});

// SDK API unchanged - works exactly like V1
const result = await provider.fetchPostInputProof(payload);
```

### Simple Example: Using a V2 Feature

Add progress tracking with just a few lines:

```typescript
const result = await provider.fetchPostInputProof(payload, instanceOptions, {
  onProgress: (event) => {
    if (event.type === 'queued') {
      console.log(`Waiting... retry in ${event.retryAfter}s`);
    } else if (event.type === 'succeeded') {
      console.log(`Done in ${event.elapsed}ms`);
    }
  },
});
```

You're now using HTTP API V2 progress tracking.

## Working with V2 Features

This section explores each Quick Start feature in detail, showing you how to use progress tracking, cancellation, structured errors, and request tracking in your applications.

All V2 features are enabled via the optional `fetchOptions` parameter. You can use any combination of features together.

### Parameters Reference

```typescript
fetchPostInputProof(payload, instanceOptions?, fetchOptions?)
```

| Parameter         | Purpose                                  | Fields                                                              |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `payload`         | Operation-specific request data          | Refer to the TypeScript definitions in `src/types/relayer.d.ts`     |
| `instanceOptions` | Authentication (optional)                | `auth?: { __type: 'ApiKeyHeader', header?: string, value: string }` |
| `fetchOptions`    | Request lifecycle (SDK v0.4.0, optional) | `signal?: AbortSignal`, `onProgress?: (event) => void`              |

### Authentication

Authentication works the same as in V1. It is not required on testnet but is required on mainnet. Use the `ApiKeyHeader` authentication method:

```typescript
const result = await provider.fetchPostInputProof(
  payload,
  {
    auth: {
      __type: 'ApiKeyHeader',
      header: 'x-api-key',  // optional, defaults to 'x-api-key'
      value: 'your-api-key-here'
    }
  },
  fetchOptions
);
```

### Progress Tracking

The progress callback receives an event for each state transition. Filter by `event.type` to handle specific states:

```typescript
const result = await provider.fetchPostInputProof(payload, instanceOptions, {
  onProgress: (event) => {
    switch (event.type) {
      case 'queued':
        console.log(`Waiting... retry in ${event.retryAfter}s`);
        break;

      case 'ratelimited':
        console.log(`Rate limited, retry in ${event.retryAfter}s`);
        break;

      case 'succeeded':
        console.log(`Done in ${event.elapsed}ms`);
        break;

      case 'failed':
        console.error(`Failed: ${event.relayerApiError.label}`);
        break;
    }
  },
});
```

All events include `elapsed` (milliseconds since request started) and `retryCount` (number of retries attempted). For complete type definitions, refer to the TypeScript types in `src/relayer-provider/v2/types/types.d.ts`.

### Request Cancellation

Use an `AbortController` to cancel requests at any time:

```typescript
const controller = new AbortController();

const result = await provider.fetchPostInputProof(payload, instanceOptions, {
  signal: controller.signal,
});

// Cancel anytime before completion
controller.abort();

// Handle cancellation in your catch block
try {
  const result = await provider.fetchPostInputProof(payload, instanceOptions, {
    signal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request cancelled by user');
  }
}
```

### Accessing Structured Errors

Structured errors provide three fields, each serving a specific purpose:

- **`label`**: Stable identifier for programmatic handling. Treat this as a contract—use it in your code logic to handle specific error types (e.g., retry on `rate_limited`, show user-friendly message for `validation_failed`).
- **`message`**: Human-readable description. This is flexible and useful for displaying to users or logging. The format may evolve over time.
- **`details`**: Additional debugging information. For validation errors, this includes field-specific issues (e.g., which fields failed validation and why).

Without the progress callback, errors throw an exception with only `message` and `status`. To access structured error details (`label`, `details`), use the progress callback and filter for `type: 'failed'`:

```typescript
let errorInfo = null;

try {
  const result = await provider.fetchPostInputProof(payload, instanceOptions, {
    onProgress: (event) => {
      if (event.type === 'failed') {
        errorInfo = event.relayerApiError;
      }
    },
  });
} catch (error) {
  if (errorInfo) {
    console.error(`[${errorInfo.label}] ${errorInfo.message}`);

    // Some errors include field-specific details (see Error Labels table)
    if (errorInfo.details) {
      // e.g., [{ field: 'contractAddress', issue: 'invalid format' }]
      errorInfo.details.forEach((d) => {
        console.error(`  ${d.field}: ${d.issue}`);
      });
    }
  }
}
```

See [Error Labels](#error-labels) in the API Reference for a complete list of error types.

### Request Tracking

The `requestId` is a unique identifier for the entire round-trip request. Use it when contacting support. Note that `ratelimited` and `failed` events do not include `requestId`.

```typescript
let requestId: string | undefined;

await provider.fetchPostInputProof(payload, instanceOptions, {
  onProgress: (event) => {
    if (event.type === 'queued' || event.type === 'succeeded') {
      requestId = event.requestId;
    }
  },
});
```

### Job Tracking

The `jobId` identifies the async job on the server. Available in `queued` and `succeeded` events. Also present in `failed` events when failure occurs after job creation (during the GET phase):

```typescript
await provider.fetchPostInputProof(payload, instanceOptions, {
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

## Technical Details

### How Async Jobs Work

The async job flow involves two phases: POST (job creation) and GET (polling for results). The diagram in [What is HTTP API V2](#what-is-http-api-v2) illustrates this flow.

All of this happens automatically when you await the promise.

### Key Identifiers

The system uses two identifiers:

- **`jobId`**: Identifies the async job on the server. Used internally for polling. Available in progress events.
- **`requestId`**: Unique identifier for the entire round-trip request. Use this when contacting support about a specific request.

Both identifiers are available in `queued` and `succeeded` progress events.

### Failure Points

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

### Limits

To prevent infinite loops, the SDK enforces limits:

- **Timeout**: 1 hour default. Throws an error when exceeded.
- **Max retries**: 100 per phase (POST phase and GET phase are tracked separately). Throws `RelayerV2MaxRetryError` when exceeded.

The `retryCount` metric in progress events includes all retry attempts (including rate-limited retries) for visibility into the request lifecycle.

## API Reference

For complete type definitions of progress events and errors, refer to the TypeScript types in `src/relayer-provider/v2/types/types.d.ts`.

### Error Labels

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

For error handling examples, see [Accessing Structured Errors](#accessing-structured-errors) in Working with V2 Features.
