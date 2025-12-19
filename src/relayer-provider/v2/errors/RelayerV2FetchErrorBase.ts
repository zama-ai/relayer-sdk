import type { RelayerOperation } from '../../../types/relayer';
import {
  RelayerErrorBase,
  RelayerErrorBaseParams,
} from '../../../errors/RelayerErrorBase';
import type { Prettify } from '../../../utils/types';
import type { RelayerV2AsyncRequestState } from '../RelayerV2AsyncRequest';

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
    jobId?: string;
  }
>;

export abstract class RelayerV2FetchErrorBase extends RelayerErrorBase {
  private _fetchMethod: 'POST' | 'GET';
  private _url: string;
  private _jobId: string | undefined;
  private _operation: RelayerOperation;
  private _retryCount: number;
  private _elapsed: number;
  private _state: RelayerV2AsyncRequestState;

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
