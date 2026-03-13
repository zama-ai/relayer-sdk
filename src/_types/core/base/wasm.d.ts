/**
 * Compiles a WASM module from a URL, isomorphically (browser and Node.js).
 *
 * - Node + `file://`: uses `readFile` (Node `fetch` doesn't support `file://`)
 * - Browser + streaming: uses `WebAssembly.compileStreaming` (fastest path)
 * - Fallback: `fetch` + `arrayBuffer` + `WebAssembly.compile`
 */
export declare function isomorphicCompileWasm(wasmUrl: URL): Promise<WebAssembly.Module>;
/**
 * Compiles a WASM module from a base64-encoded string.
 *
 * @param wasmAsBase64 - The WASM binary encoded as a base64 string
 * @returns A compiled WebAssembly.Module ready to be instantiated
 */
export declare function isomorphicCompileWasmFromBase64(wasmAsBase64: string): Promise<WebAssembly.Module>;
//# sourceMappingURL=wasm.d.ts.map