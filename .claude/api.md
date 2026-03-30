Context:

- this file should list all the requirements: do and donts for managing the user-front-facing API entries
- the SDK only export ACTIONS and FhevmClients (that comes with predefined set of actions)
- FhevmClients can be extended with "group of actions": `encryptActions`, `decryptActions`, `baseActions`
- Each Fhevm client comes with at least the minimal set of actions called "baseActions"
- there are basically 2 kinds of exports:
  1. so-called "most-important" exports: the one that 99% of the users will use
  2. so-called "advanced" exports: the one that 1% of the users will use
- "most important" exports are the user-friendly FhevmClients of all sorts: from base to full
- "advanced" exports are actions that are not in any ready-made FhevmClients simply because they are so rarely used, it could polute the API visible to the user
- Type exports will have to be defined one-by-one according to the actions exports. They cannot be listed at this point

- SDK entry points: The SDK will have the following entry points:

1. @fhevm/sdk/ethers main entry point for creating clients in a ethers.js environmnent
2. @fhevm/sdk/viem main entry point for creating clients in a viem environmnent
3. @fhevm/sdk/chains main entry point for chain definitions
4. @fhevm/sdk/actions/host main entry point for host-related actions. A host action takes any FhevmClient as its first argument but only uses the native provider (read/view calls). Contract addresses are passed via parameters, not derived from the chain definition. These actions do not require a FhevmChain — their purpose is to resolve an unknown chain configuration (discover contract addresses, protocol version, etc.) from on-chain data.
5. @fhevm/sdk/actions/base main entry point for base actions. An base action is an action that can run using a base client.
6. @fhevm/sdk/actions/encrypt main entry point for encrypt-related actions. An encrypt action is an action that can run using an encrypt client.
7. @fhevm/sdk/actions/decrypt main entry point for decrypt-related actions. An decrypt action is an action that can run using an decrypt client.
8. @fhevm/sdk/actions/chain main entry point for chain-only actions. No provider is needed, no runtime is needed. It acts as a set of utility functions

# About function signatures:

> See [naming.md](naming.md) for the `fhevm` (public actions) vs `context` (internal utilities) first-argument distinction.

1. actions/base
   All function signatures should be:

export function <functionName>(fhevm: Fhevm<FhevmChain>, [parameters: <FunctionName>Parameters]): <FunctionName>ReturnType
export async function <functionName>(fhevm: Fhevm<FhevmChain>, [parameters: <FunctionName>Parameters]): Promise<<FunctionName>ReturnType>

```ts
// Good
export async function readKmsSignersContext(
  fhevm: Fhevm<FhevmChain>, // no parameters
): Promise<ReadKmsSignersContextReturnType> {...}
// Good
export async function readKmsSignersContext(
  fhevm: Fhevm<FhevmChain>,
  parameters: ReadKmsSignersContextParameters // with parameters
): Promise<ReadKmsSignersContextReturnType> {...}

// Bad
export async function readKmsSignersContext(
  fhevm: Fhevm<FhevmChain>,
  config: MyConfig // bad second argument
): Promise<ReadKmsSignersContextReturnType> {...}

// Bad
export async function readKmsSignersContext(
  config: MyConfig // expecting fhevm: Fhevm<FhevmChain>,
): Promise<ReadKmsSignersContextReturnType> {...}
```

2. actions/host
   All function signatures should be:

export function <functionName>(fhevm: Fhevm, [parameters: <FunctionName>Parameters]): <FunctionName>ReturnType
export async function <functionName>(fhevm: Fhevm, [parameters: <FunctionName>Parameters]): Promise<<FunctionName>ReturnType>

`fhevm: Fhevm` means a Fhevm structure that has a runtime and a NativeClient, but not necessarily a FhevmChain.

```ts
interface Fhevm<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends OptionalNativeClient = object>
```

Refer to 1.actions/base for TS examples

3. actions/encrypt
   All function signatures should be:

export function <functionName>(fhevm: Fhevm<FhevmChain, WithEncrypt>, [parameters: <FunctionName>Parameters]): <FunctionName>ReturnType
export function <functionName>(fhevm: Fhevm<FhevmChain | undefined, WithEncrypt, OptionalNativeClient>, [parameters: <FunctionName>Parameters]): <FunctionName>ReturnType
export async function <functionName>(fhevm: Fhevm<FhevmChain, WithEncrypt>, [parameters: <FunctionName>Parameters]): Promise<<FunctionName>ReturnType>
export async function <functionName>(fhevm: Fhevm<FhevmChain | undefined, WithEncrypt, OptionalNativeClient>, [parameters: <FunctionName>Parameters]): Promise<<FunctionName>ReturnType>

`fhevm: Fhevm<FhevmChain, WithEncrypt>` means a Fhevm structure that has a runtime equipped with the encrypt module, a fhevm chain, and a NativeClient, but not necessarily a decrypt module.
`fhevm: Fhevm<FhevmChain | undefined, WithEncrypt, OptionalNativeClient>` means a Fhevm structure that has a runtime equipped with the encrypt module, the rest is optional.

Refer to 1.actions/base for TS examples

4. actions/decrypt
   All function signatures should be:

export function <functionName>(fhevm: Fhevm<FhevmChain, WithDecrypt>, [parameters: <FunctionName>Parameters]): <FunctionName>ReturnType
export function <functionName>(fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>, [parameters: <FunctionName>Parameters]): <FunctionName>ReturnType
export async function <functionName>(fhevm: Fhevm<FhevmChain, WithDecrypt>, [parameters: <FunctionName>Parameters]): Promise<<FunctionName>ReturnType>
export async function <functionName>(fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>, [parameters: <FunctionName>Parameters]): Promise<<FunctionName>ReturnType>

`fhevm: Fhevm<FhevmChain, WithDecrypt>` means a Fhevm structure that has a runtime equipped with the decrypt module, a fhevm chain, and a NativeClient, but not necessarily a encrypt module.
`fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>` means a Fhevm structure that has a runtime equiped with the decrypt module, the rest is optional.

Refer to 1.actions/base for TS examples

5. actions/chain
   All function signatures should be:

export function <functionName>(fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>, [parameters: <FunctionName>Parameters]): <FunctionName>ReturnType
export async function <functionName>(fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>, [parameters: <FunctionName>Parameters]): Promise<<FunctionName>ReturnType>

`fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>,` means a Fhevm structure that ignores everything except the FhevmChain (the provider is considered as optional)

Refer to 1.actions/base for TS examples

# About action export

Each tier has its own index file matching its entry point:

- `src/core/actions/chain/index.ts` → `@fhevm/sdk/actions/chain`
- `src/core/actions/host/index.ts` → `@fhevm/sdk/actions/host`
- `src/core/actions/base/index.ts` → `@fhevm/sdk/actions/base`
- `src/core/actions/encrypt/index.ts` → `@fhevm/sdk/actions/encrypt`
- `src/core/actions/decrypt/index.ts` → `@fhevm/sdk/actions/decrypt`

The import path itself tells the user what client capability the action requires.
Each function should be exported along with its Parameters type and ReturnType when present.

> **Why separate entry points instead of a single flat `@fhevm/sdk/actions`?**
> A flat export encourages users to import actions without thinking about which client they require. They see an action in autocomplete, import it, pass the wrong client, and hit a confusing error. Separate paths make the requirement obvious at import time — if you import from `@fhevm/sdk/actions/encrypt`, you know you need an encrypt-capable client before you even write the function call.
