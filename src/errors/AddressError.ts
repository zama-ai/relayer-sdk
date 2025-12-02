import { RelayerBaseError } from './RelayerBaseError';

export type AddressErrorType = AddressError & {
  name: 'AddressError';
};

export class AddressError extends RelayerBaseError {
  constructor({ address }: { address: string }) {
    super({
      message: `Address "${address}" is invalid.`,
      name: 'AddressError',
    });
  }
}
