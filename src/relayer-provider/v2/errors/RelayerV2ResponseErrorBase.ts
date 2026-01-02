import type { RelayerV2FetchErrorBaseParams } from './RelayerV2FetchErrorBase';
import type { Prettify } from '@base/types/utils';
import { RelayerV2FetchErrorBase } from './RelayerV2FetchErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseErrorBase
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseErrorBaseType = RelayerV2ResponseErrorBase & {
  name: 'RelayerV2ResponseErrorBase';
};

export type RelayerV2ResponseErrorBaseParams = Prettify<
  RelayerV2FetchErrorBaseParams & {
    status: number;
  }
>;

export abstract class RelayerV2ResponseErrorBase extends RelayerV2FetchErrorBase {
  private readonly _status: number;

  constructor(params: RelayerV2ResponseErrorBaseParams) {
    super({
      ...params,
      name: params.name ?? 'RelayerV2ResponseErrorBase',
    });
    this._status = params.status;
  }

  public get status(): number {
    return this._status;
  }
}
