Here are the **SDK Implementation Guidelines**. This document serves as the authoritative reference for architectural decisions, security patterns, and coding standards for the Crypto SDK.

---

# SDK Implementation Guidelines

## 1. Core Principles

- **Security Boundary:** The SDK acts as the exclusive, safe bridge between the untrusted Host Environment (JS Runtime) and the trusted Crypto Layer (WASM).
- **Zero-Leak Policy:** No sensitive data (keys, plaintexts) may persist in JS memory longer than necessary. Explicit resource management is mandatory.
- **Functional Core, Object Shell:** Logic resides in tree-shakable functions; Classes act as opaque handles for state management and type safety.
- **Trust No One:** Inputs are validated strictly. The global scope is treated as potentially hostile (defensive coding against polluted prototypes).

---

## 2. Mandatory Architecture Rules

### 2.1 Class Design: The "Opaque Handle" Pattern

Classes are immutable containers for state (WASM pointers or bytes). They must not contain business logic.

- **Factory-Only Instantiation:** Public constructors are forbidden. Use static factory methods (`.create()`, `.from()`).
- **Internal Constructor Token:** Constructors must be `public` (for TS visibility) but guarded at runtime by a unique `Symbol` to prevent external instantiation.
- **Hard Privacy:** Private state (`#ptr`) must be stored in module-scoped `WeakMaps` or strict private fields, ensuring no inspection via `Reflect` or console.

### 2.2 Logic Implementation: The "Functional Core" Pattern

To maximize tree-shaking and security auditing:

- **Pure Functions:** Cryptographic logic (add, sub, verify) must be implemented as standalone exported functions, not class methods.
- **Explicit Dependencies:** Functions take objects as arguments and return new objects. They do not mutate inputs.
- **Exception:** Thin "shim" methods on classes are permitted only for interface compliance, provided they just call the standalone function.

### 2.3 Authenticity Branding

- **Restricted Use:** Only brand objects that hold sensitive _pending_ state (`EncryptedInput`).
- **No Output Branding:** Outputs (`ZKProof`, `FhevmHandle`) rely on cryptographic verification, not object provenance.

---

## 3. Security Patterns & Implementation

### 3.1 The Internal Plumbing (`internal.ts`)

This file defines the secrets used to coordinate between classes and functions. **Never export this.**

```typescript
// src/internal.ts
/** Guard for internal constructors */
export const INTERNAL_TOKEN = Symbol('SDK_INTERNAL_CTOR_TOKEN');

/** Module-scoped storage for WASM pointers (Hard Privacy) */
export const ptrRegistry = new WeakMap<object, number>();

/** Helper to access pointers safely */
export const getPtrOrThrow = (instance: object): number => {
  const p = ptrRegistry.get(instance);
  if (p === undefined) throw new Error('Invalid or disposed SDK instance');
  return p;
};
```

### 3.2 Sensitive Class Implementation (`EncryptedInput.ts`)

Demonstrates: Branding, WeakMap storage, Factory pattern, Resource Management.

```typescript
import { INTERNAL_TOKEN, ptrRegistry } from './internal';
import { SDKValidationError } from './errors';

// 🔒 Module-level Brand (cannot be forged externally)
const brand = new WeakSet<EncryptedInput>();

export class EncryptedInput implements Disposable {
  // No internal state on 'this' to inspect

  // 1. Restricted Constructor
  constructor(token: symbol, ptr: number) {
    if (token !== INTERNAL_TOKEN) {
      throw new SDKValidationError('Use EncryptedInput.create()');
    }
    // Store sensitive pointer in the Vault
    ptrRegistry.set(this, ptr);
    // Apply Authenticity Brand
    brand.add(this);
  }

  // 2. Public Factory
  static create(value: bigint): EncryptedInput {
    /* Input Validation */
    if (typeof value !== 'bigint')
      throw new SDKValidationError('BigInt required');

    /* Trusted Allocation */
    const ptr = _wasm_alloc_input(value);

    return new EncryptedInput(INTERNAL_TOKEN, ptr);
  }

  // 3. Resource Management
  [Symbol.dispose](): void {
    const ptr = ptrRegistry.get(this);
    if (ptr !== undefined) {
      _wasm_free(ptr);
      ptrRegistry.delete(this); // Prevent Use-After-Free
      brand.delete(this); // Remove Brand
    }
  }

  // 4. Safe Output
  toJSON(): string {
    return '<EncryptedInput:Sensitive>';
  }
}

export function isEncryptedInput(obj: unknown): obj is EncryptedInput {
  return obj instanceof EncryptedInput && brand.has(obj);
}
```

