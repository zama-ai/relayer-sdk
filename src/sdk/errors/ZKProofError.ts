import type { ProtocolErrorBaseParams } from './ProtocolErrorBase';
import type { Prettify } from '@base/types/utils';
import { ProtocolErrorBase } from './ProtocolErrorBase';

////////////////////////////////////////////////////////////////////////////////
// ZKProofError
////////////////////////////////////////////////////////////////////////////////

export type ZKProofErrorType = ZKProofError & {
  name: 'ZKProofError';
};

export type ZKProofErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name'>
>;

export class ZKProofError extends ProtocolErrorBase {
  constructor(params: ZKProofErrorParams) {
    super({
      ...params,
      message: params.message ?? `FHEVM ZKProof is invalid.`,
      name: 'ZKProofError',
    });
  }
}
