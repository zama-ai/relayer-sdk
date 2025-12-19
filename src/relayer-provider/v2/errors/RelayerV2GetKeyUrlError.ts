import { RelayerOperation } from '../../../types/relayer';
import {
  RelayerErrorBase,
  RelayerErrorBaseParams,
} from '../../../errors/RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////

type RelayerV2ProviderErrorParams = RelayerErrorBaseParams & {
  operation: RelayerOperation;
};

export class RelayerV2ProviderError extends RelayerErrorBase {
  private _operation: RelayerOperation;

  constructor(params: RelayerV2ProviderErrorParams) {
    super(params);
    this._operation = params.operation;
  }

  public get operation(): RelayerOperation {
    return this._operation;
  }
}

////////////////////////////////////////////////////////////////////////////////

export type RelayerV2GetKeyUrlErrorType = RelayerV2GetKeyUrlError & {
  name: 'RelayerV2GetKeyUrlError';
};

export class RelayerV2GetKeyUrlError extends RelayerV2ProviderError {
  constructor({ cause }: { cause: RelayerErrorBase | Error }) {
    super({
      message: `Invalid relayer response.`,
      name: 'RelayerV2GetKeyUrlError',
      operation: 'KEY_URL',
      cause,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////

export type RelayerV2GetKeyUrlInvalidResponseErrorType =
  RelayerV2GetKeyUrlInvalidResponseError & {
    name: 'RelayerV2GetKeyUrlInvalidResponseError';
  };

export class RelayerV2GetKeyUrlInvalidResponseError extends RelayerV2GetKeyUrlError {
  constructor({ cause }: { cause: RelayerErrorBase | Error }) {
    super({ cause });
  }
}
