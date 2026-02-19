# Export Management for `./src/base/index.ts`

## Goal

Ensure all public APIs from `./src/base/*.ts` files are properly exported via `index.ts` for optimal tree-shaking and bundle optimization.

## Rules

### 1. Named Exports Only (No Wildcards)

- **DO NOT** use wildcard exports like `export * from './module'`
- **DO** list each function, constant, class, and type individually
- This enables bundlers (webpack, rollup, esbuild) to tree-shake unused exports

```typescript
// ❌ BAD - prevents tree-shaking
export * from './uint';

// ✅ GOOD - enables tree-shaking
export { MAX_UINT8, MAX_UINT16, isUint, asUint } from './uint';
```

### 2. Export All Public Functions, Constants, and Classes

For each `*.ts` file in `./src/base/` (excluding `*.test.ts`):

- Export all `export function` declarations
- Export all `export const` declarations
- Export all `export class` declarations

### 3. Export All Public Types from `./types/primitives.d.ts`

- Export all `export type` declarations from `primitives.d.ts`
- Export all `export interface` declarations from `primitives.d.ts`
- Use `export type { ... }` syntax for type-only exports

### 4. Do NOT Export Types from `./types/private.d.ts`

The following types are internal implementation details and must NOT be exported:

- `RecordWithPropertyType`
- `RecordNonNullablePropertyType`
- `RecordArrayPropertyType`
- `RecordStringPropertyType`
- `RecordStringArrayPropertyType`
- `RecordBooleanPropertyType`
- `RecordUintPropertyType`
- `RecordUint256PropertyType`
- `RecordUint8ArrayPropertyType`
- `RecordChecksummedAddressPropertyType`
- `RecordChecksummedAddressArrayPropertyType`

### 5. Do NOT Export Internal/Private Functions

- Functions prefixed with `_` (e.g., `_toChecksummedAddress`) are internal and should NOT be exported
- Helper functions not marked as `export` in source files should NOT be exported

### 6. Do NOT Modify any file except ./src/base/index.ts

- only index.ts can be modified

## Why This Matters

- **Tree-shaking**: Bundlers can eliminate unused code when exports are named
- **Bundle size**: Smaller production bundles for consumers who only use a subset of the API
- **Clear API surface**: Explicit exports document what is public vs internal
