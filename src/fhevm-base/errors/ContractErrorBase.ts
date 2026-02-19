import type { Prettify } from '@base/types/utils';
import type { ChecksummedAddress } from '@base/types/primitives';
import type { FhevmErrorBaseParams } from './FhevmErrorBase';
import { FhevmErrorBase } from './FhevmErrorBase';

////////////////////////////////////////////////////////////////////////////////
// ContractErrorBase
////////////////////////////////////////////////////////////////////////////////

export type ContractErrorBaseType = ContractErrorBase & {
  name: 'ContractErrorBase';
};

export type ContractErrorBaseParams = Prettify<
  FhevmErrorBaseParams & {
    contractAddress: ChecksummedAddress;
    contractName: string;
  }
>;

export abstract class ContractErrorBase extends FhevmErrorBase {
  readonly #contractAddress: ChecksummedAddress;
  readonly #contractName: string;

  constructor(params: ContractErrorBaseParams) {
    super(params);
    this.#contractAddress = params.contractAddress;
    this.#contractName = params.contractName;
  }

  public get contractAddress(): ChecksummedAddress {
    return this.#contractAddress;
  }

  public get contractName(): string {
    return this.#contractName;
  }
}
