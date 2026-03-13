/**
 * Extracts the response body as a Uint8Array.
 *
 * Uses `Response.bytes()` when available, falling back to `Response.arrayBuffer()`
 * for compatibility. The `bytes()` method is a newer addition to the Fetch API
 * and may not be supported in all environments. (older browsers, some JS runtimes, or polyfills).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Response/bytes
 */
export declare function getResponseBytes(response: Response): Promise<Uint8Array>;
/**
 * Formats a fetch error into an array of human-readable messages.
 *
 * Traverses the error's cause chain and formats each error with its message
 * and properties. The root error uses standard "Name: message" format, while
 * nested causes are prefixed with "Cause: " and include name in the props.
 *
 * @param error - The error to format (typically from a failed fetch call)
 * @returns An array of formatted error messages, one per error in the cause chain
 *
 * @example
 * // For a DNS lookup failure (ENOTFOUND):
 * // Input error structure:
 * //   TypeError: fetch failed
 * //     cause: Error: getaddrinfo ENOTFOUND api.example.com
 * //            { code: 'ENOTFOUND', errno: -3008, syscall: 'getaddrinfo', hostname: 'api.example.com' }
 * //
 * // Output:
 * // [
 * //   "TypeError: fetch failed",
 * //   "Cause: getaddrinfo ENOTFOUND api.example.com [name=Error, code=ENOTFOUND, errno=-3008, syscall=getaddrinfo, hostname=api.example.com]"
 * // ]
 *
 * @example
 * // For a connection refused error (ECONNREFUSED):
 * // Output:
 * // [
 * //   "TypeError: fetch failed",
 * //   "Cause: connect ECONNREFUSED 127.0.0.1:3000 [name=Error, code=ECONNREFUSED, errno=-61, syscall=connect, address=127.0.0.1, port=3000]"
 * // ]
 */
export declare function formatFetchErrorMetaMessages(error: unknown): string[];
export type FetchWithRetryParameters = {
    readonly init?: RequestInit | undefined;
    readonly retries?: number | undefined;
    readonly retryDelayMs?: number | undefined;
};
/**
 * Fetches a URL with automatic retry on network failures.
 *
 * Retries are triggered only for network-level errors (e.g., ECONNREFUSED, ENOTFOUND, UND_ERR_xxx (undici errors)
 * connection timeouts). HTTP error responses (4xx, 5xx) are NOT retried - the response
 * is returned as-is for the caller to handle.
 *
 * The operation is abortable via `init.signal`. If the signal is aborted, an AbortError
 * is thrown immediately without further retries.
 *
 * @param url - The URL to fetch
 * @param init - Optional fetch init options (method, headers, body, etc.)
 * @param retries - Number of retry attempts on network failure (default: 3)
 * @param retryDelayMs - Delay in milliseconds between retries (default: 1000)
 * @returns The fetch Response
 * @throws The last network error if all retries are exhausted
 * @throws {Error} An error with name 'AbortError' if the signal is aborted
 */
export declare function fetchWithRetry(args: {
    url: string;
} & FetchWithRetryParameters): Promise<Response>;
export declare function isDataUrlFetchSupported(): Promise<boolean>;
//# sourceMappingURL=fetch.d.ts.map