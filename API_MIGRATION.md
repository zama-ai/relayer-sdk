# Async API Migration

Adapting relayer-sdk if we change the HTTP API of relayer from synchronous HTTP to asynchronous HTTP with POST + polling. This affects three APIs: `.encrypt()`, `.userDecrypt()`, and `.publicDecrypt()`.

With Async HTTP API, the backend now uses POST to submit requests and GET to poll for results.

## API signatures

All three APIs add an optional third parameter for async options. Return types remain unchanged.

```typescript
// RelayerEncryptedInput
encrypt: (options?: RelayerInputProofOptionsType) =>
  Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;

// FhevmInstance
publicDecrypt: (
  handles: (string | Uint8Array)[],
  options?: RelayerPublicDecryptOptionsType,
) => Promise<PublicDecryptResults>;

userDecrypt: (
  handles: HandleContractPair[],
  privateKey: string,
  publicKey: string,
  signature: string,
  contractAddresses: string[],
  userAddress: string,
  startTimestamp: string | number,
  durationDays: string | number,
  options?: RelayerUserDecryptOptionsType,
) => Promise<UserDecryptResults>;
```

## Types

```typescript
type RelayerInputProofOptionsType = {
  auth?: Auth | undefined;
  debug?: boolean | undefined;
  signal?: AbortSignal | undefined;
  timeout?: number | undefined;
  onProgress?: ((args: RelayerInputProofProgressArgs) => void) | undefined;
};

type RelayerPublicDecryptOptionsType = {
  auth?: Auth | undefined;
  debug?: boolean | undefined;
  signal?: AbortSignal | undefined;
  timeout?: number | undefined;
  onProgress?: ((args: RelayerPublicDecryptProgressArgs) => void) | undefined;
};

type RelayerUserDecryptOptionsType = {
  auth?: Auth | undefined;
  debug?: boolean | undefined;
  signal?: AbortSignal | undefined;
  timeout?: number | undefined;
  onProgress?: ((args: RelayerUserDecryptProgressArgs) => void) | undefined;
};
```

## Usage

## Encryption

```typescript
const builder = instance.createEncryptedInput(contractAddress, userAddress);
builder.add8(12);
builder.add32(34);

const result = await builder.encrypt({
  timeout: 60000,
  onProgress: (args: RelayerInputProofProgressArgs) => {
    console.log(`${args.type}: ${args.elapsedMs}ms`);
  },
});
```

## User Decryption

```typescript
const result = await instance.userDecrypt(
  handleContractPairs,
  keypair.privateKey,
  keypair.publicKey,
  signature,
  contractAddresses,
  signer.address,
  startTimeStamp,
  durationDays,
  {
    timeout,
    //signal: abortController.signal,
    onProgress: (args: RelayerUserDecryptProgressArgs) => {
      console.log(`${args.type}: ${args.elapsedMs}ms`);
    },
    auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
  },
);
```

## Public Decryption

```typescript
const result = await instance.publicDecrypt(handles, {
  timeout,
  //signal: abortController.signal,
  onProgress: (args: RelayerPublicDecryptProgressArgs) => {
    console.log(`${args.type}: ${args.elapsedMs}ms`);
  },
  auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
});
```

## Backward compatibility

Existing code continues to work. The options parameter is optional.
