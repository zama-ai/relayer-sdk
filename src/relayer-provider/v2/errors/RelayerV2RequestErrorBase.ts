import type { RelayerErrorBaseParams } from '../../../errors/RelayerErrorBase';
import type { RelayerOperation } from '../../types/public-api';
import type { Prettify } from '@base/types/utils';
import { RelayerErrorBase } from '../../../errors/RelayerErrorBase';

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
    jobId?: string | undefined;
  }
>;

export abstract class RelayerV2RequestErrorBase extends RelayerErrorBase {
  private readonly _url: string;
  private readonly _operation: RelayerOperation;
  private readonly _jobId?: string | undefined;

  constructor(params: RelayerV2RequestErrorBaseParams) {
    const metaMessages = [
      ...(params.metaMessages ?? []),
      `url: ${params.url}`,
      `operation: ${params.operation}`,
      ...(params.jobId !== undefined ? [`jobId: ${params.jobId}`] : []),
    ];

    super({
      ...params,
      name: params.name ?? 'RelayerV2RequestErrorBase',
      metaMessages,
    });

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
