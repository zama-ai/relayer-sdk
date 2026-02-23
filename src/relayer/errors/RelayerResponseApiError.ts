import type { RelayerResponseErrorBaseParams } from './RelayerResponseErrorBase';
import type { RelayerApiError } from '../types/private-api';
import type { Prettify } from '@base/types/utils';
import { RelayerResponseErrorBase } from './RelayerResponseErrorBase';
import { humanReadableOperation } from '../utils';

////////////////////////////////////////////////////////////////////////////////
// RelayerGetResponseApiError
////////////////////////////////////////////////////////////////////////////////

export type RelayerResponseApiErrorType = RelayerResponseErrorBase & {
  name: 'RelayerResponseApiError';
};

export type RelayerResponseApiErrorParams = Prettify<
  Omit<RelayerResponseErrorBaseParams, 'metaMessages' | 'name' | 'message'> & {
    readonly relayerApiError: RelayerApiError;
  }
>;

/**
 * If the relayer API returns an error response.
 */
export class RelayerResponseApiError extends RelayerResponseErrorBase {
  readonly #relayerApiError: RelayerApiError;

  constructor(params: RelayerResponseApiErrorParams) {
    const metaMessages = [
      `label: ${params.relayerApiError.label}`,
      `message: ${params.relayerApiError.message}`,
    ];

    super({
      ...params,
      metaMessages,
      name: 'RelayerResponseApiError',
      message: `${humanReadableOperation(params.operation, true)}: Relayer API error [${params.relayerApiError.label}]: ${params.relayerApiError.message}`,
    });

    this.#relayerApiError = params.relayerApiError;
  }

  public get relayerApiError(): RelayerApiError {
    return this.#relayerApiError;
  }
}
