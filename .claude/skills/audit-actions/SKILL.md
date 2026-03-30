---
name: audit-actions
description: Audit action function signatures in src/core/actions/ against the rules defined in .claude/api.md. Use when checking that action files comply with the SDK's public API conventions.
disable-model-invocation: true
---

# Audit Action Signatures

Audit all exported function signatures in `src/core/actions/` subfolders against the rules in `.claude/api.md`.

## Scope

If `$ARGUMENTS` is provided (e.g. `base`, `host`, `encrypt`, `decrypt`, `chain`), audit only that subfolder.
Otherwise, audit all five: `base`, `host`, `encrypt`, `decrypt`, `chain`.

## Rules per tier

Read `.claude/api.md` for full context. Summary of rules:

### actions/base

- First arg: `fhevm: Fhevm<FhevmChain>` (must require a chain)
- Optional second arg: `parameters: <FunctionName>Parameters`
- Return type: `<FunctionName>ReturnType` or `Promise<<FunctionName>ReturnType>` (or `void`/`Promise<void>`)
- No extra loose arguments
- Function overloads are allowed (each overload must follow the pattern)

### actions/host

- First arg: `fhevm: Fhevm` (no chain requirement — chain can be undefined)
- Optional second arg: `parameters: <FunctionName>Parameters`
- Return type: `<FunctionName>ReturnType` or `Promise<<FunctionName>ReturnType>` (or `void`/`Promise<void>`)
- No extra loose arguments
- Contract addresses come from parameters, not from chain

### actions/encrypt

- First arg: `fhevm: Fhevm<FhevmChain, WithEncrypt>` or `fhevm: Fhevm<FhevmChain | undefined, WithEncrypt, OptionalNativeClient>` (requires encrypt module; chain and provider may be optional for purely local operations)
- Optional second arg: `parameters: <FunctionName>Parameters`
- Return type: `<FunctionName>ReturnType` or `Promise<<FunctionName>ReturnType>` (or `void`/`Promise<void>`)
- No extra loose arguments

### actions/decrypt

- First arg: `fhevm: Fhevm<FhevmChain, WithDecrypt>` or `fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>` (requires decrypt module; chain and provider may be optional for purely local operations)
- Optional second arg: `parameters: <FunctionName>Parameters`
- Return type: `<FunctionName>ReturnType` or `Promise<<FunctionName>ReturnType>` (or `void`/`Promise<void>`)
- No extra loose arguments

### actions/chain

- First arg: `fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>` (requires a chain, but the provider is optional)
- Optional second arg: `parameters: <FunctionName>Parameters`
- Return type: `<FunctionName>ReturnType` or `Promise<<FunctionName>ReturnType>` (or `void`/`Promise<void>`)
- No extra loose arguments
- These actions only use the chain definition — the provider is not required

## Common rules (all tiers)

- `fhevm` as first argument name is **reserved for public action functions** (see `.claude/naming.md`)
- Internal/private utility functions use `context` as first argument — if you find `context` in an actions/ file, flag it
- Parameter type must be named `<FunctionName>Parameters` (PascalCase function name + "Parameters")
- Return type must be named `<FunctionName>ReturnType` (PascalCase function name + "ReturnType")
- Both the Parameters type and ReturnType type should be exported from the same file as the function
- Files suffixed with `-p.ts` are private and should NOT contain public action functions

## Helper scripts

List all action groups (tier folders):

```bash
ls -d src/core/actions/*/
```

List all exported action functions across all groups:

```bash
for dir in src/core/actions/*/; do
  grep -rn "^export.*function " "$dir" --include="*.ts" --exclude="*-p.ts" --exclude="index.ts"
done
```

List exported action functions for a specific group (e.g. `base`):

```bash
grep -rn "^export.*function " src/core/actions/base/ --include="*.ts" --exclude="*-p.ts" --exclude="index.ts"
```

## Procedure

1. First, list all action group folders via `ls -d src/core/actions/*/` and compare against the known tiers defined in this skill (base, host, encrypt, decrypt, chain). **If a group folder exists in the source but has no matching rules section above, raise an error** — it means this skill is out of date and needs a new tier rule.
2. Use the helper scripts above or `Glob` to find all `.ts` files in the target subfolder(s) under `src/core/actions/`
3. Skip `-p.ts` files (private), but flag if they contain exported functions with `fhevm` as first arg
3. For each file, read the exported function signature(s)
4. Check each signature against the rules for its tier
5. Report results in a table:

| File | Function | First Arg | Second Arg | Return Type | Status |
| ---- | -------- | --------- | ---------- | ----------- | ------ |

6. At the end, provide a summary: total files, total functions, passes, failures
7. For each failure, explain exactly what's wrong and what the fix should be
