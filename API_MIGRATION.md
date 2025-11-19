# Async API Migration

Adapting relayer-sdk if we change the HTTP API of relayer from synchronous HTTP to asynchronous HTTP with POST + polling. This affects three APIs: `.encrypt()`, `.userDecrypt()`, and `.publicDecrypt()`.

With Async HTTP API, the backend now uses POST to submit requests and GET to poll for results.

## API signatures

All three APIs add an optional third parameter for async options. Return types remain unchanged.

```typescript
// Before
encrypt(contractAddress: string, encryptedInput: EncryptedInput)
userDecrypt(handles, privateKey, publicKey, signature, contractAddresses, userAddress, startTimestamp, durationDays)
publicDecrypt(handle: string, contractAddress: string)

// After
encrypt(contractAddress: string, encryptedInput: EncryptedInput, options?: AsyncOptions)
userDecrypt(handles, privateKey, publicKey, signature, contractAddresses, userAddress, startTimestamp, durationDays, options?: AsyncOptions)
publicDecrypt(handle: string, contractAddress: string, options?: AsyncOptions)

continueEncrypt(requestID, options?: AsyncOptions)
continueUserDecrypt(requestID, options?: AsyncOptions)
continuePublicDecrypt(requestID, options?: AsyncOptions)
```

## Usage

```typescript
const result = await instance.encrypt(contractAddress, encryptedInput, {
  timeout: 60000,
  onProgress: (status) => {
    console.log(`${status.phase}: ${status.elapsedMs}ms`);
  },
});
```

## Types

```typescript
interface AsyncOptions {
  timeout?: number;
  onProgress?: (status: ProgressStatus) => void;
}

interface ProgressStatus {
  phase: 'submitting' | 'queued' | 'completed' | 'failed';
  elapsedMs: number;
  requestId?: string;
  submitAttempts: number;
  pollAttempts: number;
  error?: RelayerError;
}

interface RelayerError extends Error {
  message: string;
  code: string;
  operation: 'encrypt' | 'userDecrypt' | 'publicDecrypt';
}
```

## Error codes

Errors now include structured codes instead of only message strings:

- `MISSING_FIELD` / `MALFORMED_VALUE` - Request validation failed
- `PERMISSION_DENIED` - Authentication required
- `INVALID_VALUE` - Handle or signature validation failed
- `INVALID_VALUE_FROM_GATEWAY` - Backend processing failed
- `KMS_SIGNATURE_VERIFICATION_FAILED` - KMS signature failed
- `SERVER_ERROR` - Internal server error

## Example

```typescript
try {
  const result = await instance.userDecrypt(
    handles,
    privateKey,
    publicKey,
    signature,
    contractAddresses,
    userAddress,
    startTimestamp,
    durationDays,
    {
      timeout: 45000,
      onProgress: (status) => {
        switch (status.phase) {
          case 'submitting':
            setStatus(`Submitting request (attempt ${status.submitAttempts})`);
            break;
          case 'queued':
            setStatus(
              `Processing (${Math.round(status.elapsedMs / 1000)}s elapsed)`,
            );
            break;
          case 'failed':
            if (status.error?.code === 'PERMISSION_DENIED') {
              setError('Authentication required');
            }
            break;
        }
      },
    },
  );

  setResult(result);
} catch (error: RelayerError) {
  switch (error.code) {
    case 'PERMISSION_DENIED':
      redirectToLogin();
      break;
    case 'INVALID_VALUE':
      showValidationErrors(error.message);
      break;
    case 'INVALID_VALUE_FROM_GATEWAY':
      showRetryDialog('Processing failed, try again');
      break;
    case 'SERVER_ERROR':
      showNotification('Service temporarily unavailable');
      break;
    default:
      showGenericError(error.message);
  }
}
```

## Backward compatibility

Existing code continues to work. The options parameter is optional.
