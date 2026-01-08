import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerThresholdKmsSignerError
////////////////////////////////////////////////////////////////////////////////

export type RelayerThresholdKmsSignerErrorType =
  RelayerThresholdKmsSignerError & {
    name: 'RelayerThresholdKmsSignerError';
  };

export class RelayerThresholdKmsSignerError extends RelayerErrorBase {
  constructor() {
    super({
      name: 'RelayerThresholdKmsSignerError',
      message: `Kms signers threshold is not reached`,
    });
  }
}
