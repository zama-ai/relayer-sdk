import {
  RelayerV2RequestError,
  RelayerV2RequestErrorParams,
} from './RelayerV2RequestError';
import { Prettify } from '../../../utils/types';

export type RelayerV2InternalRequestErrorType =
  RelayerV2InternalRequestError & {
    name: 'RelayerV2InternalRequestError';
  };

export type RelayerV2InternalRequestErrorParams = Prettify<
  Omit<RelayerV2RequestErrorParams, 'name'> & {
    status?: number;
    state?: string;
  }
>;

export class RelayerV2InternalRequestError extends RelayerV2RequestError {
  private _status?: number;
  private _state?: string;

  constructor(params: RelayerV2InternalRequestErrorParams) {
    super({
      ...params,
      name: 'RelayerV2InternalRequestError',
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
