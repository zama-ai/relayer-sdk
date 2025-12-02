export function ensureError(e: unknown): Error {
  if (e instanceof Error) {
    return e;
  }
  return new Error('Non-Error value caught in exception handler', { cause: e });
}
