import type { RelayerV2FetchErrorBaseParams } from './RelayerV2FetchErrorBase';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { Prettify } from '@base/types/utils';
import { ensureError } from '../../../errors/utils';
import { RelayerV2FetchErrorBase } from './RelayerV2FetchErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2FetchError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2FetchErrorType = RelayerV2FetchErrorBase & {
  name: 'RelayerV2FetchError';
};

export type RelayerV2FetchErrorParams = Prettify<
  Omit<RelayerV2FetchErrorBaseParams, keyof RelayerErrorBaseParams> & {
    cause?: unknown;
  }
>;

export class RelayerV2FetchError extends RelayerV2FetchErrorBase {
  constructor(params: RelayerV2FetchErrorParams) {
    super({
      ...params,
      name: 'RelayerV2FetchError',
      message: `Fetch ${params.fetchMethod} error`,
      cause: ensureError(params.cause),
    });
  }
}
