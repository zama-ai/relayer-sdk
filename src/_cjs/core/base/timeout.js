"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abortableSleep = abortableSleep;
function createAbortError(reason) {
    const error = new Error("Aborted", { cause: reason });
    error.name = "AbortError";
    return error;
}
function abortableSleep(ms, signal) {
    signal?.throwIfAborted();
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, ms);
        signal?.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(createAbortError(signal.reason));
        }, { once: true });
    });
}
//# sourceMappingURL=timeout.js.map