export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ValidationResult<T, E extends Error = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
