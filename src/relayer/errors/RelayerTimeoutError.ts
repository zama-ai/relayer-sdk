import type { RelayerRequestErrorBaseParams } from './RelayerRequestErrorBase';
import type { Prettify } from '@base/types/utils';
import { RelayerRequestErrorBase } from './RelayerRequestErrorBase';
import { humanReadableOperation } from '../utils';

////////////////////////////////////////////////////////////////////////////////
// RelayerTimeoutError
////////////////////////////////////////////////////////////////////////////////

export type RelayerTimeoutErrorType = RelayerTimeoutError & {
  name: 'RelayerTimeoutError';
};

export type RelayerTimeoutErrorParams = Prettify<
  Omit<RelayerRequestErrorBaseParams, 'message' | 'name'> & {
    readonly timeoutMs: number;
  }
>;

/**
 * The request timed out. (Global)
 */
export class RelayerTimeoutError extends RelayerRequestErrorBase {
  constructor(params: RelayerTimeoutErrorParams) {
    super({
      ...params,
      name: 'RelayerTimeoutError',
      message: `${humanReadableOperation(params.operation, true)}: Request timed out after ${params.timeoutMs}ms`,
    });
  }
}
