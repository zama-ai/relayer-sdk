import { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import { Prettify } from '../../../utils/types';
import {
  RelayerV2RequestErrorBase,
  RelayerV2RequestErrorBaseParams,
} from './RelayerV2RequestErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2AbortError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2AbortErrorType = RelayerV2AbortError & {
  name: 'RelayerV2AbortError';
};

export type RelayerV2AbortErrorParams = Prettify<
  Omit<RelayerV2RequestErrorBaseParams, keyof RelayerErrorBaseParams>
>;

export class RelayerV2AbortError extends RelayerV2RequestErrorBase {
  constructor(params: RelayerV2AbortErrorParams) {
    super({
      ...params,
      name: 'RelayerV2AbortError',
      message: `Request aborted`,
    });
  }
}
