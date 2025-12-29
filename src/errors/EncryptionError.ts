import { RelayerErrorBase } from './RelayerErrorBase';
import { ensureError } from './utils';

export type EncryptionErrorType = EncryptionError & {
  name: 'EncryptionError';
};

export class EncryptionError extends RelayerErrorBase {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({
      message,
      name: 'EncryptionError',
      ...(cause ? { cause: ensureError(cause) } : {}),
    });
  }
}
