import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerV2RequestError } from './RelayerV2RequestError';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';

export type RelayerV2InternalErrorType = RelayerV2InternalError & {
  name: 'RelayerV2InternalError';
};

export class RelayerV2InternalError extends RelayerV2RequestError {
  constructor(params: {
    fetchMethod: 'POST' | 'GET';
    url: string;
    operation: RelayerOperation;
    status?: number;
    cause?: RelayerBaseError | Error;
    message?: string;
  }) {
    super({
      ...params,
      name: 'RelayerV2InternalError',
      message: params.message ?? 'internal error',
    });
  }
}
