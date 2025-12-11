import { RelayerOperation } from '../../../relayer/fetchRelayer';
import {
  RelayerBaseError,
  RelayerBaseErrorParams,
} from '../../../errors/RelayerBaseError';
import { Prettify } from '../../../utils/types';

export type RelayerV2RequestBaseErrorParams = Prettify<
  RelayerBaseErrorParams & {
    url: string;
    operation: RelayerOperation;
    jobId?: string;
  }
>;

export abstract class RelayerV2RequestBaseError extends RelayerBaseError {
  private _url: string;
  private _operation: RelayerOperation;
  private _jobId?: string;

  constructor(params: RelayerV2RequestBaseErrorParams) {
    super(params);
    this._url = params.url;
    this._operation = params.operation;
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
}
