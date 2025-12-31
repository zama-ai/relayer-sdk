import { RelayerErrorBase } from './RelayerErrorBase';
import { ensureError } from './utils';

export type TFHEErrorType = TFHEError & {
  name: 'TFHEError';
};

export class TFHEError extends RelayerErrorBase {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({
      message,
      name: 'TFHEError',
      ...(cause ? { cause: ensureError(cause) } : {}),
    });
  }
}
