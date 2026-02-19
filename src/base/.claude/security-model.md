# Security Model: Authentic Data Verification

## Threat Model

| #   | Constraint  | Description                                                      |
| --- | ----------- | ---------------------------------------------------------------- |
| 1   | Goal        | Guarantee that `verifyFn` is called with authentic data          |
| 2   | Allowed     | Caller can be malicious                                          |
| 3   | Allowed     | The verification function can be malicious                       |
| 4   | Not allowed | Mutating the authentic data                                      |
| 5   | Not allowed | Bypassing the `verifyFn` call                                    |
| 6   | Requirement | Caller must be certified that `verifyFn` receives authentic data |

## Assumptions

- **JS engine is not compromised** (no debugger-level introspection)
- **Trusted modules are flawless** (no bugs, correct exports)
- **No supply chain attacks** (source files are authentic)

---

## Scope: Data Authenticity Only

This security model addresses **authenticity** — guaranteeing data is genuine and unmodified.

| Security Property | In Scope | Notes                                                                |
| ----------------- | -------- | -------------------------------------------------------------------- |
| **Authenticity**  | ✅ Yes   | Data provably comes from genuine `AuthenticData` instances           |
| **Integrity**     | ✅ Yes   | Data cannot be mutated before reaching `verifyFn`                    |
| Confidentiality   | ❌ No    | Data is passed to `verifyFn` — no secrecy guarantee                  |
| Authorization     | ❌ No    | Anyone can call `verify()` if they have an instance                  |
| Trust in verifyFn | ❌ No    | The verification function may be malicious (allowed by threat model) |

**What "authentic" means here**: The data passed to `verifyFn` is guaranteed to be:

1. From a genuine `AuthenticData` instance (not a forgery)
2. An exact copy of the original `#authenticPublicData` (not tampered with)

This model does NOT guarantee that `verifyFn` will behave correctly or that results are trustworthy.

---

## Definition: AuthenticData

`AuthenticData` is an **immutable container** that guarantees the authenticity and integrity of its contents.

### Core Properties

| Property          | Requirement                                 | Rationale                                               |
| ----------------- | ------------------------------------------- | ------------------------------------------------------- |
| **Immutability**  | MUST be immutable after construction        | Prevents tampering; enables safe sharing                |
| **Authenticity**  | MUST only contain validated/authentic data  | Guarantees data provenance                              |
| **Encapsulation** | MUST NOT expose internal data directly      | Forces controlled access via `verify()`                 |
| **Unforgeable**   | MUST be impossible to create fake instances | Brand check prevents duck-typing attacks                |
| **Single-Realm**  | MUST NOT support cross-realm transparency   | Re-validation at realm boundaries is a security feature |

### Immutability Requirements

`AuthenticData` instances MUST be deeply immutable:

1. **No mutator methods** — The class MUST NOT expose any methods that modify internal state
2. **No writable properties** — All properties MUST be read-only (private fields or `readonly` public)
3. **Defensive copies on construction** — Input data MUST be copied, not stored by reference
4. **Defensive copies on access** — Data passed to `verifyFn` MUST be a copy, not the original
5. **No direct buffer exposure** — Internal ArrayBuffer/Uint8Array MUST NOT be exposed; only copies

> **Note on ArrayBuffer immutability**: JavaScript does NOT support freezing ArrayBuffer contents.
> `Object.freeze(buffer)` only prevents property changes, not data mutation.
> Immutability is achieved through encapsulation (private fields) + defensive copying, not freezing.

```typescript
// Factory token — only factory functions can provide this
const FACTORY_TOKEN = Symbol('AuthenticData.factoryToken');

class AuthenticData {
  readonly #authenticPublicData: Uint8Array; // Immutable private field

  // Constructor requires secret token — runtime enforcement
  constructor(token: symbol, data: Uint8Array) {
    if (token !== FACTORY_TOKEN) {
      throw new Error('AuthenticData: use factory methods, not constructor');
    }
    // Defensive copy on construction — caller's reference is now disconnected
    // Note: Object.freeze() does NOT prevent ArrayBuffer data mutation
    // Immutability relies on: (1) private field, (2) no exposure, (3) copies on access
    this.#authenticPublicData = new Uint8Array(data);
  }

  verify(untrustedVerifyFn: (data: Uint8Array) => boolean): boolean {
    // Defensive copy on access
    const copy = new Uint8Array(this.#authenticPublicData);
    return untrustedVerifyFn(copy);
  }

  // Factory method (has access to FACTORY_TOKEN)
  static fromValidated(data: Uint8Array): AuthenticData {
    // Validation logic here...
    return new AuthenticData(FACTORY_TOKEN, data);
  }

  // No setters, no mutators
}

// Exported: AuthenticData class (constructor will throw without token)
// NOT exported: FACTORY_TOKEN (remains module-private)
```

