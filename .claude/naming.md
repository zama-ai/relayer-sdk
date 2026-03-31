# Naming Conventions

## Types

- `<FunctionName>Parameters` — input type for a function. Must be an object with named fields, never a bare type:

  ```ts
  // Good — named fields in an object
  export type EncryptParameters = {
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly values: TypedValueLike;
  };

  // Bad — bare type alias, no named fields
  export type ParseE2eTransportKeypairParameters = unknown;
  export type SerializeE2eTransportKeypairParameters = E2eTransportKeypair;
  ```

- `<FunctionName>ReturnType` — output type for a function

## Generics

- When a generic parameter represents an FHE type, use `etype` as the parameter name:

  ```ts
  // Good
  type ClearValueType<etype extends FheType> = ...
  function decrypt<etype extends FheType>(handle: EncryptedValue<etype>): ClearValueType<etype>

  // Bad
  type ClearValueType<T extends FheType> = ...
  function decrypt<T extends FheType>(handle: EncryptedValue<T>): ClearValueType<T>
  ```

## Serialization

- `serialize<Xxx>()` — returns a **plain object** (JSON-compatible, no class instances). The caller calls `JSON.stringify()` if they need a string.
- `stringify<Xxx>()` — returns a **string**. Use this prefix only when the function generates a string directly.
- `parse<Xxx>()` — accepts a plain object (or string) and returns a validated instance.
- `Parse<Xxx>Parameters` must include a `readonly serialized: string | Record<string, unknown>` field. Additional fields are allowed:
  ```ts
  // Good
  export type ParseSignedDecryptionPermitParameters = {
    readonly serialized: string | Record<string, unknown>;
    readonly e2eTransportKeypair: E2eTransportKeypair; // extra field
  };

  // Bad — missing `serialized` field
  export type ParseE2eTransportKeypairParameters = unknown;
  ```

## Functions

- Runtime module functions: `<functionName>(runtime, parameters: <FunctionName>Parameters): <FunctionName>ReturnType`
- Client functions: `<functionName>(client, parameters: <FunctionName>Parameters): <FunctionName>ReturnType`
- Async variants return `Promise<<FunctionName>ReturnType>`
- `fhevm` as first argument is **reserved for public action functions** (the functions exposed via `client.extend(...)`)
- Internal/private utility functions use `context` as first argument instead:

  ```ts
  // Good — public action: uses `fhevm`
  export async function signUserDecryptionPermit(
    fhevm: Fhevm<FhevmChain>,
    parameters: SignUserDecryptionPermitParameters,
  ): Promise<SignUserDecryptionPermitReturnType> { ... }

  // Good — internal utility in utils-p/: uses `context`
  export async function verifyKmsUserDecryptEIP712(
    context: { readonly chain: FhevmChain; readonly runtime: FhevmRuntime },
    parameters: VerifyKmsUserDecryptEIP712Parameters,
  ): Promise<void> { ... }

  // Bad — internal utility using `fhevm`
  export async function verifyKmsUserDecryptEIP712(
    fhevm: { readonly chain: FhevmChain; readonly runtime: FhevmRuntime },
    ...
  ): Promise<void> { ... }
  ```

## Modules

- Module info types: `<Module>ModuleInfo` (e.g. `TfheModuleInfo`, `TkmsModuleInfo`)
- Module info getters: `get<Module>ModuleInfo()` — returns `undefined` if not initialized

## Clients

- `createFhevm<Type>Client` — factory functions (e.g. `createFhevmClient`, `createFhevmEncryptClient`)
- `fhevmClient.extend(...)` — extends the client with new functions and returns it.
  Mutates the client in place, but always use the returned value for correct typings:
  ```ts
  const extended = client.extend(decryptActions); // use `extended`, not `client`
  ```
- `fhevmClient.withXXX(...)` — set a client config parameter

- Module-scoped private functions use `_` prefix (e.g. `_decryptActions`, `_initDecrypt`).
  This is distinct from class fields — `_` is acceptable for non-exported functions at module scope.

## Files and Folders

- Files suffixed with `-p.ts` are **private** (e.g. `init-p.ts`, `ethers-p.ts`)
- Folders suffixed with `-p` are **private** (e.g. `utils-p/`)
- Private files and folders must never export symbols to the public SDK API
- No type, interface, constant, or function from a `-p` file or folder may appear in the SDK's public exports:

  ```ts
  // Bad — leaking a private helper to the public API
  // src/ethers/index.ts
  export { verifyKmsUserDecryptEIP712 } from "../core/utils-p/decrypt/verifyKmsUserDecryptEIP712.js";

  // Good — private helpers stay internal
  // used only inside other -p files or action implementations
  import { verifyKmsUserDecryptEIP712 } from "../core/utils-p/decrypt/verifyKmsUserDecryptEIP712.js";
  ```

## Encrypted Values

- **Prefer `EncryptedValue` over `Handle` in public type names and parameters.**
  The term "handle" is established in FHE.sol and the FHEVM whitepaper, but
  `EncryptedValue` is more self-explanatory for newcomers (frontend devs, backend integrators).
- Public type names: use `EncryptedValue<etype>`, `ExternalEncryptedValue<etype>`, `ClearValue<etype>`
- Public parameter names: use `encryptedValue`, `encryptedValues` — not `handle`
- Typed variants (`Euint8`, `Ebool`, `ExternalEuint8`, `ClearBool`, etc.) follow Solidity naming
- JSDoc and documentation may freely use "handle" to bridge to FHE.sol terminology:
  ```ts
  /** An encrypted FHE value (`handle` in FHE.sol / FHEVM whitepaper terminology). */
  export type EncryptedValue<etype extends FheType = FheType> = ...;
  ```
- A `Handle<etype>` alias of `EncryptedValue<etype>` is acceptable as a secondary re-export
  for developers familiar with FHE.sol, but `EncryptedValue` remains the primary name
- Internal code (`-p` files) may use "handle" terminology freely

## Classes

- Private implementation classes use the `Impl` suffix: `<ClassName>Impl`

## Brands

- Prefer `FHEVM` over `fhEVM`
