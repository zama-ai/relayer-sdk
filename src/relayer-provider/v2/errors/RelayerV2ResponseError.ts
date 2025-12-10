import { RelayerOperation } from '../../../relayer/fetchRelayer';
import {
  RelayerBaseError,
  RelayerBaseErrorParams,
} from '../../../errors/RelayerBaseError';
import { Prettify } from '../../../utils/types';

export type RelayerV2ResponseErrorType = RelayerV2ResponseError & {
  name: 'RelayerV2ResponseError';
};

export type RelayerV2ResponseErrorParams = Prettify<
  RelayerBaseErrorParams & {
    url: string;
    operation: RelayerOperation;
    status: number;
    fetchMethod: 'POST' | 'GET';
  }
>;

export abstract class RelayerV2ResponseError extends RelayerBaseError {
  private _fetchMethod: 'POST' | 'GET';
  private _status: number;
  private _url: string;
  private _operation: RelayerOperation;

  constructor(params: RelayerV2ResponseErrorParams) {
    super(params);
    this._status = params.status;
    this._url = params.url;
    this._operation = params.operation;
    this._fetchMethod = params.fetchMethod;
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

export type RelayerV2GetResponseErrorParams = Prettify<
  Omit<RelayerBaseErrorParams, 'fetchMethod'> & {
    url: string;
    operation: RelayerOperation;
    status: number;
    jobId: string;
  } & { fetchMethod: 'GET' }
>;

export abstract class RelayerV2GetResponseError extends RelayerV2ResponseError {
  constructor(params: RelayerV2ResponseErrorParams) {
    super(params);
  }
}
