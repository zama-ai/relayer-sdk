import type { Prettify } from '@base/types/utils';
import type { RelayerErrorBaseParams } from './RelayerErrorBase';
import type { RelayerRequestErrorBaseParams } from './RelayerRequestErrorBase';
import { RelayerRequestErrorBase } from './RelayerRequestErrorBase';
import { humanReadableOperation } from '../utils';

////////////////////////////////////////////////////////////////////////////////
// RelayerAbortError
////////////////////////////////////////////////////////////////////////////////

export type RelayerAbortErrorType = RelayerAbortError & {
  name: 'RelayerAbortError';
};

export type RelayerAbortErrorParams = Prettify<
  Omit<RelayerRequestErrorBaseParams, keyof RelayerErrorBaseParams>
>;

/**
 * Request was aborted.
 */
export class RelayerAbortError extends RelayerRequestErrorBase {
  constructor(params: RelayerAbortErrorParams) {
    super({
      ...params,
      name: 'RelayerAbortError',
      message: `${humanReadableOperation(params.operation, true)}: Request aborted`,
    });
  }
}
