import type { Prettify } from '@base/types/utils';
import type { RelayerAsyncRequestState } from '../types/private-api';
import type { RelayerErrorBaseParams } from './RelayerErrorBase';
import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerStateError
////////////////////////////////////////////////////////////////////////////////

export type RelayerStateErrorType = RelayerErrorBase & {
  name: 'RelayerStateError';
};

export type RelayerStateErrorParams = Prettify<
  Omit<RelayerErrorBaseParams, 'name'> & {
    readonly state: RelayerAsyncRequestState;
    readonly message: string;
  }
>;

/**
 * The request cannot run (already terminated, canceled, succeeded, failed, aborted, or running).
 */
export class RelayerStateError extends RelayerErrorBase {
  readonly #state: RelayerAsyncRequestState;

  constructor(params: RelayerStateErrorParams) {
    super({
      ...params,
      name: 'RelayerStateError',
    });
    this.#state = { ...params.state };
    Object.freeze(this.#state);
  }

  public get state(): RelayerAsyncRequestState {
    return this.#state;
  }
}
