import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { ensureError } from '../../../errors/utils';
import { RelayerV2BaseGetResponseError } from './RelayerV2ResponseError';

export type RelayerV2InvalidGetResponseErrorType =
  RelayerV2InvalidGetResponseError & {
    name: 'RelayerV2InvalidGetResponseError';
  };

export class RelayerV2InvalidGetResponseError extends RelayerV2BaseGetResponseError {
  constructor(params: {
    status: number;
    url: string;
    jobId: string;
    operation: RelayerOperation;
    cause: RelayerBaseError | Error | unknown;
  }) {
    super({
      ...params,
      cause: ensureError(params.cause),
      name: 'RelayerV2InvalidGetResponseError',
      message: `fetchMethod: GET status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
