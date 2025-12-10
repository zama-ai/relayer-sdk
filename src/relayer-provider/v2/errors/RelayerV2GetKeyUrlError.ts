import { RelayerOperation } from '../../../relayer/fetchRelayer';
import {
  RelayerBaseError,
  RelayerBaseErrorParams,
} from '../../../errors/RelayerBaseError';

////////////////////////////////////////////////////////////////////////////////

type RelayerV2ProviderErrorParams = RelayerBaseErrorParams & {
  operation: RelayerOperation;
};

export class RelayerV2ProviderError extends RelayerBaseError {
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
  constructor({ cause }: { cause: RelayerBaseError | Error }) {
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
  constructor({ cause }: { cause: RelayerBaseError | Error }) {
    super({ cause });
  }
}
