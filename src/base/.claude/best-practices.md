# Development Patterns for Exported Classes and Functions

## Core Principles

Given that:

- SDK runs in **same global scope** as untrusted page
- SDK **does NOT trust** the host page
- Built-in hijacking defense is **futile**
- SDK handles **sensitive cryptographic materials**

**Focus on:**

1. ✅ **Input validation** (assume all inputs are hostile)
2. ✅ **Output sanitization** (prevent data leaks)
3. ✅ **Fail-fast** (detect tampering early)
4. ❌ **Don't rely on** type checks, instanceof, or constructor names

---

## Pattern 1: Exported Function Signature

### ✅ GOOD: Object Parameters with Validation

```typescript
export function userDecrypt(params: {
  handles: HandleContractPair[];
  privateKey: string;
  publicKey: string;
  signature: string;
  // ... other params
}): Promise<UserDecryptResults> {
  // Step 1: Validate params is a plain object
  validatePlainObject(params, 'params');

  // Step 2: Extract and validate each parameter ONCE
  const handles = validateHandles(params.handles);
  const privateKey = validatePrivateKey(params.privateKey);
  const publicKey = validatePublicKey(params.publicKey);
  const signature = validateSignature(params.signature);

  // Step 3: Use extracted values (not params.xxx) to avoid TOCTOU
  return performDecryption(handles, privateKey, publicKey, signature);
}
```

**Defends against:**

