import { Prettify } from '../utils/types';
import { ChecksummedAddress } from '../types/primitives';
import { RelayerErrorBase, RelayerErrorBaseParams } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////
// ContractErrorBase
////////////////////////////////////////////////////////////////////////////////

export type ContractErrorBaseType = ContractErrorBase & {
  name: 'ContractErrorBase';
};

export type ContractErrorBaseParams = Prettify<
  RelayerErrorBaseParams & {
    contractAddress: ChecksummedAddress;
    contractName: string;
  }
>;

export abstract class ContractErrorBase extends RelayerErrorBase {
  private readonly _contractAddress: ChecksummedAddress;
  private readonly _contractName: string;

  constructor(params: ContractErrorBaseParams) {
    super({
      ...params,
      name: params.name ?? 'ContractErrorBase',
    });
    this._contractAddress = params.contractAddress;
    this._contractName = params.contractName;
  }

  public get contractAddress() {
    return this._contractAddress;
  }

  public get contractName() {
    return this._contractName;
  }
}

////////////////////////////////////////////////////////////////////////////////
// ContractError
////////////////////////////////////////////////////////////////////////////////

export type ContractErrorType = ContractError & {
  name: 'ContractError';
};

export class ContractError extends ContractErrorBase {
  constructor({
    contractAddress,
    contractName,
    message,
  }: {
    contractAddress: ChecksummedAddress;
    contractName: string;
    message: string;
  }) {
    super({
      contractAddress,
      contractName,
      name: 'ContractError',
      message,
    });
  }
}
