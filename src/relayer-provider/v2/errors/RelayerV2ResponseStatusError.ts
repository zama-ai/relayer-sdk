import type { RelayerV2ResponseErrorBaseParams } from './RelayerV2ResponseErrorBase';
import type { RelayerV2AsyncRequestState } from '../RelayerV2AsyncRequest';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { Prettify } from '@base/types/utils';
import { RelayerV2ResponseErrorBase } from './RelayerV2ResponseErrorBase';
import { humanReadableOperation } from './RelayerV2RequestErrorBase';

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

/**
 * The response status is unexpected.
 */
export class RelayerV2ResponseStatusError extends RelayerV2ResponseErrorBase {
  constructor(params: RelayerV2ResponseStatusErrorParams) {
    super({
      ...params,
      name: 'RelayerV2ResponseStatusError',
      message: `${humanReadableOperation(params.operation, true)}: Relayer returned unexpected response status: ${params.status}`,
      details: `The Relayer server returned an unexpected response status (${params.status}). This status ${params.status} is not part of the expected API contract and may indicate a server configuration issue.`,
    });
  }
}
