interface NodeMessagePort {
    on(event: "error", listener: (error: Error) => void): void;
    on(event: "exit", listener: (code: number) => void): void;
    on(event: string, listener: (data: MessageData) => void): void;
    off(event: string, listener: (data: MessageData) => void): void;
    postMessage(value: unknown): void;
    terminate(): Promise<number>;
}
interface BrowserMessagePort {
    addEventListener(event: string, listener: (event: MessageEvent<MessageData>) => void): void;
    removeEventListener(event: string, listener: (event: MessageEvent<MessageData>) => void): void;
    postMessage(value: unknown): void;
    terminate(): void;
}
export type IsomorphicMessagePort = NodeMessagePort | BrowserMessagePort;
interface MessageData {
    type: string;
    [key: string]: unknown;
}
export declare function isBrowserLike(): boolean;
/**
 * This function is called from inside a worker to get the messaging target
 * It's the communication channel between a worker thread and its parent (main) thread.
 */
export declare function getIsomorphicTarget(): Promise<IsomorphicMessagePort>;
export declare function createIsomorphicWorker(url: string): Promise<Worker | NodeMessagePort>;
export declare function createIsomorphicWorkerFromCode(jsCode: string): Promise<Worker | NodeMessagePort>;
/**
 * Runs code in an isomorphic worker thread and returns the result.
 *
 * The `code` string is wrapped in an async IIFE that receives `data` as input.
 * Use `return` to send the result back to the main thread.
 *
 * @example
 * const module = await runCodeInIsomorphicWorker<WebAssembly.Module>(
 *   `const res = await fetch("data:application/octet-stream;base64," + data);
 *    const bytes = new Uint8Array(await res.arrayBuffer());
 *    return WebAssembly.compile(bytes);`,
 *   base64,
 * );
 *
 * @param code - JS code to execute. Receives `data` as input, must `return` the result.
 * @param input - Value sent to the worker via postMessage (must be structured-cloneable).
 * @param timeoutMs - Max execution time before the worker is killed. Default: 30s.
 */
export declare function runCodeInIsomorphicWorker<T>(code: string, input: unknown, timeoutMs?: number): Promise<T>;
export declare function isBlobWorkerSupported(): Promise<boolean>;
export declare function waitForMsgType(target: IsomorphicMessagePort, type: string): Promise<MessageData>;
export {};
//# sourceMappingURL=isomorphicWorker.d.ts.map