import { InternalError } from './InternalError';

export function ensureError(e: unknown): Error {
  if (e instanceof Error) {
    return e;
  }

  const message =
    (e as any).message ?? 'Non-Error value caught in exception handler';
  const name = (e as any).name ?? 'ErrorWrapper';
  const cause = (e as any).cause ?? e;

  const err = new Error(message, { cause });
  err.name = name;

  return err;
}

export function assertNever(value: never, message: string): never {
  throw new InternalError({ message });
}
