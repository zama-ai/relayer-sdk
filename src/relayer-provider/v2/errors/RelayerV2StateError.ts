import type { RelayerV2AsyncRequestState } from '../RelayerV2AsyncRequest';
import { RelayerErrorBase } from '../../../errors/RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerStateError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2StateErrorType = RelayerErrorBase & {
  name: 'RelayerV2StateError';
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RelayerV2StateErrorParams = {
  state: RelayerV2AsyncRequestState;
  message: string;
};

/**
 * The request cannot run (already terminated, canceled, succeeded, failed, aborted, or running).
 */
export class RelayerV2StateError extends RelayerErrorBase {
  private readonly _state: RelayerV2AsyncRequestState;

  constructor(params: RelayerV2StateErrorParams) {
    super({
      ...params,
      name: 'RelayerV2StateError',
    });
    this._state = { ...params.state };
    Object.freeze(this._state);
  }

  public get state(): RelayerV2AsyncRequestState {
    return this._state;
  }
}
