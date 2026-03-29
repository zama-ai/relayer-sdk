# Coding Conventions

## Control Flow

- Always use braces for `if` statements, no one-liners:

  ```ts
  // Bad
  if (x) return y;

  // Good
  if (x) {
    return y;
  }
  ```

## Bundler Compatibility

- Add `/* @vite-ignore */` to dynamic `import()` calls for Node.js modules (e.g. `node:worker_threads`)
- These imports are conditionally executed (browser vs Node) and should not trigger bundler warnings

## Isomorphic Code

- Node.js-specific imports must use dynamic `import()` behind environment checks
- Rename destructured Node globals to avoid TDZ issues with browser globals:

  ```ts
  // Bad — shadows global Worker in browser path
  const { Worker } = await import("node:worker_threads");

  // Good
  const { Worker: NodeWorker } = await import("node:worker_threads");
  ```

## Classes

- Guard class constructors with a module-level private token to prevent external instantiation:
  ```ts
  // Bad — anyone can new MyClass()
  class MyClassImpl {
    constructor(value: string) { ... }
  }

  // Good — only this module can instantiate
  const token = Symbol();
  class MyClassImpl {
    constructor(privateToken: symbol, value: string) {
      if (privateToken !== token) {
        throw new Error("Use createMyClass() instead");
      }
    }
  }
  ```
- Classes are used (over plain objects) to enable `instanceof` checks, ensuring the SDK can verify that data originates from itself
- Classes are internal only — the public API exposes types and interfaces, never classes
- Classes always implement a public type or interface (unless explicitly stated otherwise)
- Class private fields use `#` (native private), never `_`:
  ```ts
  // Bad
  _config: FhevmRuntimeConfig;

  // Good
  #config: FhevmRuntimeConfig;
  ```
- Module-scoped private functions use `_` prefix (e.g. `_decryptActions`, `_initDecrypt`).
  This is distinct from class fields — `_` is acceptable for non-exported functions at module scope.

## TypeScript

- All function parameter types must be `readonly` — the SDK never mutates caller data
- Use `readonly` for type properties that should not be mutated
- Prefer `Object.freeze()` for runtime immutability of info/config objects
- Use `Prettify<>` utility for intersection types exposed in public API
- Prefer `type` over `interface` unless explicitly stated otherwise:
  ```ts
  // Bad
  interface MyParams { readonly value: string; }

  // Good
  type MyParams = { readonly value: string; };
  ```
