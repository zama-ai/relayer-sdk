import { RelayerOperation } from 'src/relayer/fetchRelayer';
import { RelayerBaseError } from 'src/errors/RelayerBaseError';
import { RelayerV2ResponseError } from './RelayerV2ResponseError';

export type RelayerV2UnexpectedGetStatusErrorType =
  RelayerV2UnexpectedGetStatusError & {
    name: 'RelayerV2UnexpectedGetStatusError';
  };

export class RelayerV2UnexpectedGetStatusError extends RelayerV2ResponseError {
  constructor(params: {
    status: number;
    url: string;
    operation: RelayerOperation;
    cause?: RelayerBaseError | Error | undefined;
  }) {
    super({
      ...params,
      fetchMethod: 'GET',
      name: 'RelayerV2UnexpectedGetStatusError',
      message: `fetchMethod: GET status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
