import type { RelayerOperation } from '../../../types/relayer';
import {
  RelayerErrorBase,
  RelayerErrorBaseParams,
} from '../../../errors/RelayerErrorBase';
import { Prettify } from '../../../utils/types';

////////////////////////////////////////////////////////////////////////////////
// RelayerV2RequestErrorBase
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2RequestErrorBaseType = RelayerV2RequestErrorBase & {
  name: 'RelayerV2RequestErrorBase';
};

export type RelayerV2RequestErrorBaseParams = Prettify<
  RelayerErrorBaseParams & {
    url: string;
    operation: RelayerOperation;
    jobId?: string;
  }
>;

export abstract class RelayerV2RequestErrorBase extends RelayerErrorBase {
  private _url: string;
  private _operation: RelayerOperation;
  private _jobId?: string;

  constructor(params: RelayerV2RequestErrorBaseParams) {
    super({ ...params, name: params.name ?? 'RelayerV2RequestErrorBase' });
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
