/**
 * Returns a Promise that resolves after the specified delay, but can be aborted.
 *
 * @throws {Error} An error with name 'AbortError' if the signal is aborted
 */
export declare function abortableSleep(ms: number, signal?: AbortSignal): Promise<void>;
//# sourceMappingURL=timeout.d.ts.map