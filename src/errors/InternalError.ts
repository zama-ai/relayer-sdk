import { RelayerBaseError, RelayerBaseErrorParams } from './RelayerBaseError';

export type InternalErrorType = RelayerBaseError & {
  name: 'InternalError';
};

export class InternalError extends RelayerBaseError {
  constructor(params: RelayerBaseErrorParams) {
    super({
      ...params,
      name: 'InternalError',
      message: params.message ?? 'internal error',
    });
  }
}
