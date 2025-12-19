import { RelayerErrorBase } from './RelayerErrorBase';

export type FhevmHandleErrorType = FhevmHandleError & {
  name: 'FhevmHandleError';
};

export class FhevmHandleError extends RelayerErrorBase {
  constructor({ handle, message }: { handle: unknown; message?: string }) {
    super({
      message: message ?? `FHEVM Handle "${handle}" is invalid.`,
      name: 'FhevmHandleError',
    });
  }
}
