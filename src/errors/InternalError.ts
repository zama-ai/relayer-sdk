import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// InternalError
////////////////////////////////////////////////////////////////////////////////

export type InternalErrorType = RelayerErrorBase & {
  name: 'InternalError';
};

export type InternalErrorParams = {
  message?: string;
};

export class InternalError extends RelayerErrorBase {
  constructor(params: InternalErrorParams) {
    super({
      ...params,
      name: 'InternalError',
      message: params.message ?? 'internal error',
    });
  }
}

export function assertRelayer(condition: boolean): asserts condition {
  if (!condition) {
    throw new InternalError({ message: 'Assertion failed' });
  }
}
