import { RelayerErrorBase } from './RelayerErrorBase';

export type FheTypeErrorType = FheTypeError & {
  name: 'FheTypeError';
};

export class FheTypeError extends RelayerErrorBase {
  constructor({
    fheTypeId,
    message,
  }: {
    fheTypeId?: unknown;
    message?: string;
  }) {
    super({
      message:
        message ??
        (fheTypeId
          ? `FheTypeId "${fheTypeId}" is invalid.`
          : `FheTypeId is invalid.`),
      name: 'FheTypeError',
    });
  }
}
