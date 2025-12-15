import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerUnknownCoprocessorSignerError
////////////////////////////////////////////////////////////////////////////////

export type RelayerUnknownCoprocessorSignerErrorType = RelayerErrorBase & {
  name: 'RelayerUnknownCoprocessorSignerError';
};

export type RelayerUnknownCoprocessorSignerErrorParams = {
  unknownAddress: string;
};

export class RelayerUnknownCoprocessorSignerError extends RelayerErrorBase {
  constructor(params: RelayerUnknownCoprocessorSignerErrorParams) {
    super({
      ...params,
      name: 'RelayerUnknownCoprocessorSignerError',
      message: `Invalid address found: ${params.unknownAddress} is not in the list of coprocessor signers`,
    });
  }
}
