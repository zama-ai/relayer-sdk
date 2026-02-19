# Context:

- a Typescript Crypto SDK
- SDK manipulates sensitive data.
- SDK exposes Classes, functions and constants
- SDK is compiled into a static js bundle
- bundled SDK is incorporated in the runtime using streaming load
- SDK only depends at compile/link time of a limited number of trusted packages
- SDK never reads any global variable
- SDK never writes any global variable
- SDK Classes never extends any external classes
- SDK classes instances can navigate outside of the SDK boundaries.
- SDK classes instances can be passed as arguments of SDK functions or SDK classes methods.

```typescript
export class ExportedClassA {
  /// some class
}

export function fn1(params: { arg: ExportedClassA }): void;
export function fn2(params: { arg: number }): ExportedClassA;
```

- In the example below :

```js
//in HTML page
const c = sdk.fn2({ args: 123 });
// do something with c
sdk.fn1({ args: c });
```

- functions exported takes parameters as object as arguments:
- functions exported can return complex types or primitive Js types

```typescript
export type ParamsType = /* some complex type */
export type ReturnType = /* some complex type */
export function fn(params: ParamsType): ReturnType
```

# Runtime Environment

- compiled SDK files can be imported in a NodeJs project
- static-bundled-SDK is dynamically loaded in a Web page in a Browser (can be any browser)
- SDK runs in same global scope as page.
- SDK is loaded in the web page using `const script = document.createElement("script");` approach

# Security Model

## Trust Assumptions (All Components)

- Host environment is trusted (Node.js/browser not compromised)
- Developer using the library is not malicious

## Security Boundaries

### Application Layer (Sharp Tools)

Modules: `relayer-provider/`, `relayer/`, high-level `sdk/` APIs

- Security responsibility delegated to application layer
- Library provides correct behavior, not safety guardrails
- Developer must understand what they're calling

### Crypto Layer (WASM Bridge)

The context:

- the WASM Modules are trusted (tfhe.wasm and tkms.wasm)

The Goals:

- Defends against: Developer Error, Accidental Leakage, Side-Channel Attacks

1. Modules:

- sdk/lowlevel/: Interfacing with trusted WASM modules (tfhe.wasm, tkms.wasm).
- base/: Primitives (bytes, uint, string ops).

2. Security Model:

- Boundary: This library is the security boundary between the App and the WASM.
- Trust: tfhe.wasm and tkms.wasm are fully trusted.
- Dependencies: Strictly limited to @noble/hashes.

3. Implementation Standards (@noble-style):

- Pure implementation (no native node addons).
- Audit-readiness: Code is structured for easy manual review.
- Data Hygiene: Inputs are validated before passing to WASM; Output memory is managed carefully to prevent leaks.
- The Typescript to interact with the WASM should be secure
  - Memory Safety: Ensuring JS doesn't read/write WASM memory out of bounds (if manual memory management is used).
  - Copy-Zeroing: When copying secrets from WASM memory to JS memory, ensuring the JS copies are zeroed out after use (which is very hard in JS due to Garbage Collection).
