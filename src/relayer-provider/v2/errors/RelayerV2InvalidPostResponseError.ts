import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { RelayerV2BasePostResponseError } from './RelayerV2ResponseError';
import { ensureError } from '../../../errors/utils';

export type RelayerV2InvalidPostResponseErrorType =
  RelayerV2InvalidPostResponseError & {
    name: 'RelayerV2InvalidPostResponseError';
  };

export class RelayerV2InvalidPostResponseError extends RelayerV2BasePostResponseError {
  constructor(params: {
    status: number;
    url: string;
    operation: RelayerOperation;
    cause: RelayerBaseError | Error | unknown;
  }) {
    super({
      ...params,
      cause: ensureError(params.cause),
      name: 'RelayerV2InvalidPostResponseError',
      message: `fetchMethod: POST status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
