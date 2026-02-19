import type { ProtocolErrorBaseParams } from './ProtocolErrorBase';
import type { Prettify } from '@base/types/utils';
import { ProtocolErrorBase } from './ProtocolErrorBase';

////////////////////////////////////////////////////////////////////////////////
// UnknownSignerError
////////////////////////////////////////////////////////////////////////////////

export type UnknownSignerErrorType = UnknownSignerError & {
  name: 'UnknownSignerError';
};

export type UnknownSignerErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name'> & {
    unknownAddress: string;
    type: 'coprocessor' | 'kms';
  }
>;

export class UnknownSignerError extends ProtocolErrorBase {
  constructor(params: UnknownSignerErrorParams) {
    super({
      ...params,
      name: 'TooManyHandlesError',
      message: `Invalid address found: ${params.unknownAddress} is not in the list of ${params.type} signers`,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// ThresholdSignerError
////////////////////////////////////////////////////////////////////////////////

export type ThresholdSignerErrorType = ThresholdSignerError & {
  name: 'ThresholdSignerError';
};

export type ThresholdSignerErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name'> & { type: 'coprocessor' | 'kms' }
>;

export class ThresholdSignerError extends ProtocolErrorBase {
  constructor(params: ThresholdSignerErrorParams) {
    super({
      ...params,
      name: 'ThresholdSignerError',
      message: `${params.type} signers threshold is not reached`,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// DuplicateSignerError
////////////////////////////////////////////////////////////////////////////////

export type DuplicateSignerErrorType = DuplicateSignerError & {
  name: 'DuplicateSignerError';
};

export type DuplicateSignerErrorParams = Prettify<
  Omit<ProtocolErrorBaseParams, 'name'> & {
    duplicateAddress: string;
    type: 'coprocessor' | 'kms';
  }
>;

export class DuplicateSignerError extends ProtocolErrorBase {
  constructor(params: DuplicateSignerErrorParams) {
    super({
      ...params,
      name: 'DuplicateSignerError',
      message: `Duplicate ${params.type} signer address found: ${params.duplicateAddress} appears multiple times in recovered addresses`,
    });
  }
}
