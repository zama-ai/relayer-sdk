import type { RelayerRequestErrorBaseParams } from './RelayerRequestErrorBase';
import type { RelayerErrorBaseParams } from './RelayerErrorBase';
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
  Omit<RelayerRequestErrorBaseParams, keyof RelayerErrorBaseParams> & {
    timeoutMs: number;
  }
>;

/**
 * The request timed out. (Global)
 */
export class RelayerTimeoutError extends RelayerRequestErrorBase {
  private readonly _timeoutMs: number;

  constructor(params: RelayerTimeoutErrorParams) {
    super({
      ...params,
      name: 'RelayerTimeoutError',
      message: `${humanReadableOperation(params.operation, true)}: Request timed out after ${params.timeoutMs}ms`,
    });

    this._timeoutMs = params.timeoutMs;
  }

  public get timeoutMs(): number {
    return this._timeoutMs;
  }
}
