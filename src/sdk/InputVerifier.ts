import type { ChecksummedAddress } from '@base/types/primitives';
import type { Provider as EthersProviderType } from 'ethers';
import type { CoprocessorEIP712DomainType } from './coprocessor/types';
import type { IInputVerifier } from './types';
import { Contract } from 'ethers';
import { isUint8, isUintBigInt } from '@base/uint';
import { assertIsChecksummedAddressArray } from '@base/address';
import { assertCoprocessorEIP712DomainType } from './coprocessor/guards';
import { executeWithBatching } from '@base/promise';

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

  public get gatewayChainId(): bigint {
    return this.#eip712Domain.chainId;
  }

  public get coprocessorSigners(): ChecksummedAddress[] {
    return this.#coprocessorSigners;
  }

  public get threshold(): number {
    return this.#threshold;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#eip712Domain.verifyingContract;
  }

  public static async loadFromChain(params: {
    inputVerifierContractAddress: ChecksummedAddress;
    provider: EthersProviderType;
    batchRpcCalls?: boolean;
  }): Promise<InputVerifier> {
    const contract = new Contract(
      params.inputVerifierContractAddress,
      InputVerifier.#abi,
      params.provider,
    ) as unknown as IInputVerifier;

    // To be removed
    if (params.batchRpcCalls === true) {
      throw new Error(`Batch RPC Calls not supported!`);
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    // Important remark:
    // =================
    // Do NOTE USE `Promise.all` here!
    // You may get a server response 500 Internal Server Error
    // "Batch of more than 3 requests are not allowed on free tier, to use this
    // feature register paid account at drpc.org"
    //
    ////////////////////////////////////////////////////////////////////////////

    const rpcCalls = [
      () => contract.eip712Domain(),
      () => contract.getThreshold(),
      () => contract.getCoprocessorSigners(),
    ];

    const res = await executeWithBatching(rpcCalls, params.batchRpcCalls);

    const eip712DomainArray = res[0] as unknown[];
    const threshold = res[1];
    const coprocessorSigners = res[2] as unknown[];

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

    const unknownChainId = eip712DomainArray[3];
    if (!isUintBigInt(unknownChainId)) {
      throw new Error('Invalid InputVerifier EIP-712 domain chainId.');
    }

    const eip712Domain = {
      name: eip712DomainArray[1],
      version: eip712DomainArray[2],
      chainId: unknownChainId,
      verifyingContract: eip712DomainArray[4],
    };

    try {
      assertCoprocessorEIP712DomainType(
        eip712Domain,
        'InputVerifier.eip712Domain()',
      );
    } catch (e) {
      throw new Error(`Invalid InputVerifier EIP-712 domain.`, { cause: e });
    }

    const inputVerifier = new InputVerifier({
      address: params.inputVerifierContractAddress,
      eip712Domain: eip712Domain,
      threshold: Number(threshold),
      coprocessorSigners,
    });

    return inputVerifier;
  }
}
