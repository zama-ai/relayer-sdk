import { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import {
  RelayerV2ResponseErrorBase,
  RelayerV2ResponseErrorBaseParams,
} from './RelayerV2ResponseErrorBase';
import { Prettify } from '../../../utils/types';
import type { RelayerV2AsyncRequestState } from '../RelayerV2AsyncRequest';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseStatusError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseStatusErrorType = RelayerV2ResponseStatusError & {
  name: 'RelayerV2ResponseStatusError';
};

export type RelayerV2ResponseStatusErrorParams = Prettify<
  Omit<RelayerV2ResponseErrorBaseParams, keyof RelayerErrorBaseParams> & {
    state: RelayerV2AsyncRequestState;
  }
>;

export class RelayerV2ResponseStatusError extends RelayerV2ResponseErrorBase {
  constructor(params: RelayerV2ResponseStatusErrorParams) {
    super({
      ...params,
      name: 'RelayerV2ResponseStatusError',
      message: `fetchMethod: ${params.fetchMethod} status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