### 3.3 Public Class Implementation (`ZKProof.ts`)

Demonstrates: Unbranded, Immutable, Serializable.

```typescript
import { INTERNAL_TOKEN } from './internal';

export class ZKProof {
  readonly #bytes: Uint8Array;

  constructor(token: symbol, bytes: Uint8Array) {
    if (token !== INTERNAL_TOKEN) throw new Error('Use ZKProof factory');
    // Copy to ensure immutability
    this.#bytes = new Uint8Array(bytes);
  }

  // Factory from Bytes
  static fromBytes(bytes: Uint8Array): ZKProof {
    return new ZKProof(INTERNAL_TOKEN, bytes);
  }

  toJSON() {
    return { type: 'ZKProof', hex: toHex(this.#bytes) };
  }
}
```

### 3.4 Logic & WASM Bridge (`prover.ts`)

Demonstrates: Pure Function, WASM Safety, Input Validation.

```typescript
import { INTERNAL_TOKEN, getPtrOrThrow } from './internal';
import { EncryptedInput, isEncryptedInput } from './EncryptedInput';
import { ZKProof } from './ZKProof';

export function generateProof(input: EncryptedInput): ZKProof {
  // 1. Boundary Validation
  if (!isEncryptedInput(input)) {
    throw new Error('Invalid input: must be a branded EncryptedInput');
  }

  // 2. Retrieve Pointer (Safe Access)
  const inputPtr = getPtrOrThrow(input);

  // 3. WASM Execution Boundary
  let outputPtr = 0;
  try {
    // Call WASM
    outputPtr = _wasm_prove(inputPtr);

    // Copy Result (Zero-Copy preference where possible)
    const bytes = _wasm_read_bytes(outputPtr);

    // Return Public Object
    return new ZKProof(INTERNAL_TOKEN, bytes);
  } finally {
    // 4. Safety Cleanup
    // Even if error occurs, ensure WASM output memory is freed
    if (outputPtr !== 0) _wasm_free(outputPtr);
  }
}
```

---

## 4. Runtime & Dependency Rules

### 4.1 Global Scope Defense

Since the SDK loads in a shared browser environment, do not trust global prototypes (`Array.prototype`, `Object.prototype`).

- **Capture Intrinsics:** At the top of the bundle entry, capture necessary methods.

```typescript
const { hasOwn } = Object;
const { apply } = Function.prototype;
const Uint8ArraySlice = Uint8Array.prototype.slice;
```

- **Never** extend external classes.
- **Never** read/write `window` or `globalThis`.

### 4.2 Dependency Management

- **Allowed:** `@noble/hashes`, `tfhe` (wasm), `tkms` (wasm).
- **Forbidden:** Native Node addons, heavy utility libraries (lodash), polyfills.

### 4.3 Tree-Shaking Optimization

- Use specific `exports` in `package.json`.
- Mark packages as `"sideEffects": false`.
- Avoid `class` static blocks that run complex logic.

---

## 5. Data Hygiene Checklist

| Action       | Rule                                                        |
| ------------ | ----------------------------------------------------------- |
| **Secrets**  | Must be `Uint8Array`. Never `String`.                       |
| **Cleaning** | Call `.fill(0)` on secrets immediately after use (JS side). |
| **Memory**   | Call `free()` on WASM pointers in a `finally` block.        |
| **Errors**   | Never include input values in Error messages.               |
| **Logs**     | Never log objects directly. Use safe `.toString()`.         |
