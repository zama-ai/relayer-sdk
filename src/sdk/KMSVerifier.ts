import type { ChecksummedAddress } from '@base/types/primitives';
import type { Provider as EthersProviderType } from 'ethers';
import type { KmsEIP712DomainType } from './kms/types';
import type { IKMSVerifier } from './types';
import { Contract } from 'ethers';
import { isUint8 } from '@base/uint';
import { assertIsChecksummedAddressArray } from '@base/address';
import { assertKmsEIP712DomainType } from './kms/guards';
import { executeWithBatching } from '@base/promise';

export class KMSVerifier {
  static readonly #abi = [
    'function getKmsSigners() view returns (address[])',
    'function getThreshold() view returns (uint256)',
    'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
  ] as const;

  static {
    Object.freeze(KMSVerifier.#abi);
  }

  readonly #address: ChecksummedAddress;
  readonly #eip712Domain: KmsEIP712DomainType;
  readonly #kmsSigners: ChecksummedAddress[];
  readonly #threshold: number;

  private constructor(params: {
    address: ChecksummedAddress;
    eip712Domain: KmsEIP712DomainType;
    kmsSigners: ChecksummedAddress[];
    threshold: number;
  }) {
    this.#address = params.address;
    this.#eip712Domain = { ...params.eip712Domain };
    this.#kmsSigners = [...params.kmsSigners];
    this.#threshold = params.threshold;

    Object.freeze(this.#eip712Domain);
    Object.freeze(this.#kmsSigners);
  }

  public get address(): ChecksummedAddress {
    return this.#address;
  }

  public get eip712Domain(): KmsEIP712DomainType {
    return this.#eip712Domain;
  }

  public get gatewayChainId(): bigint {
    return this.#eip712Domain.chainId;
  }

  public get kmsSigners(): ChecksummedAddress[] {
    return this.#kmsSigners;
  }

  public get threshold(): number {
    return this.#threshold;
  }

  public static async loadFromChain(params: {
    kmsContractAddress: ChecksummedAddress;
    provider: EthersProviderType;
    batchRpcCalls?: boolean;
  }): Promise<KMSVerifier> {
    const contract = new Contract(
      params.kmsContractAddress,
      KMSVerifier.#abi,
      params.provider,
    ) as unknown as IKMSVerifier;

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
      () => contract.getKmsSigners(),
    ];

    const res = await executeWithBatching(rpcCalls, params.batchRpcCalls);

    const eip712DomainArray = res[0] as unknown[];
    const threshold = res[1];
    const kmsSigners = res[2] as unknown[];

    if (!isUint8(threshold)) {
      throw new Error(`Invalid KMSVerifier kms signers threshold.`);
    }

    try {
      assertIsChecksummedAddressArray(kmsSigners);
    } catch (e) {
      throw new Error(`Invalid KMSVerifier kms signers addresses.`, {
        cause: e,
      });
    }

    const eip712Domain = {
      name: eip712DomainArray[1],
      version: eip712DomainArray[2],
      chainId: eip712DomainArray[3],
      verifyingContract: eip712DomainArray[4],
    };

    try {
      assertKmsEIP712DomainType(eip712Domain, 'KMSVerifier.eip712Domain()');
    } catch (e) {
      throw new Error(`Invalid KMSVerifier EIP-712 domain.`, { cause: e });
    }

    const kmsVerifier = new KMSVerifier({
      address: params.kmsContractAddress,
      eip712Domain: eip712Domain,
      threshold: Number(threshold),
      kmsSigners: kmsSigners,
    });

    return kmsVerifier;
  }
}
