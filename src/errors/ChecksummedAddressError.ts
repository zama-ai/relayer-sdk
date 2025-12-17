import { RelayerErrorBase } from './RelayerErrorBase';

export type ChecksummedAddressErrorType = ChecksummedAddressError & {
  name: 'ChecksummedAddressError';
};

export class ChecksummedAddressError extends RelayerErrorBase {
  constructor({ address }: { address: string }) {
    super({
      message: `Checksummed address "${address}" is invalid.`,
      name: 'ChecksummedAddressError',
    });
  }
}
