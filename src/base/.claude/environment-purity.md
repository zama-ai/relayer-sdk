# Environment Purity Audit

> Extracted from [security-review.md](.claude/plans/security-review.md#1-environment-purity)

## Goal

Ensure core SDK directories contain only pure JavaScript/TypeScript with no environment-specific code (Node.js or browser APIs).

## Directories to Audit

The following directories must be **pure JavaScript/TypeScript**:

- `./errors`
- `./types`
- `.`

**IMPORTANT**: Always **ignore `.test.ts` files** when checking environment purity. Test files are not bundled and may legitimately use Node.js APIs for testing purposes.

---

## Forbidden APIs

### Forbidden Node.js APIs

These must NOT appear in the audited directories (excluding `.test.ts` files):

| API                                 | Reason                                    |
| ----------------------------------- | ----------------------------------------- |
| `fs`, `path`, `os`, `child_process` | File system / OS access                   |
| `crypto` (node:crypto)              | Use `@noble/hashes` or Web Crypto instead |
| `Buffer`                            | Use `Uint8Array` instead                  |
| `process`                           | Node.js-specific global                   |
| `__dirname`, `__filename`           | CommonJS path resolution                  |
| `require()`                         | CommonJS dynamic imports                  |
| `node:` protocol imports            | Explicit Node.js imports                  |

### Forbidden Web APIs

These must NOT appear in the audited directories (excluding `.test.ts` files):

| API                               | Reason                     |
| --------------------------------- | -------------------------- |
| `window`, `document`, `navigator` | Browser globals            |
| `localStorage`, `sessionStorage`  | Browser storage            |
| `XMLHttpRequest`                  | Legacy HTTP API            |
| Direct Web Worker instantiation   | Browser-specific threading |

### Allowed Cross-Environment APIs

These are acceptable:

| API                           | Reason                                          |
| ----------------------------- | ----------------------------------------------- |
| `fetch`                       | Native in Node.js 18+, SDK requires Node.js ≥22 |
| `TextEncoder` / `TextDecoder` | Available in both environments                  |
| `crypto.getRandomValues`      | Web Crypto API, available in Node.js 19+        |

### Allowed dependencies

| External Packaged | Reason               |
| ----------------- | -------------------- |
| `@noble/hashes`   | Audit crypto package |

**IMPORTANT**: No other dependency appart from the listed above are allowed. Check package.json accordingly
