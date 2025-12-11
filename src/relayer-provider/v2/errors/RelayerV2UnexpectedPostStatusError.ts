import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { RelayerV2BasePostResponseError } from './RelayerV2ResponseError';

export type RelayerV2UnexpectedPostStatusErrorType =
  RelayerV2UnexpectedPostStatusError & {
    name: 'RelayerV2InvalidPostStatusError';
  };

export class RelayerV2UnexpectedPostStatusError extends RelayerV2BasePostResponseError {
  constructor(params: {
    status: number;
    url: string;
    operation: RelayerOperation;
    cause?: RelayerBaseError | Error | undefined;
  }) {
    super({
      ...params,
      name: 'RelayerV2UnexpectedPostStatusError',
      message: `fetchMethod: POST status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
