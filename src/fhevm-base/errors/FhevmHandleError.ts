import type { FhevmErrorBaseParams } from './FhevmErrorBase';
import type { Prettify } from '@base/types/utils';
import { FhevmErrorBase } from './FhevmErrorBase';

export type FhevmHandleErrorType = FhevmHandleError & {
  name: 'FhevmHandleError';
};

export type FhevmHandleErrorParams = Prettify<
  Omit<FhevmErrorBaseParams, 'name'> & { handle?: string }
>;

export class FhevmHandleError extends FhevmErrorBase {
  constructor(params: FhevmHandleErrorParams) {
    super({
      message:
        params.message ??
        (params.handle !== undefined
          ? `FHEVM Handle "${params.handle}" is invalid.`
          : `FHEVM Handle is invalid.`),
      name: 'FhevmHandleError',
    });
  }
}
