import { RelayerOperation } from '@relayer-provider/types/public-api';
import { RelayerErrorBase } from './RelayerErrorBase';
import { RelayerProviderError } from './RelayerProviderError';

////////////////////////////////////////////////////////////////////////////////

export type RelayerFetchErrorType = RelayerFetchError & {
  name: 'RelayerFetchError';
};

export class RelayerFetchError extends RelayerProviderError {
  constructor({
    operation,
    cause,
  }: {
    operation: RelayerOperation;
    cause: RelayerErrorBase | Error;
  }) {
    super({
      message: `Invalid relayer response.`,
      name: 'RelayerFetchError',
      operation,
      cause,
    });
  }
}
