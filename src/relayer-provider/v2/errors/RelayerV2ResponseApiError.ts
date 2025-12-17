import {
  RelayerV2ResponseErrorBase,
  RelayerV2ResponseErrorBaseParams,
} from './RelayerV2ResponseErrorBase';
import { Prettify } from '../../../utils/types';
import { RelayerV2ResponseApiErrorCode } from '../types/types';
import { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2GetResponseApiError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseApiErrorType = RelayerV2ResponseErrorBase & {
  name: 'RelayerV2ResponseApiError';
};

export type RelayerV2ResponseApiErrorParams = Prettify<
  Omit<RelayerV2ResponseErrorBaseParams, keyof RelayerErrorBaseParams> & {
    relayerApiError: RelayerV2ResponseApiErrorCode;
  }
>;

export class RelayerV2ResponseApiError extends RelayerV2ResponseErrorBase {
  constructor(params: RelayerV2ResponseApiErrorParams) {
    super({
      ...params,
      name: 'RelayerV2ResponseApiError',
      message: params.relayerApiError.message,
    });
  }
}
