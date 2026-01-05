import type { RelayerV2ResponseErrorBaseParams } from './RelayerV2ResponseErrorBase';
import type { RelayerApiErrorType } from '../../types/public-api';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { Prettify } from '@base/types/utils';
import { RelayerV2ResponseErrorBase } from './RelayerV2ResponseErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2GetResponseApiError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseApiErrorType = RelayerV2ResponseErrorBase & {
  name: 'RelayerV2ResponseApiError';
};

export type RelayerV2ResponseApiErrorParams = Prettify<
  Omit<RelayerV2ResponseErrorBaseParams, keyof RelayerErrorBaseParams> & {
    relayerApiError: RelayerApiErrorType;
  }
>;

/**
 * If the relayer API returns an error response.
 */
export class RelayerV2ResponseApiError extends RelayerV2ResponseErrorBase {
  private readonly _relayerApiError: RelayerApiErrorType;

  constructor(params: RelayerV2ResponseApiErrorParams) {
    const metaMessages = [`label: ${params.relayerApiError.label}`];

    super({
      ...params,
      metaMessages,
      name: 'RelayerV2ResponseApiError',
      message: params.relayerApiError.message,
    });

    this._relayerApiError = params.relayerApiError;
  }

  public get relayerApiError(): RelayerApiErrorType {
    return this._relayerApiError;
  }
}
