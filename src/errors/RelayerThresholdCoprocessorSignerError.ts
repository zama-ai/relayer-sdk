import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerThresholdCoprocessorSignerError
////////////////////////////////////////////////////////////////////////////////

export type RelayerThresholdCoprocessorSignerErrorType =
  RelayerThresholdCoprocessorSignerError & {
    name: 'RelayerThresholdCoprocessorSignerError';
  };

export class RelayerThresholdCoprocessorSignerError extends RelayerErrorBase {
  constructor() {
    super({
      name: 'RelayerThresholdCoprocessorSignerError',
      message: `Coprocessor signers threshold is not reached`,
    });
  }
}
