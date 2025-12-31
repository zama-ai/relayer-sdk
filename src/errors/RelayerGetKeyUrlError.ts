import { RelayerErrorBase } from './RelayerErrorBase';
import { RelayerProviderError } from './RelayerProviderError';

////////////////////////////////////////////////////////////////////////////////

export type RelayerGetKeyUrlErrorType = RelayerGetKeyUrlError & {
  name: 'RelayerGetKeyUrlError';
};

export class RelayerGetKeyUrlError extends RelayerProviderError {
  constructor({ cause }: { cause: RelayerErrorBase | Error }) {
    super({
      message: `Invalid relayer response.`,
      name: 'RelayerGetKeyUrlError',
      operation: 'KEY_URL',
      cause,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////

export type RelayerGetKeyUrlInvalidResponseErrorType =
  RelayerGetKeyUrlInvalidResponseError & {
    name: 'RelayerGetKeyUrlInvalidResponseError';
  };

export class RelayerGetKeyUrlInvalidResponseError extends RelayerGetKeyUrlError {
  constructor({ cause }: { cause: RelayerErrorBase | Error }) {
    super({ cause });
  }
}
