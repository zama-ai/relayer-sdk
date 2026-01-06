import type { RelayerV2RequestErrorBaseParams } from './RelayerV2RequestErrorBase';
import type { Prettify } from '@base/types/utils';
import { RelayerV2RequestErrorBase } from './RelayerV2RequestErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2RequestInternalError
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2InternalRequestErrorType =
  RelayerV2RequestInternalError & {
    name: 'RelayerV2RequestInternalError';
  };

export type RelayerV2InternalRequestErrorParams = Prettify<
  Omit<RelayerV2RequestErrorBaseParams, 'name' | 'message'> & {
    message?: string;
    status?: number;
    state?: string;
  }
>;

/**
 * Internal error
 */
export class RelayerV2RequestInternalError extends RelayerV2RequestErrorBase {
  private readonly _status?: number | undefined;
  private readonly _state?: string | undefined;

  constructor(params: RelayerV2InternalRequestErrorParams) {
    const metaMessages = [
      ...(params.metaMessages ?? []),
      ...(params.status !== undefined ? [`status: ${params.status}`] : []),
      ...(params.state !== undefined ? [`state: ${params.state}`] : []),
    ];

    super({
      ...params,
      metaMessages,
      name: 'RelayerV2RequestInternalError',
      message: params.message ?? 'Internal error',
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
