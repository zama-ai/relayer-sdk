import { Prettify } from '../../../utils/types';
import {
  RelayerV2FetchErrorBase,
  RelayerV2FetchErrorBaseParams,
} from './RelayerV2FetchErrorBase';
import { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2MaxRetryError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2MaxRetryErrorType = RelayerV2MaxRetryError & {
  name: 'RelayerV2MaxRetryError';
};

export type RelayerV2MaxRetryErrorParams = Prettify<
  Omit<RelayerV2FetchErrorBaseParams, keyof RelayerErrorBaseParams>
>;

export class RelayerV2MaxRetryError extends RelayerV2FetchErrorBase {
  constructor(params: RelayerV2MaxRetryErrorParams) {
    super({
      ...params,
      name: 'RelayerV2MaxRetryError',
      message: 'max retry error',
    });
  }
}
