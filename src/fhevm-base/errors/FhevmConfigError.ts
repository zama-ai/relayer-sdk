import type { FhevmErrorBaseParams } from './FhevmErrorBase';
import type { Prettify } from '@base/types/utils';
import { FhevmErrorBase } from './FhevmErrorBase';

////////////////////////////////////////////////////////////////////////////////
// FhevmConfigError
////////////////////////////////////////////////////////////////////////////////

export type FhevmConfigErrorType = FhevmConfigError & {
  name: 'FhevmConfigError';
};

export type FhevmConfigErrorParams = Prettify<
  Omit<FhevmErrorBaseParams, 'name'>
>;

export class FhevmConfigError extends FhevmErrorBase {
  constructor(params: FhevmConfigErrorParams) {
    super({
      ...params,
      name: 'FhevmConfigError',
    });
  }
}
