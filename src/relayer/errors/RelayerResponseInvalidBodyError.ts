import type { Prettify } from '@base/types/utils';
import type { RelayerResponseErrorBaseParams } from './RelayerResponseErrorBase';
import type { InvalidPropertyError } from '@base/errors/InvalidPropertyError';
import { RelayerResponseErrorBase } from './RelayerResponseErrorBase';
import { ensureError } from '@base/errors/utils';
import { humanReadableOperation } from '../utils';

////////////////////////////////////////////////////////////////////////////////
// RelayerResponseInvalidBodyError
////////////////////////////////////////////////////////////////////////////////

export type RelayerResponseInvalidBodyErrorType =
  RelayerResponseInvalidBodyError & {
    name: 'RelayerResponseInvalidBodyError';
  };

export type RelayerResponseInvalidBodyErrorParams = Prettify<
  Omit<RelayerResponseErrorBaseParams, 'cause' | 'name' | 'message'> & {
    readonly cause: InvalidPropertyError;
    readonly bodyJson: string;
  }
>;

/**
 * When the response body does not match the expected schema.
 */
export class RelayerResponseInvalidBodyError extends RelayerResponseErrorBase {
  readonly #bodyJson: string;

  constructor(params: RelayerResponseInvalidBodyErrorParams) {
    super({
      ...params,
      cause: ensureError(params.cause),
      name: 'RelayerResponseInvalidBodyError',
      message: `${humanReadableOperation(params.operation, true)}: Relayer response body does not match the expected schema`,
    });

    this.#bodyJson = params.bodyJson;
  }

  public get bodyJson(): string {
    return this.#bodyJson;
  }
}
