import type { ChecksummedAddress } from '../types/primitives';
import type { Provider as EthersProviderType } from 'ethers';
import type { CoprocessorEIP712DomainType } from './coprocessor/types';
import { Contract } from 'ethers';
import { isUint8 } from '../utils/uint';
import { assertIsChecksummedAddressArray } from '../utils/address';
import { assertCoprocessorEIP712DomainType } from './coprocessor/guards';

export class InputVerifier {
  static readonly #abi = [
    'function getCoprocessorSigners() view returns (address[])',
    'function getThreshold() view returns (uint256)',
    'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
  ] as const;

  static {
    Object.freeze(InputVerifier.#abi);
  }

  readonly #address: ChecksummedAddress;
  readonly #eip712Domain: CoprocessorEIP712DomainType;
  readonly #coprocessorSigners: ChecksummedAddress[];
  readonly #threshold: number;

  private constructor(params: {
    address: ChecksummedAddress;
    eip712Domain: CoprocessorEIP712DomainType;
    coprocessorSigners: ChecksummedAddress[];
    threshold: number;
  }) {
    this.#address = params.address;
    this.#eip712Domain = { ...params.eip712Domain };
    this.#coprocessorSigners = [...params.coprocessorSigners];
    this.#threshold = params.threshold;

    Object.freeze(this.#eip712Domain);
    Object.freeze(this.#coprocessorSigners);
  }

  public get address(): ChecksummedAddress {
    return this.#address;
  }

  public get eip712Domain(): CoprocessorEIP712DomainType {
    return this.#eip712Domain;
  }

  public get gatewayChainId(): number {
    return this.#eip712Domain.chainId;
  }

  public get coprocessorSigners(): ChecksummedAddress[] {
    return this.#coprocessorSigners;
  }

  public get threshold(): number {
    return this.#threshold;
  }

  public static async loadFromChain(params: {
    inputVerifierContractAddress: ChecksummedAddress;
    provider: EthersProviderType;
  }): Promise<InputVerifier> {
    const contract = new Contract(
      params.inputVerifierContractAddress,
      InputVerifier.#abi,
      params.provider,
    );

    const res = await Promise.all([
      contract.eip712Domain(),
      contract.getThreshold(),
      contract.getCoprocessorSigners(),
    ]);

    const eip712Domain = res[0];
    const threshold = res[1];
    const coprocessorSigners = res[2];

    if (!isUint8(threshold)) {
      throw new Error(`Invalid InputVerifier Coprocessor signers threshold.`);
    }

    try {
      assertIsChecksummedAddressArray(coprocessorSigners);
    } catch (e) {
      throw new Error(`Invalid InputVerifier Coprocessor signers addresses.`, {
        cause: e,
      });
    }

    const _eip712Domain = {
      name: eip712Domain[1],
      version: eip712Domain[2],
      chainId: eip712Domain[3],
      verifyingContract: eip712Domain[4],
    };

    try {
      assertCoprocessorEIP712DomainType(
        _eip712Domain,
        'InputVerifier.eip712Domain()',
      );
    } catch (e) {
      throw new Error(`Invalid InputVerifier EIP-712 domain.`, { cause: e });
    }

    const inputVerifier = new InputVerifier({
      address: params.inputVerifierContractAddress,
      eip712Domain: _eip712Domain,
      threshold: Number(threshold),
      coprocessorSigners,
    });

    return inputVerifier;
  }
}
