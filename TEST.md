# Browser Test Plan

## Context

This repo is an SDK for encrypting/decrypting data using 2 WASM modules (TFHE + TKMS).
The SDK always runs in multi-threaded mode — TFHE spawns Web Workers and requires
`SharedArrayBuffer`. This is the primary reason browser testing is necessary: we must
validate that WASM threading works correctly under real browser security constraints.

## Goal

Validate the SDK's encrypt/decrypt functionality across all major browsers via Playwright,
with a focus on multi-threaded WASM execution.

## Constraints

- The SDK is dual-compiled: CJS and ESM
- TFHE always runs multi-threaded (Web Workers + SharedArrayBuffer)
- The test server **must** serve pages with these headers for SharedArrayBuffer to work:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- Must run on Chromium, Firefox, and WebKit (Playwright defaults)

## Scope

- TFHE and TKMS WASM module loading
- TFHE multi-threaded worker spawning and execution
- Encrypt/decrypt round-trip
- ESM bundle in browser
- Two WASM loading strategies:
  - **URL-based (primary)**: The happy path. Test thoroughly across all browsers.
  - **Base64 (fallback)**: Used when binary `.wasm` files cannot be served. Test that it works, but don't optimize for its performance — the slowness is an accepted tradeoff.

## Approach

- Use Playwright as the browser testing framework
- Serve a minimal test page that imports the SDK with correct COOP/COEP headers
- Keep Vitest for unit/Node tests; Playwright for browser integration tests
- Separate npm script: `test:browser`

## Phases

### V0: Smoke test

Minimal browser test to prove the infrastructure works:

1. **Headers check**: `SharedArrayBuffer` is defined and `wasm-feature-detect.threads()` returns `true`
   → Validates COOP/COEP headers are served correctly
2. **WASM + Workers**: TFHE WASM loads and worker threads spawn successfully
   → Validates multi-threaded WASM execution works in the browser

No encryption, no decryption, no network calls, no keys.
If this passes, the hard part (headers, workers, WASM compilation) is proven.

### V1: ESM only

- Test ESM imports directly in the browser
- Test both WASM loading strategies: URL-based and base64 inline
- Validate multi-threaded TFHE execution across Chromium, Firefox, WebKit

### V2: Bundler testing

- Test CJS/ESM via bundlers (webpack, rollup, etc.)
- Validate that bundled output works across all target browsers

## Directory Structure

Browser tests live in a dedicated, self-contained directory, fully isolated from the SDK source:

```
test/browser/
├── playwright.config.ts     # Playwright config (COOP/COEP headers, browsers)
├── pages/                   # Minimal HTML test pages served to the browser
│   ├── esm-url.html         # ESM import with URL-based WASM loading
│   ├── esm-base64.html      # ESM import with base64 inline WASM loading
│   └── manual.html          # Manual test page with progress and timings
├── specs/                   # Playwright test specs
│   ├── wasm-url.spec.ts
│   └── wasm-base64.spec.ts
└── server/                  # Local test server with required headers
    └── index.ts
```

## Manual Testing

For visual debugging and performance inspection, a manual test mode is available:

- Run `npm run test:browser:manual` to start the test server
- Open the displayed URL in Safari or Chrome
- The page displays a minimal, text-only view of:
  - Each test step as it executes (WASM loading, worker init, encrypt, decrypt)
  - Pass/fail status per step
  - Timing for each step (e.g. "TFHE init: 1243ms")
  - Total elapsed time
- No framework UI — just plain text appended to the page in real time
