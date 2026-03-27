# API reference

This is the complete reference for every function the SDK exports. For guided usage, see [Getting started](getting-started.md), [Encryption](encryption.md), or [Decryption](decryption.md) instead.

All factories and actions are importable from `@fhevm/sdk/ethers` or `@fhevm/sdk/viem` (identical APIs). Standalone action functions are also available from `@fhevm/sdk`.

---

## Client factories

### `setFhevmRuntimeConfig(config)`

Configures the global runtime. Must be called before creating any clients.

```ts
setFhevmRuntimeConfig(config: FhevmRuntimeConfig): void
```

| Parameter | Type | Description |
| --- | --- | --- |
| `config.locateFile` | `(file: string) => URL` | Custom WASM file locator |
| `config.logger` | `Logger` | Logger instance `{ debug, error }` |
| `config.singleThread` | `boolean` | Force single-threaded WASM |
| `config.numberOfThreads` | `number` | Number of WASM worker threads |

### `createFhevmClient(parameters)`

Full client with encrypt, decrypt, and relayer modules.

```ts
createFhevmClient<chain, provider>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
  readonly options?: FhevmOptions;
}): FhevmClient<chain, WithAll, provider>
```

### `createFhevmEncryptClient(parameters)`

Encrypt-only client (no TKMS WASM loaded).

```ts
createFhevmEncryptClient<chain, provider>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
  readonly options?: FhevmOptions;
}): FhevmEncryptClient<chain, WithEncrypt, provider>
```

### `createFhevmDecryptClient(parameters)`

Decrypt-only client (no TFHE WASM loaded).

```ts
createFhevmDecryptClient<chain, provider>(parameters: {
  readonly provider: provider;
  readonly chain: chain;
  readonly options?: FhevmOptions;
}): FhevmDecryptClient<chain, WithDecrypt, provider>
```

---

## Encryption actions

### `encrypt(fhevm, parameters)`

Encrypts values and returns a verified input proof. The global FHE public encryption parameters are automatically fetched and cached on first use — you don't need to fetch them manually.

```ts
encrypt(fhevm, parameters: EncryptParameters): Promise<VerifiedInputProof>
```

| Parameter | Type | Description |
| --- | --- | --- |
| `contractAddress` | `string` | Target contract address |
| `userAddress` | `string` | User's Ethereum address |
| `values` | `readonly TypedValueLike[]` | Values to encrypt |
| `globalFhePublicEncryptionParams?` | `GlobalFhePkeParams` | Optional — auto-resolved from Relayer if omitted |
| `options?` | `RelayerInputProofOptions` | Optional relayer options |

### `generateZkProof(fhevm, parameters)`

Generates a ZK proof of correct encryption (CPU-intensive TFHE WASM).

```ts
generateZkProof(fhevm, parameters: GenerateZkProofParameters): Promise<ZkProof>
```

### `fetchVerifiedInputProof(fhevm, parameters)`

Sends a ZK proof to the relayer, returns verified input proof with coprocessor signatures.

```ts
fetchVerifiedInputProof(fhevm, parameters: FetchVerifiedInputProofParameters): Promise<VerifiedInputProof>
```

---

## Decryption actions

### `publicDecrypt(fhevm, parameters)` / `client.readPublicValue(encryptedValues)`

Decrypts handles that are publicly decryptable on-chain. The client method accepts an array directly; the standalone function takes an object with `encryptedValues`.

```ts
// Standalone function
publicDecrypt(fhevm, parameters: PublicDecryptParameters): Promise<PublicDecryptionProof>

// Client method — array syntax
client.readPublicValue(encryptedValues: readonly FhevmHandle[]): Promise<PublicDecryptionProof>
```

| Parameter | Type | Description |
| --- | --- | --- |
| `encryptedValues` | `readonly FhevmHandle[]` | Handles to decrypt (min 1, max 2048 bits) |
| `options?` | `RelayerPublicDecryptOptions` | Optional relayer options |

### `userDecrypt(fhevm, parameters)` / `client.decrypt(parameters)`

