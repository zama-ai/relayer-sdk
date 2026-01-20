import type { RelayerV2FetchErrorBaseParams } from './RelayerV2FetchErrorBase';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { Prettify } from '@base/types/utils';
import { ensureError } from '../../../errors/utils';
import { RelayerV2FetchErrorBase } from './RelayerV2FetchErrorBase';
import { formatFetchErrorMetaMessages } from '@base/fetch';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2FetchError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2FetchErrorType = RelayerV2FetchErrorBase & {
  name: 'RelayerV2FetchError';
};

export type RelayerV2FetchErrorParams = Prettify<
  Omit<RelayerV2FetchErrorBaseParams, keyof RelayerErrorBaseParams> & {
    cause?: unknown;
    message: string;
  }
>;

/**
 * If a network error occurs or JSON parsing fails.
 */
export class RelayerV2FetchError extends RelayerV2FetchErrorBase {
  constructor(params: RelayerV2FetchErrorParams) {
    super({
      ...params,
      name: 'RelayerV2FetchError',
      message: params.message,
      cause: ensureError(params.cause),
      ...(params.cause !== undefined
        ? { metaMessages: formatFetchErrorMetaMessages(params.cause) }
        : {}),
    });
  }
}
