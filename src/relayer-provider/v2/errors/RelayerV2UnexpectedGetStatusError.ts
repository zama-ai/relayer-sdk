import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { RelayerV2BaseGetResponseError } from './RelayerV2ResponseError';

export type RelayerV2UnexpectedGetStatusErrorType =
  RelayerV2UnexpectedGetStatusError & {
    name: 'RelayerV2UnexpectedGetStatusError';
  };

export class RelayerV2UnexpectedGetStatusError extends RelayerV2BaseGetResponseError {
  constructor(params: {
    status: number;
    url: string;
    operation: RelayerOperation;
    cause?: RelayerBaseError | Error | undefined;
  }) {
    super({
      ...params,
      name: 'RelayerV2UnexpectedGetStatusError',
      message: `fetchMethod: GET status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
