import type { RelayerResponseErrorBaseParams } from './RelayerResponseErrorBase';
import type { RelayerAsyncRequestState } from '../types/private-api';
import type { Prettify } from '@base/types/utils';
import { RelayerResponseErrorBase } from './RelayerResponseErrorBase';
import { humanReadableOperation } from '../utils';

////////////////////////////////////////////////////////////////////////////////
// RelayerResponseStatusError
////////////////////////////////////////////////////////////////////////////////

export type RelayerResponseStatusErrorType = RelayerResponseStatusError & {
  name: 'RelayerResponseStatusError';
};

export type RelayerResponseStatusErrorParams = Prettify<
  Omit<RelayerResponseErrorBaseParams, 'message' | 'name' | 'details'> & {
    readonly state: RelayerAsyncRequestState;
  }
>;

/**
 * The response status is unexpected.
 */
export class RelayerResponseStatusError extends RelayerResponseErrorBase {
  constructor(params: RelayerResponseStatusErrorParams) {
    super({
      ...params,
      name: 'RelayerResponseStatusError',
      message: `${humanReadableOperation(params.operation, true)}: Relayer returned unexpected response status: ${params.status}`,
      details: `The Relayer server returned an unexpected response status (${params.status}). This status ${params.status} is not part of the expected API contract and may indicate a server configuration issue.`,
    });
  }
}
