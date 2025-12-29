import type { Prettify } from '../../../utils/types';
import type { RelayerV2ResultInputProofRejected } from '../types/types';
import { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import {
  RelayerV2ResponseErrorBase,
  RelayerV2ResponseErrorBaseParams,
} from './RelayerV2ResponseErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseInputProofRejectedError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseInputProofRejectedErrorType =
  RelayerV2ResponseInputProofRejectedError & {
    name: 'RelayerV2ResponseInputProofRejectedError';
  };

export type RelayerV2ResponseInputProofRejectedErrorParams = Prettify<
  Omit<RelayerV2ResponseErrorBaseParams, keyof RelayerErrorBaseParams> & {
    result: RelayerV2ResultInputProofRejected;
  }
>;

export class RelayerV2ResponseInputProofRejectedError extends RelayerV2ResponseErrorBase {
  private _result: RelayerV2ResultInputProofRejected;

  constructor(params: RelayerV2ResponseInputProofRejectedErrorParams) {
    super({
      ...params,
      name: 'RelayerV2ResponseInputProofRejectedError',
      message: `InputProof rejected`,
    });
    this._result = params.result;
  }

  public get result(): RelayerV2ResultInputProofRejected {
    return this._result;
  }
}
