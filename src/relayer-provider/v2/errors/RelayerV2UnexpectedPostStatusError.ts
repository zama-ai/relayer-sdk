import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { RelayerV2ResponseError } from './RelayerV2ResponseError';

export type RelayerV2UnexpectedPostStatusErrorType =
  RelayerV2UnexpectedPostStatusError & {
    name: 'RelayerV2InvalidPostStatusError';
  };

export class RelayerV2UnexpectedPostStatusError extends RelayerV2ResponseError {
  constructor(params: {
    status: number;
    url: string;
    operation: RelayerOperation;
    cause?: RelayerBaseError | Error | undefined;
  }) {
    super({
      ...params,
      fetchMethod: 'POST',
      name: 'RelayerV2UnexpectedPostStatusError',
      message: `fetchMethod: POST status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
