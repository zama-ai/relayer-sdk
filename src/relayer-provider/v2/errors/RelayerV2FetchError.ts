import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerV2RequestError } from './RelayerV2RequestError';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { ensureError } from '../../../errors/utils';

export type RelayerV2FetchErrorType = RelayerV2FetchError & {
  name: 'RelayerV2FetchError';
};

export class RelayerV2FetchError extends RelayerV2RequestError {
  constructor(params: {
    fetchMethod: 'POST' | 'GET';
    url: string;
    jobId?: string;
    operation: RelayerOperation;
    status?: number;
    cause?: RelayerBaseError | Error | unknown;
    message?: string;
  }) {
    super({
      ...params,
      name: 'RelayerV2FetchError',
      message: params.message ?? 'fetch error',
      cause: ensureError(params.cause),
    });
  }
}
