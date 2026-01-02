import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { RelayerV2AsyncRequestState } from '../RelayerV2AsyncRequest';
import type { RelayerOperation } from '../../types/public-api';
import type { Prettify } from '@base/types/utils';
import { RelayerErrorBase } from '../../../errors/RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2FetchErrorBase
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2FetchErrorBaseType = RelayerV2FetchErrorBase & {
  name: 'RelayerV2FetchErrorBase';
};

export type RelayerV2FetchErrorBaseParams = Prettify<
  RelayerErrorBaseParams & {
    fetchMethod: 'GET' | 'POST';
    url: string;
    operation: RelayerOperation;
    retryCount: number;
    elapsed: number;
    state: RelayerV2AsyncRequestState;
    jobId?: string | undefined;
  }
>;

export abstract class RelayerV2FetchErrorBase extends RelayerErrorBase {
  private readonly _fetchMethod: 'POST' | 'GET';
  private readonly _url: string;
  private readonly _jobId: string | undefined;
  private readonly _operation: RelayerOperation;
  private readonly _retryCount: number;
  private readonly _elapsed: number;
  private readonly _state: RelayerV2AsyncRequestState;

  constructor(params: RelayerV2FetchErrorBaseParams) {
    super({
      ...params,
      name: params.name ?? 'RelayerV2FetchErrorBase',
    });
    this._fetchMethod = params.fetchMethod;
    this._url = params.url;
    this._operation = params.operation;
    this._elapsed = params.elapsed;
    this._retryCount = params.retryCount;
    this._state = params.state;
    this._jobId = params.jobId;
  }

  public get url(): string {
    return this._url;
  }

  public get operation(): RelayerOperation {
    return this._operation;
  }

  public get fetchMethod(): 'POST' | 'GET' {
    return this._fetchMethod;
  }

  public get jobId(): string | undefined {
    return this._jobId;
  }

  public get retryCount(): number {
    return this._retryCount;
  }

  public get elapsed(): number {
    return this._elapsed;
  }

  public get state(): RelayerV2AsyncRequestState {
    return this._state;
  }

  public get isAbort(): boolean {
    // AbortError is not an instance of Error!
    return this.cause ? (this.cause as any).name === 'AbortError' : false;
  }
}
