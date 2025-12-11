import { RelayerOperation } from '../../../relayer/fetchRelayer';
import {
  RelayerBaseError,
  RelayerBaseErrorParams,
} from '../../../errors/RelayerBaseError';
import { Prettify } from '../../../utils/types';

export type RelayerV2ResponseErrorType = RelayerV2BaseResponseError & {
  name: 'RelayerV2ResponseError';
};

export type RelayerV2BaseResponseErrorParams = Prettify<
  RelayerBaseErrorParams & {
    url: string;
    operation: RelayerOperation;
    status: number;
  }
>;

export abstract class RelayerV2BaseResponseError extends RelayerBaseError {
  private _fetchMethod: 'POST' | 'GET';
  private _status: number;
  private _url: string;
  private _operation: RelayerOperation;

  constructor(
    fetchMethod: 'GET' | 'POST',
    params: RelayerV2BaseResponseErrorParams,
  ) {
    super(params);
    this._fetchMethod = fetchMethod;
    this._status = params.status;
    this._url = params.url;
    this._operation = params.operation;
  }

  public get url(): string {
    return this._url;
  }

  public get status(): number {
    return this._status;
  }

  public get operation(): RelayerOperation {
    return this._operation;
  }

  public get fetchMethod(): 'POST' | 'GET' {
    return this._fetchMethod;
  }
}

export abstract class RelayerV2BaseGetResponseError extends RelayerV2BaseResponseError {
  constructor(params: RelayerV2BaseResponseErrorParams) {
    super('GET', params);
  }
}

export abstract class RelayerV2BasePostResponseError extends RelayerV2BaseResponseError {
  constructor(params: RelayerV2BaseResponseErrorParams) {
    super('POST', params);
  }
}