Decrypts handles using a transport key pair and signed permit.

```ts
// Standalone function
userDecrypt(fhevm, parameters: UserDecryptParameters): Promise<readonly DecryptedFhevmHandle[]>

// Client method
client.decrypt(parameters: UserDecryptParameters): Promise<readonly DecryptedFhevmHandle[]>
```

| Parameter | Type | Description |
| --- | --- | --- |
| `e2eTransportKeyPair` | `E2eTransportKeyPair` | E2E transport key pair from `generateE2eTransportKeyPair()` |
| `encryptedValues` | `ReadonlyArray<{ encrypted, contractAddress }>` | Encrypted values with their contracts |
| `signedPermit` | `SignedPermit` | Signed permit from `createSignedPermit()` |
| `options?` | `RelayerUserDecryptOptions` | Optional relayer options |

### `createUserDecryptEIP712(fhevm, parameters)` / `client.createDecryptPermit(parameters)`

Constructs EIP-712 typed data for a decrypt permit. **Async** — auto-fetches `extraData` if not provided. Pass `onBehalfOf` to decrypt on behalf of another user.

```ts
// Standalone function
createUserDecryptEIP712(fhevm, parameters: CreateUserDecryptEIP712Parameters): Promise<KmsUserDecryptEIP712>

// Client method
client.createDecryptPermit(parameters): Promise<KmsUserDecryptEIP712>
```

| Parameter | Type | Description |
| --- | --- | --- |
| `e2eTransportPublicKey` | `string` | Public key via `keyPair.getTkmsPublicKeyHex()` |
| `contractAddresses` | `readonly string[]` | Allowed contracts (max 10) |
| `startTimestamp` | `number` | Unix timestamp (seconds) |
| `durationDays` | `number` | Validity period (max 365) |
| `onBehalfOf?` | `string` | Optional — address to decrypt on behalf of |
| `extraData?` | `string` | Optional — auto-fetched if omitted |

### `createSignedPermit(permit, signature, signer)`

Bundles a permit, signature, and signer address into a reusable `SignedPermit` object.

```ts
createSignedPermit(permit, signature: Bytes65Hex, signer: string): SignedPermit
```

### `client.generateE2eTransportKeyPair()`

Generates a new E2E transport key pair for decryption. **Client method only.**

```ts
client.generateE2eTransportKeyPair(): Promise<E2eTransportKeyPair>
```

The returned `E2eTransportKeyPair` has a `getTkmsPublicKeyHex()` method to get the public key and a `serialize()` method for persistence.

### `client.loadE2eTransportKeyPair(parameters)`

Restores a key pair from serialized bytes. **Client method only.**

```ts
client.loadE2eTransportKeyPair(parameters: {
  tkmsPrivateKeyBytes: Bytes | BytesHex;
}): Promise<E2eTransportKeyPair>
```

---

## Key management actions

### `fetchGlobalFhePkeParams(fhevm, parameters?)`

Fetches and deserializes global FHE public encryption parameters. Cached by relayer URL.

```ts
fetchGlobalFhePkeParams(fhevm, parameters?: FetchGlobalFhePkeParamsParameters): Promise<GlobalFhePkeParams>
```

### `fetchGlobalFhePkeParamsBytes(fhevm, parameters?)`

Fetches raw bytes of the global FHE public encryption parameters.

```ts
fetchGlobalFhePkeParamsBytes(fhevm, parameters?: FetchGlobalFhePkeParamsBytesParameters): Promise<GlobalFhePkeParamsBytes>
```

### Cache management

```ts
clearGlobalFhePkeParamsCache(): void
deleteGlobalFhePkeParamsCache(relayerUrl: string): void
```

---

## Serialization actions

### `serializeGlobalFhePkeParams(fhevm, parameters)`

Serializes `GlobalFhePkeParams` to `GlobalFhePkeParamsBytes`.

### `serializeGlobalFhePkeParamsToHex(fhevm, parameters)`

Serializes `GlobalFhePkeParams` to `GlobalFhePkeParamsBytesHex`.