> **Why not `private constructor`?**
> TypeScript's `private` keyword is compile-time only — it's erased at runtime.
> Anyone can call `new AuthenticData(data)` in JavaScript.
> The factory token pattern provides **runtime enforcement**.

### Why Immutability is Critical

| Threat                      | Without Immutability                                    | With Immutability                  |
| --------------------------- | ------------------------------------------------------- | ---------------------------------- |
| Post-construction tampering | ❌ Attacker modifies data after validation              | ✅ Impossible — no mutators exist  |
| Reference retention attack  | ❌ Caller keeps reference to input, mutates later       | ✅ Blocked — input is copied       |
| verifyFn mutation           | ❌ Malicious verifyFn modifies data during verification | ✅ Blocked — copy is passed        |
| SharedArrayBuffer race      | ❌ Another thread mutates during use                    | ✅ Blocked — defensive copy isolates data |
| TOCTOU attacks              | ❌ Data changes between check and use                   | ✅ Impossible — data cannot change |

### Threading Assumption

This model assumes single-threaded JavaScript execution. The combination of:

- Defensive copying at construction (disconnects caller's reference)
- Defensive copying at access (`verify()` passes isolated copy)
- Private field encapsulation (no external access to internal buffer)

...provides protection against SharedArrayBuffer mutations. Each copy creates a **new ArrayBuffer**, not a view into shared memory. However, the overall design has not been analyzed for future JS concurrency proposals beyond Workers.

### Sharing Boundaries

`AuthenticData` instances can be safely shared **within the same JavaScript realm**:

| Sharing Scenario                      | Safe? | Notes                                       |
| ------------------------------------- | ----- | ------------------------------------------- |
| Pass to any function (same realm)     | ✅    | Immutable; receiver should call `isValid()` |
| Store in collections                  | ✅    | Reference is safe, data cannot be mutated   |
| Return from async/Promise             | ✅    | Same instance, same guarantees              |
| Cross-realm (iframe, Worker)          | ❌    | Private fields and Symbols are per-realm    |
| Serialization (JSON, structuredClone) | ❌    | Brand is lost; must re-validate after       |
| postMessage to Worker                 | ❌    | structuredClone strips class identity       |

**Cross-realm limitation**: The brand check (`#brand in object`) relies on:

1. The `Symbol` being the same instance (Symbols are per-realm)
2. The private field slot existing (private fields are per-class-definition)

Objects from different realms will fail `isValid()` even if they were genuine in their origin realm.

**Serialization**: If `AuthenticData` must cross realm boundaries, serialize the raw data and **re-validate on the receiving side** using a factory method:

```typescript
// Sender (realm A)
postMessage({ rawData: authentic.toJSON() });

// Receiver (realm B) — must re-validate
const rehydrated = AuthenticData.fromValidated(message.rawData);
```

**Design decision**: Cross-realm support is intentionally **not provided**. This is not a limitation but a security feature—data crossing realm boundaries should always be re-validated. Silent cross-realm trust would be an anti-pattern for a crypto SDK.

---

## Component 1: AuthenticData Class

```typescript
const BRAND = Symbol('AuthenticData.brand');
const FACTORY_TOKEN = Symbol('AuthenticData.factoryToken');

class AuthenticData {
  readonly #authenticPublicData: Uint8Array;
  readonly #brand: symbol = BRAND;

  // Public constructor with runtime token check
  // TypeScript's `private` is compile-time only — this provides runtime enforcement
  constructor(token: symbol, data: Uint8Array) {
    if (token !== FACTORY_TOKEN) {
      throw new Error('AuthenticData: use factory methods, not constructor');
    }
    // Defensive copy — caller's reference is disconnected
    // Immutability relies on: private field + no exposure + copies on access
    // (Object.freeze does NOT prevent ArrayBuffer data mutation)
    this.#authenticPublicData = new Uint8Array(data);
  }

  verify(untrustedVerifyFn: (data: Uint8Array) => boolean): boolean {
    // Defensive copy — verifyFn cannot mutate original
    const copy = new Uint8Array(this.#authenticPublicData);
    return untrustedVerifyFn(copy);
  }

  static isValid(object: unknown): boolean {
    return (
      typeof object === 'object' &&
      object !== null &&
      #brand in object &&
      object.#brand === BRAND
    );
  }

  // Factory methods have access to FACTORY_TOKEN (module-scoped)
  // CRITICAL: All factory methods MUST treat input as untrusted
  static from(source: unknown): AuthenticData {
    // 1. Validate primitive fields
    if (typeof source !== 'object' || source === null) {
      throw new Error('Invalid source');
    }
    assertIsUint64((source as Record<string, unknown>).chainId);
    assertIsBytes((source as Record<string, unknown>).data);

    // 2. Validate nested AuthenticData using isValid()
    const nested = (source as Record<string, unknown>).nested;
    if (!NestedAuthentic.isValid(nested)) {
      throw new Error('Invalid nested authentic data');
    }

    // 3. Only after all validation passes, create the instance
    return new AuthenticData(FACTORY_TOKEN, validatedData);
  }

  static fromComponents(params: unknown): AuthenticData {
    // Same pattern: validate everything before construction
    // ...
    return new AuthenticData(FACTORY_TOKEN, validatedData);
  }
}

// Module exports AuthenticData class, but NOT FACTORY_TOKEN
// Direct `new AuthenticData(...)` throws at runtime
```

### Security Analysis

| Property                    | Implementation                            | Status                                       |
| --------------------------- | ----------------------------------------- | -------------------------------------------- |
| Data privacy                | `#authenticPublicData` is a private field | ✅ Inaccessible externally                   |
| Data integrity              | `new Uint8Array(...)` passes a copy       | ✅ Original cannot be mutated                |
| Brand check                 | `#brand in object` (ES2022)               | ✅ Unforgeable - only real instances pass    |
| Verification guarantee      | `verify()` always calls `verifyFn`        | ✅ No conditional bypass                     |
| Immutability (construction) | Defensive copy + private field encapsulation | ✅ Input cannot be mutated post-construction |
| Immutability (access)       | No mutator methods exposed                | ✅ No way to modify after creation           |
| Controlled creation         | Factory token + runtime check             | ✅ Only validated data can be wrapped        |

### Why `#brand in object` is unforgeable

- Private fields (`#field`) are **per-class** and cannot be added externally
- `Object.defineProperty` cannot add private fields
- Prototype manipulation cannot forge private fields
- Duck-typed fake objects will fail the check

---

## Component 2: trustedVerify.js

```typescript
import { verifyFunc } from 'TrustedModule.js';

export function verify(authenticData: AuthenticData): boolean {
  if (!AuthenticData.isValid(authenticData)) {
    throw new Error('Invalid AuthenticData');
  }
  return authenticData.verify(verifyFunc);
}
```

### Security Analysis

| Check                     | Purpose                                     | Status                         |
| ------------------------- | ------------------------------------------- | ------------------------------ |
| `AuthenticData.isValid()` | Validates object is genuine `AuthenticData` | ✅ Blocks duck-typed fakes     |
| `verifyFunc` import       | Uses trusted verification function          | ✅ Import binding is immutable |

### Why import bindings cannot be altered

ES module imports have these properties:

| Property                  | Behavior                                                 |
| ------------------------- | -------------------------------------------------------- |
| Import binding            | **Read-only** — cannot be reassigned in importing module |
| Live binding              | Reflects source module's export                          |
| External modification     | ❌ Other modules cannot access/modify imports            |
| `globalThis` manipulation | ❌ Import bindings are not on globalThis                 |
| Prototype pollution       | ❌ Doesn't affect identifier resolution                  |

**Conclusion**: `verifyFunc` will always reference the exact function exported by `TrustedModule.js` at module load time.

---

## Component 3: TrustedModule.js

```typescript
export function verifyFunc(data: Uint8Array): boolean {
  return data.length > 0;
}
```

### Security Analysis

| Property                       | Status                                        |
| ------------------------------ | --------------------------------------------- |
| Export type                    | `function declaration` — immutable binding    |
| Can be reassigned internally?  | ❌ No — function declarations are constant    |
| Can be reassigned externally?  | ❌ No — not a mutable export                  |
| Can function code be modified? | ❌ No — function body is immutable at runtime |

---

## Attack Vector Analysis

| Attack                            | Component          | Result                                                |
| --------------------------------- | ------------------ | ----------------------------------------------------- |
| Duck-typed fake `AuthenticData`   | `isValid()`        | ❌ Blocked by `#brand in object`                      |
| Mutate data inside `verifyFn`     | `verify()`         | ❌ Blocked — copy is passed                           |
| Substitute verification function  | `trustedVerify.js` | ❌ Blocked — `verifyFunc` is hardcoded                |
| Reassign `verifyFunc` in importer | ES modules         | ❌ Blocked — import bindings are read-only            |
| Reassign `verifyFunc` in exporter | `TrustedModule.js` | ❌ Blocked — function declaration is constant         |
| `Symbol.hasInstance` spoofing     | `isValid()`        | ❌ Blocked — not using `instanceof`                   |
| Prototype pollution               | All                | ❌ Doesn't affect private fields or function identity |
| Skip `verifyFn` call              | `verify()`         | ❌ Blocked — always called unconditionally            |
| Mutate input after construction   | Constructor        | ❌ Blocked — defensive copy on construction           |
| Mutate via retained reference     | Constructor        | ❌ Blocked — defensive copy disconnects reference     |
| SharedArrayBuffer race condition  | `verify()`         | ❌ Blocked — defensive copy creates isolated buffer   |
| Direct instance creation          | Constructor        | ❌ Blocked — factory token check (runtime)            |
| Post-creation state modification  | Class design       | ❌ Blocked — no mutators, readonly fields             |

---

## ES Module Import Security Pattern

This pattern is secure for any trusted module:

```typescript
import { fooFn } from 'bar.js';

export function bazFunc(value: number): boolean {
  if (value > 0) {
    return fooFn();
  }
  return true;
}
```

**Guarantees** (assuming `bar.js` is trusted and JS engine is not compromised):

1. `fooFn` **cannot be altered** between import and use
2. Caller **cannot substitute** `fooFn` with a different function
3. Caller **only controls** the `value` argument
4. Return value comes directly from `fooFn()` or the literal `true`

---

## Final Verdict

**✅ SECURE** — The complete model satisfies all stated requirements.

The combination of:

1. **Immutability** — Defensive copies + private encapsulation + no mutators
2. **Unforgeable brand** — ES2022 private field brand check (`#brand in object`)
3. **Controlled creation** — Factory token pattern (runtime enforcement) + validation
4. **Defensive access** — Copy passed to `verifyFn`, not original
5. **Runtime validation** — `isValid()` check before use
6. **Immutable imports** — ES module bindings cannot be reassigned

...provides a robust guarantee that `verifyFunc` will only ever receive authentic, unmodified data from genuine `AuthenticData` instances.

### Immutability Guarantee Summary

```
Construction:  input → copy → store (in #privateField)
                       ↑
                       └── Caller's reference is disconnected (new ArrayBuffer created)

Access:        #privateField → copy → verifyFn
                               ↑
                               └── verifyFn receives isolated copy (new ArrayBuffer)
```

**Key insight**: `new Uint8Array(source)` creates a completely new `ArrayBuffer`, not a view.
This means the copy is fully independent—mutations to either do not affect the other.

Once constructed, an `AuthenticData` instance cannot be modified by any code path.

## AuthenticData Creation

Authentic data must be created through controlled entry points that guarantee authenticity at construction time.

### Factory Methods Accept Untrusted Input

**Critical**: All factory methods (`from`, `fromComponents`, `fromValidated`, etc.) MUST be designed to accept **untrusted input**. The caller may be malicious and can pass:

- Primitives with wrong types or invalid values
- Duck-typed fake objects mimicking AuthenticData
- Objects from different realms
- `null`, `undefined`, or any other value

Factory methods are the **trust boundary**. They MUST validate everything before construction:

| Input Type | Validation Required | Example |
| --- | --- | --- |
| Primitives | Type + semantic validation | `assertIsUint64(chainId)` |
| Nested AuthenticData | `Class.isValid()` check | `if (!NestedClass.isValid(obj)) throw` |
| Arrays of AuthenticData | `isValid()` on each element | `items.every(x => Item.isValid(x))` |
| Raw bytes | Type + length + format validation | `assertIsBytes32(hash)` |

```typescript
// ❌ INSECURE — trusts input without validation
static from(source: SourceType): AuthenticData {
  return new AuthenticData(FACTORY_TOKEN, source.data);  // source could be fake!
}

// ✅ SECURE — validates all input before use
static from(source: unknown): AuthenticData {
  // 1. Validate it's an object
  if (typeof source !== 'object' || source === null) {
    throw new Error('Invalid source: expected object');
  }

  // 2. Validate nested AuthenticData using isValid()
  const s = source as Record<string, unknown>;
  if (!NestedAuthentic.isValid(s.nested)) {
    throw new Error('Invalid nested authentic data');
  }

  // 3. Validate primitives
  assertIsUint64(s.chainId);
  assertIsBytes(s.data);

  // 4. Only after ALL validation passes, create instance
  return new AuthenticData(FACTORY_TOKEN, validatedData);
}
```

### Entry Points

| Method                              | Input Type      | Validation Required                           |
| ----------------------------------- | --------------- | --------------------------------------------- |
| `AuthenticData.from(source)`        | `unknown`       | Full validation of all fields                 |
| `AuthenticData.fromComponents(...)` | `unknown`       | Type + semantic validation of each component  |
| `AuthenticData.fromValidated(...)`  | `unknown`       | Cryptographic or trusted-source validation    |

### Validation-Based Creation

When creating from raw/untrusted input, authenticity is established by:

1. **Type validation** — Ensuring data matches expected types (e.g., `isBytes32`, `isChecksummedAddress`)
2. **Semantic validation** — Verifying data satisfies domain constraints (e.g., valid FheTypeId range)
3. **Cryptographic validation** — Proving authenticity via signatures, hashes, or proofs (e.g., ZK proofs)

```typescript
// Example: Creating authentic data from validated primitive components
static fromComponents(params: {
  chainId: unknown;
  address: unknown;
  data: unknown;
}): AuthenticData {
  // Validation functions throw if invalid
  assertIsUint64(params.chainId);
  assertIsChecksummedAddress(params.address);
  assertIsBytes(params.data);

  // After validation, data is authentic
  return new AuthenticData({
    chainId: params.chainId,
    address: params.address,
    data: params.data,
  });
}
```

### Transitive Authenticity

When a factory method receives another authentic class as argument, it **must** validate via `isValid()` before extracting data. Authenticity is then **transitively inherited**.

```typescript
// Example: Creating AuthenticData from an authentic source object
static fromSource(source: SourceAuthentic): AuthenticData {
  // ⚠️ CRITICAL: Validate the source is genuine before using its data
  if (!SourceAuthentic.isValid(source)) {
    throw new Error('Invalid SourceAuthentic');
  }

  // After validation, source data is authentic
  // Authenticity is transitively inherited — no further validation needed
  return new AuthenticData({
    chainId: source.chainId,      // Authentic by transitivity
    address: source.address,      // Authentic by transitivity
    data: source.data,            // Authentic by transitivity
  });
}
```

**Transitive authenticity chain**:

```
SourceAuthentic.isValid(source) ✅
        ↓
source.chainId is authentic
        ↓
AuthenticData.chainId inherits authenticity
        ↓
AuthenticData instance is authentic
```

| Step                                | Guarantee                                        |
| ----------------------------------- | ------------------------------------------------ |
| 1. `isValid(source)` passes         | `source` is a genuine `SourceAuthentic` instance |
| 2. Access `source.chainId`          | Value was validated when `source` was created    |
| 3. Pass to `new AuthenticData(...)` | Authenticity inherited without re-validation     |

### Trust Boundary

The factory token pattern ensures only factory methods can create instances at **runtime** (not just compile-time). The `FACTORY_TOKEN` symbol is module-private and cannot be accessed by external code.

This establishes a single trust boundary: **if you have an `AuthenticData` instance, its data is authentic by construction**.

> **Note**: TypeScript's `private constructor` only provides compile-time enforcement.
> At runtime, JavaScript allows `new ClassName()` on any class.
> The factory token pattern provides true runtime protection.

---

## AuthenticData as Function Argument

**Critical**: When a function receives an `AuthenticData` as argument, it **must** call `isValid()` before use. Having a reference does not guarantee authenticity — the caller could pass a duck-typed fake.

### Validation Requirement

```typescript
// ❌ INSECURE — no validation
function process(data: AuthenticData): void {
  data.verify(verifyFunc); // Caller could pass a fake object
}

// ✅ SECURE — validates before use
function process(data: AuthenticData): void {
  if (!AuthenticData.isValid(data)) {
    throw new Error('Invalid AuthenticData');
  }
  data.verify(verifyFunc); // Guaranteed to be genuine
}
```

### Why This Is Required

| Scenario                         | Without `isValid()` | With `isValid()` |
| -------------------------------- | ------------------- | ---------------- |
| Caller passes genuine instance   | ✅ Works            | ✅ Works         |
| Caller passes duck-typed fake    | ❌ Bypassed         | ✅ Blocked       |
| Caller passes `null`/`undefined` | ❌ Runtime error    | ✅ Blocked       |
| Caller passes wrong class        | ❌ Unpredictable    | ✅ Blocked       |

### Rule

**Every function that receives `AuthenticData` from an untrusted caller must validate with `isValid()` before accessing any instance methods or properties.**

This applies to:

- Public API entry points
- Callbacks receiving user-provided data
- Any function where the caller is not part of the trusted module
