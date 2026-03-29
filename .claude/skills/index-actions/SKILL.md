---
name: index-actions
description: Generate or update per-tier index files in src/core/actions/<tier>/index.ts by exporting all public action functions and their companion types. Use when actions have been added, removed, or renamed.
disable-model-invocation: true
---

# Index Actions

Each action tier has its own index file matching its entry point (see `.claude/api.md`):

- `src/core/actions/base/index.ts` → `@fhevm/sdk/actions/base`
- `src/core/actions/chain/index.ts` → `@fhevm/sdk/actions/chain`
- `src/core/actions/decrypt/index.ts` → `@fhevm/sdk/actions/decrypt`
- `src/core/actions/encrypt/index.ts` → `@fhevm/sdk/actions/encrypt`
- `src/core/actions/host/index.ts` → `@fhevm/sdk/actions/host`

Generate or update the `index.ts` in each tier folder so that every public action function in that folder is re-exported with its companion types. Each `index.ts` should not contain any other export.

If `$ARGUMENTS` is provided (e.g. `base`, `host`), only update that tier's index. Otherwise, update all tiers.

## Helper scripts

```bash
# List all the actions folders
ls -d src/core/actions/*/
```

```bash
# List all the actions functions for a specific tier (e.g. base)
grep -rn "^export.*function " src/core/actions/base/ --include="*.ts" --exclude="*-p.ts" --exclude="index.ts"
```

```bash
# List all the actions functions across all tiers
for dir in src/core/actions/*/; do
  grep -rn "^export.*function " "$dir" --include="*.ts" --exclude="*-p.ts" --exclude="index.ts"
done
```

## Rules

- All actions audited by `skills/audit-actions/SKILL.md` should be exported in their tier's `index.ts`
- Export action functions as well as types `<FunctionName>Parameters` and `<FunctionName>ReturnType`
- If a function has no `Parameters` type (no second argument), skip the `Parameters` type export
- If a function returns `void` or `Promise<void>` and has no named `ReturnType`, skip the `ReturnType` type export
- Imports use relative paths within the tier folder (e.g. `"./publicDecrypt.js"`, not `"./base/publicDecrypt.js"`)

```ts
// Good — function + Parameters + ReturnType
export {
  type CreateVerifiedInputProofFromRawBytesParameters,
  type CreateVerifiedInputProofFromRawBytesReturnType,
  createVerifiedInputProofFromRawBytes,
} from "./createVerifiedInputProofFromRawBytes.js";

// Good — no parameters, no return type (void)
export { checkAllowedForDecryption } from "./checkAllowedForDecryption.js";

// Bad — missing Parameters and ReturnType
export { createVerifiedInputProofFromRawBytes } from "./createVerifiedInputProofFromRawBytes.js";
```

## Package.json per tier

Each tier folder must also contain a `package.json` for dual CJS/ESM resolution. Generate it alongside the `index.ts`.

Example for `src/core/actions/base/package.json`:

```json
{
  "type": "module",
  "types": "../../../_types/core/actions/base/index.d.ts",
  "module": "../../../_esm/core/actions/base/index.js",
  "main": "../../../_cjs/core/actions/base/index.js"
}
```

Adjust the tier name in the paths for each folder (e.g. `base` → `chain`, `decrypt`, `encrypt`, `host`).
The `../../../` prefix is correct for all tiers: `src/core/actions/<tier>/` → 3 levels up → `src/`, then into `_types/`, `_esm/`, or `_cjs/`.

## src/package.json exports

Each action tier must also be registered in `src/package.json` (not the root `package.json`) `exports` map so consumers can import via `@fhevm/sdk/actions/<tier>`.

Paths are relative to `src/` — use `./_types/`, `./_esm/`, `./_cjs/` (no `src/` prefix).

Ensure every tier has an entry like:

```json
{
  "exports": {
    "./actions/base": {
      "types": "./_types/core/actions/base/index.d.ts",
      "import": "./_esm/core/actions/base/index.js",
      "default": "./_cjs/core/actions/base/index.js"
    },
    "./actions/chain": {
      "types": "./_types/core/actions/chain/index.d.ts",
      "import": "./_esm/core/actions/chain/index.js",
      "default": "./_cjs/core/actions/chain/index.js"
    },
    "./actions/decrypt": {
      "types": "./_types/core/actions/decrypt/index.d.ts",
      "import": "./_esm/core/actions/decrypt/index.js",
      "default": "./_cjs/core/actions/decrypt/index.js"
    },
    "./actions/encrypt": {
      "types": "./_types/core/actions/encrypt/index.d.ts",
      "import": "./_esm/core/actions/encrypt/index.js",
      "default": "./_cjs/core/actions/encrypt/index.js"
    },
    "./actions/host": {
      "types": "./_types/core/actions/host/index.d.ts",
      "import": "./_esm/core/actions/host/index.js",
      "default": "./_cjs/core/actions/host/index.js"
    }
  }
}
```

When a new tier is added, add its entry to the `exports` map as well.

**Restriction:** Never add an `"./actions/<tier>"` export to `src/package.json` if `src/core/actions/<tier>/` does not exist. The exports map must mirror the actual folder structure — no phantom entry points.
