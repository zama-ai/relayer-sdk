import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerInvalidProofError
////////////////////////////////////////////////////////////////////////////////

export type RelayerInvalidProofErrorType = RelayerInvalidProofError & {
  name: 'RelayerInvalidProofError';
};

export type RelayerInvalidProofErrorParams = {
  message: string;
};

export class RelayerInvalidProofError extends RelayerErrorBase {
  constructor(params: RelayerInvalidProofErrorParams) {
    super({
      ...params,
      name: 'RelayerInvalidProofError',
    });
  }
}
