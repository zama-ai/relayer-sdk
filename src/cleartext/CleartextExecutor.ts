import type { Provider as EthersProviderType } from 'ethers';
import type { Bytes32Hex, ChecksummedAddress } from '@base/types/primitives';
import { Contract } from 'ethers';
import { isChecksummedAddress } from '@base/address';

const EXECUTOR_ABI = [
  'function plaintexts(bytes32 handle) view returns (uint256)',
] as const;

export class CleartextExecutor {
  readonly #contract: Contract;

  constructor(params: {
    executorAddress: ChecksummedAddress;
    provider: EthersProviderType;
  }) {
    if (!isChecksummedAddress(params.executorAddress)) {
      throw new Error('Invalid CleartextFHEVMExecutor address');
    }
    this.#contract = new Contract(
      params.executorAddress,
      EXECUTOR_ABI,
      params.provider,
    );
  }

  async getPlaintext(handle: Bytes32Hex): Promise<bigint> {
    return this.#contract.plaintexts(handle);
  }

  async getPlaintexts(handles: Bytes32Hex[]): Promise<bigint[]> {
    return Promise.all(handles.map((h) => this.getPlaintext(h)));
  }
}
