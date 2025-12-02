import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { ensureError } from '../../../errors/utils';
import { RelayerV2ResponseError } from './RelayerV2ResponseError';

export type RelayerV2InvalidGetResponseErrorType =
  RelayerV2InvalidGetResponseError & {
    name: 'RelayerV2InvalidGetResponseError';
  };

export class RelayerV2InvalidGetResponseError extends RelayerV2ResponseError {
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
      fetchMethod: 'GET',
      name: 'RelayerV2InvalidGetResponseError',
      message: `fetchMethod: GET status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
