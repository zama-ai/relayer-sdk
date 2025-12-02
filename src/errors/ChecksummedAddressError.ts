import { RelayerBaseError } from './RelayerBaseError';

export type ChecksummedAddressErrorType = ChecksummedAddressError & {
  name: 'ChecksummedAddressError';
};

export class ChecksummedAddressError extends RelayerBaseError {
  constructor({ address }: { address: string }) {
    super({
      message: `Checksummed address "${address}" is invalid.`,
      name: 'ChecksummedAddressError',
    });
  }
}
