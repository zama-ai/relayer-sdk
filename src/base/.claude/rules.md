# Mandatory rules

- classes must be immutable
- classes properties must all be Javascript private (#myproperty)
- classes constructor must be privately protected at runtime using a token Symbol mechanism
- Enforce Strong TypeScript types (compile-time safety)
- Always perform Input validation at API boundaries
- Always Rely on cryptographic verification
- Always implement safe toString() / toJSON()
- Disable logging of sensitive values
- Follow established linting rules (ESLint config)
- Always use strictest ESLint rules and TSC compilation flags
- Code must be tree-shakable.
- Do not allow code practices that would make the tree-shaking harder or impossible

# WASM Rules

- Always use an internal token pattern (see ./internal-token-pattern.md) to protect access to WASM pointers
- WASM pointers should never be accessible from outside the lowlevel part of the SDK
- Ensure proper WASM memory management (call free() when necessary especially in a server context)
- When needed, ensure proper WASM Bounds management. Wrap all WASM calls in try/finally blocks ensuring pointers are valid.

# Global Scope Rules

- Never read global variables
- Never write global variables
- Never extend external classes

# Dependency Rules

- Only depends on @noble/hashes, tfhe, tkms, node-tfhe, node-tkms packages
- Note: node-tfhe/node-tkms are WASM-based, not native addons

# Crypto Layer Rules (sdk/lowlevel/, base/)

- Pure implementation (no native node addons)
- Audit-ready: code structured for manual review
- Data Hygiene: validate inputs before WASM calls
- Memory Safety: no out-of-bounds WASM memory access
- Copy-Zeroing: zero secrets after use (best effort)

# Authenticity Branding rules

- Use authenticity branding as a defense for EncryptedInput (builder).
- Do not use authenticity branding in any other objects
- Pattern: Don't brand objects that are outputs or cross boundaries
- Brand: Objects with sensitive internal state that stay within the SDK
- Don't brand: Objects that are outputs, serializable, or meant to cross boundaries
- The goal is protecting internal integrity, not output authenticity (which crypto verification handles).

# Summary

| Class                        | Brand? | Reason                                               |
| ---------------------------- | ------ | ---------------------------------------------------- |
| `EncryptedInput`             | ✅ Yes | Holds pending plaintexts (sensitive)                 |
| `ZKProof`                    | ❌ No  | Ciphertext is encrypted, verified by relayer         |
| `TFHEPublicKey`              | ❌ No  | Public key, validated when loaded                    |
| `TFHEPkeCrs`                 | ❌ No  | Public parameter, validated when loaded              |
| `FhevmHandle`                | ❌ No  | Portable, crosses serialization boundaries           |
| `InputProof`                 | ❌ No  | Output bytes sent to contracts                       |
| `PublicDecryptionProof`      | ❌ No  | Output bytes sent to contracts                       |
| `CoprocessorSignersVerifier` | ❌ No  | Addresses from contract, no sensitive internal state |
| `ACL`                        | ❌ No  | Utility class, no sensitive state                    |

# Rules for SDK maintainers

## Error Handling Rules

- All errors must extend a base SDK error class
- Error messages must not leak sensitive data (plaintexts, keys)
- Include context in errors (what operation failed, not what data was involved)
- Use typed errors for different failure modes (ValidationError, NetworkError, etc.)

## Naming Conventions

- Factory methods: `from*()`, `create*()`
- Validation: `is*()` for boolean checks, `assert*()` for throwing
- Casting: `as*()`, casting functions always throws if failed
- Async methods: return `Promise<T>` (be consistent)
- Private methods: prefix with `_` in addition to `#` for internal helpers

## Deprecation Rules

- Use @deprecated JSDoc tag with migration path
- Maintain deprecated APIs for at least one minor version
- Log warning on first use of deprecated API (not sensitive data)

# Rules for SDK users

# API Consistency Rules

- All public factory methods accept params as a single object: `fn({ param1, param2 })`
- All public methods return typed results, never `any`
- Async operations always return `Promise<T>`, never use callbacks
- Optional parameters have sensible defaults

# Documentation Rules

- All public APIs must have JSDoc with @param, @returns, @throws
- Include usage examples in JSDoc for complex methods
- Document security considerations where relevant
