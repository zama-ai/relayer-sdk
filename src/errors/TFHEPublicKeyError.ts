import { RelayerErrorBase } from './RelayerErrorBase';
import { ensureError } from './utils';

export type TFHEPublicKeyErrorType = TFHEPublicKeyError & {
  name: 'TFHEPublicKeyError';
};

export class TFHEPublicKeyError extends RelayerErrorBase {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({
      message,
      name: 'TFHEPublicKeyError',
      ...(cause ? { cause: ensureError(cause) } : {}),
    });
  }
}
