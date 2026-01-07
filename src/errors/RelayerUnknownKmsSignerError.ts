import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerUnknownKmsSignerError
////////////////////////////////////////////////////////////////////////////////

export type RelayerUnknownKmsSignerErrorType = RelayerErrorBase & {
  name: 'RelayerUnknownKmsSignerError';
};

export type RelayerUnknownKmsSignerErrorParams = {
  unknownAddress: string;
};

export class RelayerUnknownKmsSignerError extends RelayerErrorBase {
  constructor(params: RelayerUnknownKmsSignerErrorParams) {
    super({
      ...params,
      name: 'RelayerUnknownKmsSignerError',
      message: `Invalid address found: ${params.unknownAddress} is not in the list of kms signers`,
    });
  }
}
