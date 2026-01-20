import type { RelayerV2RequestErrorBaseParams } from './RelayerV2RequestErrorBase';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { Prettify } from '@base/types/utils';
import {
  humanReadableOperation,
  RelayerV2RequestErrorBase,
} from './RelayerV2RequestErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2TimeoutError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2TimeoutErrorType = RelayerV2TimeoutError & {
  name: 'RelayerV2TimeoutError';
};

export type RelayerV2TimeoutErrorParams = Prettify<
  Omit<RelayerV2RequestErrorBaseParams, keyof RelayerErrorBaseParams> & {
    timeoutMs: number;
  }
>;

/**
 * The request timed out. (Global)
 */
export class RelayerV2TimeoutError extends RelayerV2RequestErrorBase {
  private readonly _timeoutMs: number;

  constructor(params: RelayerV2TimeoutErrorParams) {
    super({
      ...params,
      name: 'RelayerV2TimeoutError',
      message: `${humanReadableOperation(params.operation, true)}: Request timed out after ${params.timeoutMs}ms`,
    });

    this._timeoutMs = params.timeoutMs;
  }

  public get timeoutMs(): number {
    return this._timeoutMs;
  }
}
