import { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import { Prettify } from '../../../utils/types';
import {
  RelayerV2RequestErrorBase,
  RelayerV2RequestErrorBaseParams,
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

export class RelayerV2TimeoutError extends RelayerV2RequestErrorBase {
  constructor(params: RelayerV2TimeoutErrorParams) {
    super({
      ...params,
      name: 'RelayerV2TimeoutError',
      message: `Request timed out after ${params.timeoutMs}ms`,
    });
  }
}