### `deserializeGlobalFhePkeParams(fhevm, parameters)`

Deserializes `GlobalFhePkeParamsBytes` to `GlobalFhePkeParams`.

### `deserializeGlobalFhePkeParamsFromHex(fhevm, parameters)`

Deserializes `GlobalFhePkeParamsBytesHex` to `GlobalFhePkeParams`.

---

## Host contract actions

### `readFhevmExecutorContractData(fhevm, parameters)`

```ts
readFhevmExecutorContractData(fhevm, parameters: {
  address: ChecksummedAddress;
}): Promise<FhevmExecutorContractData>
```

### `readInputVerifierContractData(fhevm, parameters)`

```ts
readInputVerifierContractData(fhevm, parameters: {
  address: ChecksummedAddress;
}): Promise<InputVerifierContractData>
```

### `readKmsVerifierContractData(fhevm, parameters)`

```ts
readKmsVerifierContractData(fhevm, parameters: {
  address: ChecksummedAddress;
}): Promise<KmsVerifierContractData>
```

### `resolveFhevmConfig(fhevm, parameters)`

Resolves complete FHEVM configuration by reading multiple host contracts.

```ts
resolveFhevmConfig(fhevm, parameters: ResolveFhevmConfigParameters): Promise<ResolveFhevmConfigReturnType>
```

---

## Chain verification

### `verifyKmsUserDecryptEIP712(fhevm, parameters)`

Verifies a decrypt permit EIP-712 signature. Returns recovered signer address.

```ts
verifyKmsUserDecryptEIP712(fhevm, parameters: VerifyKmsUserDecryptEIP712Parameters): Promise<ChecksummedAddress>
```

---

## Address utilities

### `assertIsChecksummedAddress(address, options)`

Validates EIP-55 checksummed address. Throws `ChecksummedAddressError` if invalid.

```ts
import { assertIsChecksummedAddress } from "@fhevm/sdk/ethers"; // or "@fhevm/sdk/viem"
assertIsChecksummedAddress("0xAbCdEf...", {});
```

---

## Type exports

All types available from `@fhevm/sdk`:

**Client:** `FhevmClient`, `FhevmEncryptClient`, `FhevmDecryptClient`, `FhevmRuntime`, `FhevmRuntimeConfig`, `WithEncrypt`, `WithDecrypt`, `WithAll`, `WithEncryptModule`, `WithDecryptModule`, `WithRelayerModule`

**Handles:** `FhevmHandle`, `FhevmHandleLike`, `ExternalFhevmHandle`, `Ebool`, `Euint8`, `Euint16`, `Euint32`, `Euint64`, `Euint128`, `Euint256`, `Eaddress`

**Decrypted:** `DecryptedFhevmHandle`, `DecryptedFhevmHandleOfType`, `DecryptedEbool`, `DecryptedEuint8`, ... `DecryptedEaddress`

**FHE:** `FheType`, `FheTypeId`, `EncryptionBits`

**Primitives:** `ChecksummedAddress`, `Address`, `BytesHex`, `Bytes32Hex`, `Bytes65Hex`, `Uint8Number`, `Uint16Number`, `Uint32Number`, `Uint64BigInt`, `Uint128BigInt`, `Uint256BigInt`, `TypedValue`, `TypedValueLike`

**Proofs:** `VerifiedInputProof`, `ZkProof`, `PublicDecryptionProof`

**KMS:** `KmsUserDecryptEIP712`, `KmsUserDecryptEIP712Message`, `KmsDelegatedUserDecryptEIP712`, `KmsEIP712Domain`, `KmsVerifierContractData`, `E2eTransportKeyPair`, `SignedPermit`

**Chains:** `FhevmChain`, `FhevmExecutorContractData`, `InputVerifierContractData`

**PKE Params:** `GlobalFhePkeParams`, `GlobalFhePkeParamsBytes`, `GlobalFhePkeParamsBytesHex`

**Convention:** Every action exports `FunctionNameParameters` and `FunctionNameReturnType` (e.g., `EncryptParameters`, `EncryptReturnType`).
