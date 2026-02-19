import type { ProtocolErrorBaseParams } from './ProtocolErrorBase';
import type { Prettify } from '@base/types/utils';
import { ProtocolErrorBase } from './ProtocolErrorBase';

////////////////////////////////////////////////////////////////////////////////
// InputProofError
////////////////////////////////////////////////////////////////////////////////

export type InputProofErrorType = InputProofError & {
  name: 'InputProofError';
};

export type InputProofErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name'>
>;

export class InputProofError extends ProtocolErrorBase {
  constructor(params: InputProofErrorParams) {
    super({
      ...params,
      message: params.message ?? `FHEVM InputProof is invalid.`,
      name: 'InputProofError',
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// TooManyHandlesError
////////////////////////////////////////////////////////////////////////////////

export type TooManyHandlesErrorType = TooManyHandlesError & {
  name: 'TooManyHandlesError';
};

export type TooManyHandlesErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name'> & { numberOfHandles: number }
>;

export class TooManyHandlesError extends ProtocolErrorBase {
  constructor(params: TooManyHandlesErrorParams) {
    super({
      ...params,
      name: 'TooManyHandlesError',
      message: `Trying to pack ${params.numberOfHandles} handles. Packing more than 256 variables in a single input ciphertext is unsupported`,
    });
  }
}
