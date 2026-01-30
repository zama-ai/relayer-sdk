export function throwIfAborted(signal: AbortSignal | null | undefined): void {
  if (!signal) {
    return;
  }

  if (typeof signal.throwIfAborted === 'function') {
    signal.throwIfAborted();
  } else if (signal.aborted) {
    // Fallback for older environments
    throw new DOMException('This operation was aborted', 'AbortError');
  }
}
