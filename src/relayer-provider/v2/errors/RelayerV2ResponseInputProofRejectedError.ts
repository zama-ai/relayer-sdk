import type { Prettify } from '@base/types/utils';
import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { RelayerV2ResponseErrorBaseParams } from './RelayerV2ResponseErrorBase';
import { RelayerV2ResponseErrorBase } from './RelayerV2ResponseErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseInputProofRejectedError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseInputProofRejectedErrorType =
  RelayerV2ResponseInputProofRejectedError & {
    name: 'RelayerV2ResponseInputProofRejectedError';
  };

export type RelayerV2ResponseInputProofRejectedErrorParams = Prettify<
  Omit<RelayerV2ResponseErrorBaseParams, keyof RelayerErrorBaseParams>
>;

/**
 * The input proof is rejected.
 */
export class RelayerV2ResponseInputProofRejectedError extends RelayerV2ResponseErrorBase {
  constructor(params: RelayerV2ResponseInputProofRejectedErrorParams) {
    super({
      ...params,
      name: 'RelayerV2ResponseInputProofRejectedError',
      message: `InputProof rejected`,
    });
  }
}
