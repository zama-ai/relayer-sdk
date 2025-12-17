import { RelayerErrorBase } from './RelayerErrorBase';

export type FhevmHandleErrorType = FhevmHandleError & {
  name: 'FhevmHandleError';
};

export class FhevmHandleError extends RelayerErrorBase {
  constructor({ handle }: { handle: unknown }) {
    super({
      message: `FHEVM Handle "${handle}" is invalid.`,
      name: 'FhevmHandleError',
    });
  }
}
