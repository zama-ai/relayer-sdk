import type { ProtocolErrorBaseParams } from './ProtocolErrorBase';
import type { Prettify } from '@base/types/utils';
import { ProtocolErrorBase } from './ProtocolErrorBase';

////////////////////////////////////////////////////////////////////////////////
// EncryptionError
////////////////////////////////////////////////////////////////////////////////

export type EncryptionErrorType = EncryptionError & {
  name: 'EncryptionError';
};

export type EncryptionErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name'>
>;

export class EncryptionError extends ProtocolErrorBase {
  constructor(params: EncryptionErrorParams) {
    super({
      ...params,
      name: 'EncryptionError',
    });
  }
}
