import { RelayerErrorBase } from './RelayerErrorBase';

export type ChecksummedAddressErrorType = ChecksummedAddressError & {
  name: 'ChecksummedAddressError';
};

export class ChecksummedAddressError extends RelayerErrorBase {
  constructor({ address, message }: { address?: string; message?: string }) {
    super({
      message:
        message ??
        (address != null
          ? `Checksummed address "${address}" is invalid.`
          : 'Checksummed address is invalid.'),
      name: 'ChecksummedAddressError',
    });
  }
}
