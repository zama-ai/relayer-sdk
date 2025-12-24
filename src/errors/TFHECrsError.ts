import { RelayerErrorBase } from './RelayerErrorBase';
import { ensureError } from './utils';

export type TFHECrsErrorType = TFHECrsError & {
  name: 'TFHECrsError';
};

export class TFHECrsError extends RelayerErrorBase {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({
      message,
      name: 'TFHECrsError',
      ...(cause ? { cause: ensureError(cause) } : {}),
    });
  }
}
