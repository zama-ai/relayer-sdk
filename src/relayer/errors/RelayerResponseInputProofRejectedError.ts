import type { Prettify } from '@base/types/utils';
import type { RelayerErrorBaseParams } from './RelayerErrorBase';
import type { RelayerResponseErrorBaseParams } from './RelayerResponseErrorBase';
import { RelayerResponseErrorBase } from './RelayerResponseErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerResponseInputProofRejectedError
////////////////////////////////////////////////////////////////////////////////

export type RelayerResponseInputProofRejectedErrorType =
  RelayerResponseInputProofRejectedError & {
    name: 'RelayerResponseInputProofRejectedError';
  };

export type RelayerResponseInputProofRejectedErrorParams = Prettify<
  Omit<RelayerResponseErrorBaseParams, keyof RelayerErrorBaseParams>
>;

/**
 * The input proof is rejected.
 */
export class RelayerResponseInputProofRejectedError extends RelayerResponseErrorBase {
  constructor(params: RelayerResponseInputProofRejectedErrorParams) {
    super({
      ...params,
      name: 'RelayerResponseInputProofRejectedError',
      message: `Relayer rejected the input proof`,
    });
  }
}
