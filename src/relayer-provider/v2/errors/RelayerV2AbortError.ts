import type { Prettify } from '@base/types/utils';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { RelayerV2RequestErrorBaseParams } from './RelayerV2RequestErrorBase';
import { RelayerV2RequestErrorBase } from './RelayerV2RequestErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2AbortError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2AbortErrorType = RelayerV2AbortError & {
  name: 'RelayerV2AbortError';
};

export type RelayerV2AbortErrorParams = Prettify<
  Omit<RelayerV2RequestErrorBaseParams, keyof RelayerErrorBaseParams>
>;

/**
 * Request was aborted.
 */
export class RelayerV2AbortError extends RelayerV2RequestErrorBase {
  constructor(params: RelayerV2AbortErrorParams) {
    super({
      ...params,
      name: 'RelayerV2AbortError',
      message: `Request aborted`,
    });
  }
}
