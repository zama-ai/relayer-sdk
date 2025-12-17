import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerTooManyHandlesError
////////////////////////////////////////////////////////////////////////////////

export type RelayerTooManyHandlesErrorType = RelayerErrorBase & {
  name: 'RelayerTooManyHandlesError';
};

export type RelayerTooManyHandlesErrorParams = {
  numberOfHandles: number;
};

export class RelayerTooManyHandlesError extends RelayerErrorBase {
  constructor(params: RelayerTooManyHandlesErrorParams) {
    super({
      ...params,
      name: 'RelayerTooManyHandlesError',
      message: `Trying to pack ${params.numberOfHandles} handles. Packing more than 256 variables in a single input ciphertext is unsupported`,
    });
  }
}
