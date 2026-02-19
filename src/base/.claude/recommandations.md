# Required Security Conditions

## For All Exported Functions

### Input Validation

// Validate parameters are plain objects
if (params === null || typeof params !== 'object') throw new Error();
if (Object.getPrototypeOf(params) !== Object.prototype) throw new Error();
Type Guards

// Never trust instanceof or constructor.name
function isRealUint8Array(value: unknown): value is Uint8Array {
return Object.prototype.toString.call(value) === '[object Uint8Array]';
}

### Own Property Checks

// Use hasOwnProperty, not 'in' operator
if (!Object.prototype.hasOwnProperty.call(params, 'privateKey')) {
throw new Error('Missing required parameter');
}

### Defensive Copying

// Clone inputs to prevent mutation
const safeParams = Object.assign(Object.create(null), params);

### No String Coercion

// Never use string interpolation with sensitive data
// BAD: console.log(`Key: ${privateKey}`)
// GOOD: Use structured logging

## For All Exported Classes

### Object Freezing

export class ZKProof {
constructor(data) {
Object.freeze(this); // Prevent method replacement
Object.seal(this); // Prevent property addition
}
}

### Method Binding

constructor() {
// Bind methods to prevent 'this' hijacking
this.encrypt = this.encrypt.bind(this);
}

### Private Fields

// Use # private fields (not \_private)
#privateKey: Uint8Array;

## Internal/Non-Exported Code

### Capture Built-ins Early

// At SDK initialization, capture pristine built-ins
const SafeUint8Array = Uint8Array;
const SafeObject = Object;
const SafeFetch = fetch;
const SafePromise = Promise;

### Use Captured Built-ins

// Always use captured versions
const buffer = new SafeUint8Array(32);

### No Globals

// Never read from window/globalThis except during init

# Recommended Mitigations

1. Early Built-in Capture (critical)
2. Strict Type Validation (validate all inputs)
3. Object Freezing (prevent method replacement)
4. Isolate fetch (use captured fetch with validation)
5. No String Coercion (never coerce sensitive data to strings)
6. CSP Headers (recommend users set Content-Security-Policy)
