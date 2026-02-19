import type { FhevmErrorBaseParams } from './FhevmErrorBase';
import type { Prettify } from '@base/types/utils';
import { FhevmErrorBase } from './FhevmErrorBase';

////////////////////////////////////////////////////////////////////////////////
// ZKProofError
////////////////////////////////////////////////////////////////////////////////

export type ZKProofErrorType = ZKProofError & {
  name: 'ZKProofError';
};

export type ZKProofErrorParams = Prettify<Omit<FhevmErrorBaseParams, 'name'>>;

export class ZKProofError extends FhevmErrorBase {
  constructor(params: ZKProofErrorParams) {
    super({
      ...params,
      message: params.message ?? `FHEVM ZKProof is invalid.`,
      name: 'ZKProofError',
    });
  }
}
