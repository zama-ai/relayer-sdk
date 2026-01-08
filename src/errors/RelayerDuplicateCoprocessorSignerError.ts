import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerDuplicateCoprocessorSignerError
////////////////////////////////////////////////////////////////////////////////

export type RelayerDuplicateCoprocessorSignerErrorType =
  RelayerDuplicateCoprocessorSignerError & {
    name: 'RelayerDuplicateCoprocessorSignerError';
  };

export type RelayerDuplicateCoprocessorSignerErrorParams = {
  duplicateAddress: string;
};

export class RelayerDuplicateCoprocessorSignerError extends RelayerErrorBase {
  constructor(params: RelayerDuplicateCoprocessorSignerErrorParams) {
    super({
      ...params,
      name: 'RelayerDuplicateCoprocessorSignerError',
      message: `Duplicate coprocessor signer address found: ${params.duplicateAddress} appears multiple times in recovered addresses`,
    });
  }
}
