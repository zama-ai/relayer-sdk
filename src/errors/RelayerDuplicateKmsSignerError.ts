import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerDuplicateKmsSignerError
////////////////////////////////////////////////////////////////////////////////

export type RelayerDuplicateKmsSignerErrorType =
  RelayerDuplicateKmsSignerError & {
    name: 'RelayerDuplicateKmsSignerError';
  };

export type RelayerDuplicateKmsSignerErrorParams = {
  duplicateAddress: string;
};

export class RelayerDuplicateKmsSignerError extends RelayerErrorBase {
  constructor(params: RelayerDuplicateKmsSignerErrorParams) {
    super({
      ...params,
      name: 'RelayerDuplicateKmsSignerError',
      message: `Duplicate kms signer address found: ${params.duplicateAddress} appears multiple times in recovered addresses`,
    });
  }
}
