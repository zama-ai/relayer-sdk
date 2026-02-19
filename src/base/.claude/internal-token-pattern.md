internal.ts

```ts
// 🔒 Internal use only - Never exported to user
export const INTERNAL_TOKEN = Symbol('SDK_INTERNAL');
```

EncryptedInt.ts

```ts
import { INTERNAL_TOKEN } from './internal';

export class EncryptedInt {
  // 1. Hard Private Field
  #ptr: number;

  // 2. RESTRICTED CONSTRUCTOR (The "Internal" Factory)
  // This allows your pure functions to create instances, but blocks users.
  constructor(token: symbol, ptr: number) {
    if (token !== INTERNAL_TOKEN) {
      throw new Error('Illegal instantiation: Use EncryptedInt.create()');
    }
    // 3. State initialization happens INSIDE the class
    this.#ptr = ptr;
  }

  // 4. PUBLIC FACTORY (The "User" Factory)
  static create(value: number): EncryptedInt {
    const ptr = _wasm_alloc(value);
    return new EncryptedInt(INTERNAL_TOKEN, ptr);
  }

  // Helper for internal functions to get the pointer
  // (Using the WeakMap pattern discussed before is safer,
  // but for simplicity showing the accessor pattern here)
  getInternalPtr(token: symbol): number {
    if (token !== INTERNAL_TOKEN) throw new Error('Access Denied');
    return this.#ptr;
  }
}
```

math.ts

```ts
import { INTERNAL_TOKEN } from './internal';
import { EncryptedInt } from './EncryptedInt';

export function add(a: EncryptedInt, b: EncryptedInt): EncryptedInt {
  // 1. Get raw pointers using internal token
  const ptrA = a.getInternalPtr(INTERNAL_TOKEN);
  const ptrB = b.getInternalPtr(INTERNAL_TOKEN);

  // 2. Perform Logic
  const resultPtr = _wasm_add(ptrA, ptrB);

  // 3. Instantiate Result using Internal Constructor
  // This respects the class's control over creation
  return new EncryptedInt(INTERNAL_TOKEN, resultPtr);
}
```
