import { RelayerErrorBase } from './RelayerErrorBase';

export type FhevmConfigErrorType = FhevmConfigError & {
  name: 'FhevmConfigError';
};

export class FhevmConfigError extends RelayerErrorBase {
  constructor({ message }: { message?: string }) {
    super({
      message: message ?? `Invalid FHEVM config`,
      name: 'FhevmConfigError',
    });
  }
}
