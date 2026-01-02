import type { Prettify } from '@base/types/utils';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { RelayerV2ResponseErrorBaseParams } from './RelayerV2ResponseErrorBase';
import type { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { RelayerV2ResponseErrorBase } from './RelayerV2ResponseErrorBase';
import { ensureError } from '../../../errors/utils';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseInvalidBodyError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseInvalidBodyErrorType =
  RelayerV2ResponseInvalidBodyError & {
    name: 'RelayerV2ResponseInvalidBodyError';
  };

export type RelayerV2ResponseInvalidBodyErrorParams = Prettify<
  Omit<RelayerV2ResponseErrorBaseParams, keyof RelayerErrorBaseParams> & {
    cause: InvalidPropertyError;
    bodyJson: string;
  }
>;

export class RelayerV2ResponseInvalidBodyError extends RelayerV2ResponseErrorBase {
  constructor(params: RelayerV2ResponseInvalidBodyErrorParams) {
    super({
      ...params,
      cause: ensureError(params.cause),
      name: 'RelayerV2ResponseInvalidBodyError',
      message: `fetchMethod: ${params.fetchMethod} status:${params.status} url:${params.url} operation:${params.operation}`,
    });
  }
}
