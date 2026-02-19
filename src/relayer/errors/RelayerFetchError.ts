import type { RelayerFetchErrorBaseParams } from './RelayerFetchErrorBase';
import type { RelayerErrorBaseParams } from './RelayerErrorBase';
import type { Prettify } from '@base/types/utils';
import { ensureError } from '@base/errors/utils';
import { RelayerFetchErrorBase } from './RelayerFetchErrorBase';
import { formatFetchErrorMetaMessages } from '@base/fetch';

////////////////////////////////////////////////////////////////////////////////
// RelayerFetchError
////////////////////////////////////////////////////////////////////////////////

export type RelayerFetchErrorType = RelayerFetchError & {
  name: 'RelayerFetchError';
};

export type RelayerFetchErrorParams = Prettify<
  Omit<RelayerFetchErrorBaseParams, keyof RelayerErrorBaseParams> & {
    readonly cause?: unknown;
    readonly message: string;
  }
>;

/**
 * If a network error occurs or JSON parsing fails.
 */
export class RelayerFetchError extends RelayerFetchErrorBase {
  constructor({ cause, ...params }: RelayerFetchErrorParams) {
    super({
      ...params,
      name: 'RelayerFetchError',
      message: params.message,
      ...(cause !== undefined ? { cause: ensureError(cause) } : {}),
      ...(cause !== undefined
        ? { metaMessages: formatFetchErrorMetaMessages(cause) }
        : {}),
    });
  }
}
