import { RelayerOperation } from '../../../relayer/fetchRelayer';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { RelayerV2ApiError } from '../types/types';

export type RelayerV2ErrorType = RelayerV2Error & {
  name: 'RelayerV2Error';
};

export class RelayerV2Error extends RelayerBaseError {
  private _url: string;
  private _retryCount: number;
  private _elapsed: number;
  private _operation: RelayerOperation;
  private _jobId?: string;
  private _fetchMethod: 'GET' | 'POST';
  private _relayerApiError: RelayerV2ApiError;

  constructor(params: {
    fetchMethod: 'GET' | 'POST';
    status: number;
    url: string;
    jobId?: string;
    operation: RelayerOperation;
    retryCount: number;
    elapsed: number;
    relayerApiError: RelayerV2ApiError;
  }) {
    super({
      ...params,
      name: 'RelayerV2Error',
      message: params.relayerApiError.message,
    });

    this._operation = params.operation;
    this._url = params.url;
    this._fetchMethod = params.fetchMethod;
    this._relayerApiError = params.relayerApiError;
    this._retryCount = params.retryCount;
    this._elapsed = params.elapsed;
  }

  public get url(): string {
    return this._url;
  }

  public get jobId(): string | undefined {
    return this._jobId;
  }

  public get operation(): RelayerOperation {
    return this._operation;
  }

  public get retryCount(): number {
    return this._retryCount;
  }

  public get elapsed(): number {
    return this._elapsed;
  }

  public get fetchMethod(): 'GET' | 'POST' {
    return this._fetchMethod;
  }

  public get relayerApiError(): RelayerV2ApiError {
    return this._relayerApiError;
  }
}
