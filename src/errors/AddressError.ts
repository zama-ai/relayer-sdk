import { RelayerErrorBase } from './RelayerErrorBase';

export type AddressErrorType = AddressError & {
  name: 'AddressError';
};

export class AddressError extends RelayerErrorBase {
  constructor({ address }: { address: string }) {
    super({
      message: `Address "${address}" is invalid.`,
      name: 'AddressError',
    });
  }
}
