import { RelayerOperation } from '../../../relayer/fetchRelayer';
import {
  RelayerV2RequestBaseError,
  RelayerV2RequestBaseErrorParams,
} from './RelayerV2RequestError';
import { RelayerBaseError } from '../../../errors/RelayerBaseError';
import { ensureError } from '../../../errors/utils';
import { Prettify } from '../../../utils/types';

export type RelayerV2FetchErrorType = RelayerV2FetchError & {
  name: 'RelayerV2FetchError';
};

export type RelayerV2FetchErrorParams = Prettify<
  Omit<RelayerV2RequestBaseErrorParams, 'name'> & {
    status?: number;
    state?: string;
  }
>;

export class RelayerV2FetchError extends RelayerV2RequestBaseError {
  private _fetchMethod: 'POST' | 'GET';

  constructor(
    fetchMethod: 'POST' | 'GET',
    params: {
      url: string;
      jobId?: string;
      operation: RelayerOperation;
      status?: number;
      cause?: RelayerBaseError | Error | unknown;
      message?: string;
    },
  ) {
    super({
      ...params,
      name: 'RelayerV2FetchError',
      message: params.message ?? 'fetch error',
      cause: ensureError(params.cause),
    });
    this._fetchMethod = fetchMethod;
  }

  public get fetchMethod(): 'GET' | 'POST' {
    return this._fetchMethod;
  }

  public get isAbort(): boolean {
    // AbortError is not an instance of Error!
    return this.cause ? (this.cause as any).name === 'AbortError' : false;
  }
}
