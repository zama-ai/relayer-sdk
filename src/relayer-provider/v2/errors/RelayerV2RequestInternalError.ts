import {
  RelayerV2RequestErrorBase,
  RelayerV2RequestErrorBaseParams,
} from './RelayerV2RequestErrorBase';
import { Prettify } from '../../../utils/types';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2RequestInternalError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2InternalRequestErrorType =
  RelayerV2RequestInternalError & {
    name: 'RelayerV2RequestInternalError';
  };

export type RelayerV2InternalRequestErrorParams = Prettify<
  Omit<RelayerV2RequestErrorBaseParams, 'name'> & {
    status?: number;
    state?: string;
  }
>;

export class RelayerV2RequestInternalError extends RelayerV2RequestErrorBase {
  private _status?: number;
  private _state?: string;

  constructor(params: RelayerV2InternalRequestErrorParams) {
    super({
      ...params,
      name: 'RelayerV2RequestInternalError',
      message: params.message ?? 'internal error',
    });
    this._status = params.status;
    this._state = params.state;
  }

  public get status(): number | undefined {
    return this._status;
  }

  public get state(): string | undefined {
    return this._state;
  }
}