- ❌ Parameter tampering (#4)
- ❌ TOCTOU attacks (#29)
- ❌ Type confusion (#9)
- ❌ Prototype pollution fallback

---

### ❌ BAD: Individual Parameters

```typescript
// DON'T DO THIS
export function userDecrypt(
  handles: HandleContractPair[],
  privateKey: string,
  publicKey: string,
  signature: string,
): Promise<UserDecryptResults> {
  // Problems:
  // - No validation wrapper
  // - Hard to version (can't add optional params)
  // - Caller can use spread with polluted arrays
}
```

---

## Pattern 2: Input Validation

### Core Validation Module

```typescript
// src/base/validation.ts

/**
 * Validate that value is a plain object (not null, not array, no prototype pollution)
 * Defends against: #4 (parameter tampering), #29 (TOCTOU)
 */
export function validatePlainObject(
  value: unknown,
  paramName: string,
): asserts value is Record<string, unknown> {
  // Check it's an object
  if (value === null || typeof value !== 'object') {
    throw new TypeError(`${paramName} must be an object`);
  }

  // Check it's not an array
  if (Array.isArray(value)) {
    throw new TypeError(`${paramName} must be a plain object, not an array`);
  }

  // Check prototype is Object.prototype (not polluted)
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    throw new TypeError(
      `${paramName} must be a plain object with no custom prototype`,
    );
  }
}

/**
 * Check if parameter exists as own property (not inherited from prototype)
 * Defends against: #4 (parameter tampering via prototype)
 */
export function hasOwnProperty<T extends object>(
  obj: T,
  key: PropertyKey,
): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Extract and validate required parameter
 * Defends against: #29 (TOCTOU - read once, use once)
 */
export function extractRequired<T>(
  params: Record<string, unknown>,
  key: string,
  validator: (value: unknown) => T,
): T {
  // Check property exists as own property
  if (!hasOwnProperty(params, key)) {
    throw new Error(`Missing required parameter: ${key}`);
  }

  // Extract value ONCE (avoid TOCTOU by getter)
  const value = params[key];

  // Validate and return
  return validator(value);
}

/**
 * Validate string (no objects with toString hijacking)
 * Defends against: #5 (toString hijacking), #11 (Symbol.toPrimitive)
 */
export function validateString(value: unknown, paramName: string): string {
  // Check type using typeof (not instanceof String)
  if (typeof value !== 'string') {
    throw new TypeError(`${paramName} must be a string (got ${typeof value})`);
  }

  // Don't coerce! If it's not a primitive string, reject it
  return value;
}

/**
 * Validate Uint8Array (don't trust instanceof or constructor.name)
 * Defends against: #9 (type confusion), #2 (constructor hijacking)
 */
export function validateUint8Array(
  value: unknown,
  paramName: string,
): Uint8Array {
  // Use Object.prototype.toString for reliable type checking
  if (Object.prototype.toString.call(value) !== '[object Uint8Array]') {
    throw new TypeError(`${paramName} must be a Uint8Array`);
  }

  return value as Uint8Array;
}

/**
 * Validate array and its elements
 * Defends against: #12 (array method poisoning)
 */
export function validateArray<T>(
  value: unknown,
  paramName: string,
  elementValidator: (item: unknown, index: number) => T,
): T[] {
  // Check it's actually an array
  if (!Array.isArray(value)) {
    throw new TypeError(`${paramName} must be an array`);
  }

  // Don't use .map() or other array methods (could be poisoned)
  // Use for loop instead
  const result: T[] = [];
  for (let i = 0; i < value.length; i++) {
    // Access element directly (not via .at() which could be hijacked)
    if (hasOwnProperty(value, i)) {
      result.push(elementValidator(value[i], i));
    }
  }

  return result;
}

/**
 * Validate hex string format (addresses, hashes, etc.)
 */
export function validateHexString(value: unknown, paramName: string): string {
  const str = validateString(value, paramName);

  // Don't use regex.test() - could be poisoned (#19)
  // Use string methods instead
  if (str.length < 2) {
    throw new Error(`${paramName} must be a valid hex string`);
  }

  // Check prefix manually
  const hasPrefix = str[0] === '0' && (str[1] === 'x' || str[1] === 'X');
  const hexPart = hasPrefix ? str.slice(2) : str;

  // Validate hex characters manually
  for (let i = 0; i < hexPart.length; i++) {
    const code = hexPart.charCodeAt(i);
    const isHex =
      (code >= 48 && code <= 57) || // 0-9
      (code >= 65 && code <= 70) || // A-F
      (code >= 97 && code <= 102); // a-f

    if (!isHex) {
      throw new Error(
        `${paramName} contains invalid hex character at position ${i}`,
      );
    }
  }

  return str;
}
```

---

## Pattern 3: Exported Function Implementation

### Example: Public Decrypt Function

```typescript
// src/relayer/publicDecrypt.ts

export function publicDecryptRequest(config: {
  kmsSigners: string[];
  thresholdSigners: number;
  gatewayChainId: number;
  verifyingContractAddressDecryption: string;
  aclContractAddress: string;
  relayerProvider: AbstractRelayerProvider;
  provider: ethers.Provider;
  defaultOptions: Record<string, unknown>;
}) {
  // Return the actual function that users will call
  return async function publicDecrypt(params: {
    handles: (string | Uint8Array)[];
    options?: RelayerPublicDecryptOptionsType;
  }): Promise<PublicDecryptResults> {
    // STEP 1: Validate params structure
    validatePlainObject(params, 'params');

    // STEP 2: Extract and validate each parameter ONCE
    const handles = extractRequired(params, 'handles', (value) =>
      validateArray(value, 'handles', (item, index) => {
        // Each handle can be string or Uint8Array
        if (typeof item === 'string') {
          return validateHexString(item, `handles[${index}]`);
        } else {
          return validateUint8Array(item, `handles[${index}]`);
        }
      }),
    );

    // Optional parameter
    const options = hasOwnProperty(params, 'options')
      ? validatePlainObject(params.options, 'options')
      : {};

    // STEP 3: Use extracted values (not params.xxx)
    // Create defensive copies of arrays to prevent mutation
    const safeHandles = handles.slice();

    // STEP 4: Perform operation
    return performPublicDecrypt(safeHandles, options, config);
  };
}

// Internal function - not exported, uses validated inputs
async function performPublicDecrypt(
  handles: (string | Uint8Array)[],
  options: Record<string, unknown>,
  config: {
    /* ... */
  },
): Promise<PublicDecryptResults> {
  // Implementation here
  // No need to re-validate since inputs are already validated
}
```

**Key points:**

1. ✅ Validate structure first
2. ✅ Extract values ONCE (prevents TOCTOU)
3. ✅ Use extracted values, not `params.xxx`
4. ✅ Create defensive copies of mutable inputs
5. ✅ Separate validation from business logic

---

## Pattern 4: Exported Class Design

### ✅ GOOD: Immutable, Frozen Class

```typescript
// src/sdk/ZKProof.ts

export class ZKProof {
  // Use # private fields (not _ prefix)
  #handles: Uint8Array;
  #proof: Uint8Array;
  #aclAddress: string;
  #chainId: bigint;

  // Private constructor - force use of factory methods
  private constructor(components: {
    handles: Uint8Array;
    proof: Uint8Array;
    aclAddress: string;
    chainId: bigint;
  }) {
    // Validate inputs
    this.#handles = validateUint8Array(components.handles, 'handles');
    this.#proof = validateUint8Array(components.proof, 'proof');
    this.#aclAddress = validateHexString(components.aclAddress, 'aclAddress');
    this.#chainId = validateBigInt(components.chainId, 'chainId');

    // Freeze the instance to prevent:
    // - Method replacement (#3)
    // - Property addition
    // - Property deletion
    Object.freeze(this);
  }

  // Factory method with validation
  public static fromComponents(params: {
    handles: Uint8Array | string;
    proof: Uint8Array | string;
    aclAddress: string;
    chainId: bigint | number;
    copy?: boolean;
  }): ZKProof {
    // Validate params
    validatePlainObject(params, 'params');

    // Extract and normalize inputs
    const handles =
      typeof params.handles === 'string'
        ? hexToUint8Array(params.handles)
        : validateUint8Array(params.handles, 'handles');

    const proof =
      typeof params.proof === 'string'
        ? hexToUint8Array(params.proof)
        : validateUint8Array(params.proof, 'proof');

    // Create defensive copies if requested (default: true)
    const copy = params.copy !== false;

    return new ZKProof({
      handles: copy ? handles.slice() : handles,
      proof: copy ? proof.slice() : proof,
      aclAddress: validateHexString(params.aclAddress, 'aclAddress'),
      chainId: BigInt(params.chainId),
    });
  }

  // Getters return defensive copies (prevent external mutation)
  public getHandles(): Uint8Array {
    return this.#handles.slice(); // Return copy, not reference
  }

  public getProof(): Uint8Array {
    return this.#proof.slice();
  }

  public getAclAddress(): string {
    return this.#aclAddress; // Strings are immutable, safe to return
  }

  public getChainId(): bigint {
    return this.#chainId; // BigInt is immutable, safe to return
  }

  // Serialize to plain object (for JSON, etc.)
  public toJSON(): {
    handles: string;
    proof: string;
    aclAddress: string;
    chainId: string;
  } {
    // Never use template literals with sensitive data!
    // Use explicit conversion methods
    return {
      handles: uint8ArrayToHex(this.#handles),
      proof: uint8ArrayToHex(this.#proof),
      aclAddress: this.#aclAddress,
      chainId: String(this.#chainId), // Explicit conversion
    };
  }

  // Never implement toString or valueOf!
  // Prevents prototype pollution leaks (#1, #5, #11)
}
```

**Defends against:**

- ❌ Method replacement (#3) - Object.freeze
- ❌ External mutation - defensive copies
- ❌ toString/valueOf hijacking (#5, #11) - no custom implementations
- ❌ Property access via prototype - # private fields

---

### ❌ BAD: Mutable, Public Properties

```typescript
// DON'T DO THIS
export class ZKProof {
  // Public properties - can be replaced!
  public handles: Uint8Array;
  public proof: Uint8Array;

  constructor(handles: Uint8Array, proof: Uint8Array) {
    this.handles = handles; // Stores reference - caller can mutate!
    this.proof = proof;
    // Not frozen - methods can be replaced!
  }

  // Custom toString - can leak data via prototype pollution
  toString(): string {
    return `ZKProof(${this.handles})`;
  }
}

// Attacker can:
const zkp = new ZKProof(handles, proof);
zkp.getProof = () => stealProof(); // Replace method
zkp.handles = attackerHandles; // Replace property
```

---

## Pattern 5: No String Coercion of Sensitive Data

### ✅ GOOD: Explicit Conversion

```typescript
export function logDebugInfo(handle: Uint8Array): void {
  if (process.env.DEBUG) {
    // Use explicit conversion function
    const hexString = uint8ArrayToHex(handle);

    // Use structured logging (not template literals)
    console.log('Handle:', hexString);
  }
}

// Conversion utility
function uint8ArrayToHex(bytes: Uint8Array): string {
  // Don't use Array.from or .map (could be poisoned)
  let result = '0x';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // Use explicit hex conversion
    result += (byte < 16 ? '0' : '') + byte.toString(16);
  }
  return result;
}
```

---

### ❌ BAD: Implicit Coercion

```typescript
// DON'T DO THIS
export function logDebugInfo(privateKey: Uint8Array): void {
  // Template literal triggers toString - can be hijacked!
  console.log(`Private key: ${privateKey}`);

  // String concatenation - same problem
  const msg = 'Key: ' + privateKey;

  // JSON.stringify - can be hijacked (#13)
  const json = JSON.stringify({ key: privateKey });
}
```

---

## Pattern 6: Return Values Must Be Immutable or Copies

### ✅ GOOD: Return Defensive Copies

```typescript
export class FhevmInstance {
  #publicKey: Uint8Array | null = null;

  public getPublicKey(): { publicKeyId: string; publicKey: Uint8Array } | null {
    if (this.#publicKey === null) {
      return null;
    }

    // Return defensive copy - caller can't mutate our internal state
    return {
      publicKeyId: this.#publicKeyId,
      publicKey: this.#publicKey.slice(), // Copy!
    };
  }
}
```

---

### ❌ BAD: Return Internal References

```typescript
// DON'T DO THIS
export class FhevmInstance {
  private publicKey: Uint8Array | null = null;

  public getPublicKey(): Uint8Array | null {
    // Returns reference - caller can mutate!
    return this.publicKey;
  }
}

// Attacker can:
const pk = instance.getPublicKey();
pk[0] = 0; // Corrupts internal state!
```

---

## Pattern 7: No Callbacks with Sensitive Data

### ✅ GOOD: Return Promises, No Callbacks

```typescript
export async function generateKeypair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  // Generate keys
  const keys = await performKeyGeneration();

  // Return directly - no callbacks that could retain references
  return {
    publicKey: keys.public,
    privateKey: keys.private,
  };
}
```

---

### ❌ BAD: Callbacks with Sensitive Data

```typescript
// DON'T DO THIS
export function generateKeypair(
  onComplete: (publicKey: string, privateKey: string) => void,
): void {
  // Problem: callback could retain privateKey in closure (#27)
  performKeyGeneration().then((keys) => {
    onComplete(keys.public, keys.private);
  });
}

// Attacker can:
let leakedKey: string;
generateKeypair((pub, priv) => {
  leakedKey = priv; // Retained forever!
});
```

---

## Pattern 8: Compromise Detection at Initialization

### Add to SDK Entry Point

```typescript
// src/index.ts

// Check for obvious tampering before initializing
function detectCompromise(): string | null {
  try {
    // Check critical APIs exist and have correct types
    if (typeof Uint8Array !== 'function') {
      return 'Uint8Array is not a function';
    }

    if (typeof crypto?.getRandomValues !== 'function') {
      return 'crypto.getRandomValues is not available';
    }

    if (typeof fetch !== 'function') {
      return 'fetch is not a function';
    }

    // Check for obvious prototype pollution
    if (hasOwnProperty(Object.prototype, 'toString')) {
      // Note: toString SHOULD be on Object.prototype
      // Check if it's been replaced
      const desc = Object.getOwnPropertyDescriptor(
        Object.prototype,
        'toString',
      );
      if (desc && desc.configurable) {
        return 'Object.prototype.toString has been modified';
      }
    }

    // Check for suspicious properties on Object.prototype
    const suspiciousKeys = [
      '__proto__',
      'constructor',
      'privateKey',
      'password',
    ];
    for (const key of suspiciousKeys) {
      if (hasOwnProperty(Object.prototype, key) && key !== 'constructor') {
        return `Prototype pollution detected: Object.prototype.${key}`;
      }
    }

    return null; // No obvious tampering
  } catch (error) {
    return 'Error during compromise detection';
  }
}

export const createInstance = async (
  config: FhevmInstanceConfig,
): Promise<FhevmInstance> => {
  // Detect compromise before initializing
  const compromiseReason = detectCompromise();
  if (compromiseReason) {
    throw new Error(
      `Unsafe environment detected: ${compromiseReason}. ` +
        `This SDK cannot operate securely in the current environment. ` +
        `Please ensure the page has no XSS vulnerabilities and uses CSP.`,
    );
  }

  // Continue with initialization...
  const relayerFhevm = await createRelayerFhevm(config);
  // ...
};
```

---

## Pattern 9: Summary Checklist for Every Exported API

### For Exported Functions

- [ ] Parameters are taken as single object
- [ ] Validate params is plain object (no prototype pollution)
- [ ] Extract each parameter ONCE (prevent TOCTOU)
- [ ] Use extracted values, not `params.xxx`
- [ ] Validate strings with `typeof === 'string'` (not instanceof)
- [ ] Validate typed arrays with `Object.prototype.toString.call()`
- [ ] Never use template literals with sensitive data
- [ ] Never call `.toString()`, `.valueOf()`, or `String()` on inputs
- [ ] Create defensive copies of mutable inputs (arrays, TypedArrays)
- [ ] Return defensive copies of mutable values
- [ ] No callbacks that receive sensitive data
- [ ] Return Promises instead of callbacks

### For Exported Classes

- [ ] Use `# private` fields (not `_private` or public)
- [ ] Call `Object.freeze(this)` in constructor
- [ ] Private constructor + static factory method
- [ ] Validate all inputs in factory method
- [ ] Store defensive copies of mutable inputs
- [ ] Getters return defensive copies
- [ ] NO custom `toString()` or `valueOf()` implementations
- [ ] NO custom `[Symbol.toPrimitive]` implementations
- [ ] Provide explicit `toJSON()` or `toBytes()` methods
- [ ] Use explicit conversions (never coercion)

### For Module Initialization

- [ ] Detect compromise before initializing
- [ ] Fail-fast with clear error message
- [ ] Document security requirements (HTTPS, CSP, SRI)
- [ ] Never log sensitive data (even in debug mode)
- [ ] Use structured logging (not string concatenation)

---

## Pattern 10: Testing Your Defenses

Create test files that simulate attacks:

```typescript
// tests/security/toctou.test.ts

describe('TOCTOU Defense', () => {
  it('should prevent getter-based TOCTOU attack', async () => {
    let accessCount = 0;

    const maliciousParams = {
      get privateKey() {
        accessCount++;
        return accessCount === 1 ? 'valid-key' : 'attacker-key';
      },
    };

    // Should fail validation because getter changes value
    await expect(sdk.userDecrypt(maliciousParams)).rejects.toThrow();
  });
});

// tests/security/prototype-pollution.test.ts

describe('Prototype Pollution Defense', () => {
  it('should reject objects with polluted prototype', () => {
    Object.prototype.privateKey = 'attacker-key';

    const params = { handles: [...] };
    // params.privateKey now returns 'attacker-key' via prototype!

    // Should fail validation
    expect(() => sdk.validateParams(params)).toThrow();

    delete Object.prototype.privateKey;
  });
});
```

---

## Quick Reference Summary

| Pattern         | ✅ Do                                        | ❌ Don't                            |
| --------------- | -------------------------------------------- | ----------------------------------- |
| **Parameters**  | Single object param                          | Multiple individual params          |
| **Validation**  | Extract once, validate                       | Use `params.xxx` multiple times     |
| **Type checks** | `typeof`, `Object.prototype.toString.call()` | `instanceof`, `constructor.name`    |
| **Strings**     | `typeof === 'string'`                        | String coercion, template literals  |
| **Arrays**      | For loops, defensive copies                  | `.map()`, `.filter()`, stored refs  |
| **Classes**     | `# private`, `Object.freeze()`               | Public properties, mutable          |
| **Returns**     | Defensive copies, immutable                  | Internal references                 |
| **Conversion**  | Explicit functions                           | `toString()`, `valueOf()`, coercion |
| **Logging**     | Structured, no sensitive data                | Template literals with data         |
| **Callbacks**   | Promises only                                | Callbacks with sensitive data       |

---

## Why These Patterns Matter

### Without These Patterns

```typescript
// Vulnerable code
export function decrypt(handle: string, key: string): string {
  console.log(`Decrypting ${handle} with key ${key}`); // Leak via console hijacking
  const result = performDecrypt(handle, key);
  return result.toString(); // Leak via toString hijacking
}

const handle = { toString: () => stealData() };
decrypt(handle, key); // Attacker wins
```

### With These Patterns

```typescript
// Secure code
export function decrypt(params: { handle: string; key: string }): string {
  validatePlainObject(params, 'params');
  const handle = extractRequired(params, 'handle', validateString);
  const key = extractRequired(params, 'key', validateString);

  // No coercion, no logging sensitive data
  return performDecrypt(handle, key);
}

const maliciousParams = { toString: () => stealData() };
decrypt(maliciousParams); // Throws error, attacker blocked
```

---

## Additional Resources

- See [attacks.md](./attacks.md) for complete attack catalog
- See [sdk-context.md](./sdk-context.md) for SDK architecture
- See [defenses.md](./defenses.md) for mitigation strategies

---

## Implementation Priority

### Phase 1: Critical (Implement First)

1. Input validation module (`src/base/validation.ts`)
2. Compromise detection at SDK initialization
3. Refactor all exported functions to use object parameters
4. Add TOCTOU defense (extract once, use once)

### Phase 2: Important (Implement Soon)

1. Freeze all exported class instances
2. Convert public fields to # private fields
3. Remove all custom toString/valueOf implementations
4. Add defensive copies for all returns

### Phase 3: Comprehensive (Implement Eventually)

1. Security test suite
2. Documentation updates
3. Migration guide for users
4. Automated linting rules
