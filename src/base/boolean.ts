import type { ErrorMetadataParams } from './errors/ErrorBase';
import { InvalidTypeError } from './errors/InvalidTypeError';

export function assertIsBoolean(
  value: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof value,
        expectedType: 'boolean',
      },
      options,
    );
  }
}

export function asBoolean(
  value: unknown,
  options?: { subject?: string } & ErrorMetadataParams,
): boolean {
  assertIsBoolean(value, options ?? {});
  return value;
}
