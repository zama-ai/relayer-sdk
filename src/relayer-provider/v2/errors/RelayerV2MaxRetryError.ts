import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { RelayerV2FetchErrorBaseParams } from './RelayerV2FetchErrorBase';
import type { Prettify } from '@base/types/utils';
import { RelayerV2FetchErrorBase } from './RelayerV2FetchErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2MaxRetryError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2MaxRetryErrorType = RelayerV2MaxRetryError & {
  name: 'RelayerV2MaxRetryError';
};

export type RelayerV2MaxRetryErrorParams = Prettify<
  Omit<RelayerV2FetchErrorBaseParams, keyof RelayerErrorBaseParams>
>;

/**
 * The maximum number of retries is exceeded.
 */
export class RelayerV2MaxRetryError extends RelayerV2FetchErrorBase {
  constructor(params: RelayerV2MaxRetryErrorParams) {
    super({
      ...params,
      name: 'RelayerV2MaxRetryError',
      message: `Maximum retry limit exceeded (retried ${params.retryCount} times)`,
    });
  }
}
