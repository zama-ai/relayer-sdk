import { RelayerOperation } from '../../../relayer/fetchRelayer';
import {
  RelayerBaseError,
  RelayerBaseErrorParams,
} from '../../../errors/RelayerBaseError';
import { Prettify } from '../../../utils/types';

export type RelayerV2RequestErrorType = RelayerV2RequestError & {
  name: 'RelayerV2RequestError';
};

export type RelayerV2RequestErrorParams = Prettify<
  RelayerBaseErrorParams & {
    url: string;
    operation: RelayerOperation;
    fetchMethod: 'POST' | 'GET';
    jobId?: string | undefined;
  }
>;

export abstract class RelayerV2RequestError extends RelayerBaseError {
  private _fetchMethod: 'POST' | 'GET';
  private _url: string;
  private _operation: RelayerOperation;
  private _jobId?: string | undefined;

  constructor(params: RelayerV2RequestErrorParams) {
    super(params);
    this._url = params.url;
    this._operation = params.operation;
    this._fetchMethod = params.fetchMethod;
    this._jobId = params.jobId;
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

  public get fetchMethod(): 'POST' | 'GET' {
    return this._fetchMethod;
  }
}
