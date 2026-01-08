import type { RelayerOperation } from '@relayer-provider/types/public-api';
import type { RelayerErrorBaseParams } from './RelayerErrorBase';
import { RelayerErrorBase } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////

export type RelayerProviderErrorType = RelayerProviderError & {
  name: 'RelayerProviderError';
};

export type RelayerProviderErrorParams = RelayerErrorBaseParams & {
  operation?: RelayerOperation | undefined;
};

export class RelayerProviderError extends RelayerErrorBase {
  private _operation?: RelayerOperation | undefined;

  constructor(params: RelayerProviderErrorParams) {
    super({ ...params, name: 'RelayerProviderError' });
    this._operation = params.operation;
  }

  public get operation(): RelayerOperation | undefined {
    return this._operation;
  }
}
