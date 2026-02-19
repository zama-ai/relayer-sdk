import type { ProtocolErrorBaseParams } from './ProtocolErrorBase';
import type { Prettify } from '@base/types/utils';
import { ProtocolErrorBase } from './ProtocolErrorBase';

////////////////////////////////////////////////////////////////////////////////
// TFHEError
////////////////////////////////////////////////////////////////////////////////

export type TFHEErrorType = TFHEError & {
  name: 'TFHEError';
};

export type TFHEErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name' | 'message'> & {
    readonly message: string;
  }
>;

export class TFHEError extends ProtocolErrorBase {
  constructor(params: TFHEErrorParams) {
    super({
      ...params,
      name: 'TFHEError',
    });
  }
}
