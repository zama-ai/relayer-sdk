import type { RelayerOperation } from '../types/relayer';
import { RelayerErrorBase, RelayerErrorBaseParams } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////

export type RelayerProviderErrorType = RelayerProviderError & {
  name: 'RelayerProviderError';
};

type RelayerProviderErrorParams = RelayerErrorBaseParams & {
  operation?: RelayerOperation;
};

export class RelayerProviderError extends RelayerErrorBase {
  private _operation?: RelayerOperation;

  constructor(params: RelayerProviderErrorParams) {
    super({ ...params, name: 'RelayerProviderError' });
    this._operation = params.operation;
  }

  public get operation(): RelayerOperation | undefined {
    return this._operation;
  }
}
