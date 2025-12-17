import { RelayerErrorBase } from '../../../errors/RelayerErrorBase';
import { RelayerV2AsyncRequestState } from '../RelayerV2AsyncRequest';

////////////////////////////////////////////////////////////////////////////////
// RelayerStateError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2StateErrorType = RelayerErrorBase & {
  name: 'RelayerV2StateError';
};

export type RelayerV2StateErrorParams = {
  state: RelayerV2AsyncRequestState;
  message: string;
};

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

  public get state() {
    return this._state;
  }
}
