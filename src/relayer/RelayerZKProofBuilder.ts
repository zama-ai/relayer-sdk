import type { BytesHex, ChecksummedAddress } from '@base/types/primitives';
import type {
  TFHEPkeParams,
  TFHEZKProofBuilder,
} from '@sdk/lowlevel/public-api';
import type { ZKProof } from '@sdk/types/public-api';
import type { InputProof } from '@sdk/coprocessor/public-api';
import type { EncryptionBits } from '@fhevm-base/types/public-api';
import type { RelayerClient } from './types/private-api';
import type { RelayerInputProofOptions } from './types/public-api';
import { createTFHEZKProofBuilder } from '@sdk/lowlevel/TFHEZKProofBuilder';
import { requestCiphertextWithZKProofVerification } from './encrypt';
import { addressToChecksummedAddress, assertIsAddress } from '@base/address';

////////////////////////////////////////////////////////////////////////////////
// RelayerZKProofBuilder
////////////////////////////////////////////////////////////////////////////////

export interface RelayerZKProofBuilder {
  addBool(value: boolean | number | bigint): this;
  add8(value: number | bigint): this;
  add16(value: number | bigint): this;
  add32(value: number | bigint): this;
  add64(value: number | bigint): this;
  add128(value: number | bigint): this;
  add256(value: number | bigint): this;
  addAddress(value: string): this;
  getBits(): readonly EncryptionBits[];
  generateZKProof(): ZKProof;
  encrypt(options?: RelayerInputProofOptions): Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
}

class RelayerZKProofBuilderImpl implements RelayerZKProofBuilder {
  //////////////////////////////////////////////////////////////////////////////
  // Instance Properties
  //////////////////////////////////////////////////////////////////////////////

  readonly #relayerClient: RelayerClient;
  readonly #builder: TFHEZKProofBuilder;
  readonly #contractAddress: ChecksummedAddress;
  readonly #userAddress: ChecksummedAddress;

  //////////////////////////////////////////////////////////////////////////////
  // Constructor
  //////////////////////////////////////////////////////////////////////////////

  constructor(
    relayerClient: RelayerClient,
    params: {
      readonly contractAddress: ChecksummedAddress;
      readonly userAddress: ChecksummedAddress;
      readonly pkeParams: TFHEPkeParams;
      readonly options?: RelayerInputProofOptions | undefined;
    },
  ) {
    this.#relayerClient = relayerClient;
    this.#contractAddress = params.contractAddress;
    this.#userAddress = params.userAddress;
    this.#builder = createTFHEZKProofBuilder({
      pkeParams: params.pkeParams,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Add Methods
  //////////////////////////////////////////////////////////////////////////////

  public addBool(value: boolean | number | bigint): this {
    this.#builder.addBool(value);
    return this;
  }

  public add8(value: number | bigint): this {
    this.#builder.addUint8(value);
    return this;
  }

  public add16(value: number | bigint): this {
    this.#builder.addUint16(value);
    return this;
  }

  public add32(value: number | bigint): this {
    this.#builder.addUint32(value);
    return this;
  }

  public add64(value: number | bigint): this {
    this.#builder.addUint64(value);
    return this;
  }

  public add128(value: number | bigint): this {
    this.#builder.addUint128(value);
    return this;
  }

  public add256(value: number | bigint): this {
    this.#builder.addUint256(value);
    return this;
  }

  public addAddress(value: string): this {
    this.#builder.addAddress(value);
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////
  // EncryptionBits
  //////////////////////////////////////////////////////////////////////////////

  public getBits(): readonly EncryptionBits[] {
    return this.#builder.getBits();
  }

  //////////////////////////////////////////////////////////////////////////////
  // ZKProof Generation
  //////////////////////////////////////////////////////////////////////////////

  public generateZKProof(): ZKProof {
    return this.#builder.generateZKProof({
      contractAddress: this.#contractAddress,
      userAddress: this.#userAddress,
      chainId: this.#relayerClient.fhevmConfig.hostChainConfig.chainId,
      aclContractAddress:
        this.#relayerClient.fhevmConfig.hostChainConfig.aclContractAddress,
    });
  }

  //////////////////////////////////////////////////////////////////////////////

  public async encrypt(options?: RelayerInputProofOptions): Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }> {
    const extraData: BytesHex = '0x00' as BytesHex;

    if (this.getBits().length === 0) {
      throw new Error(`Encrypted input must contain at least one value`);
    }

    const zkProof = this.generateZKProof();

    const inputProof: InputProof =
      await requestCiphertextWithZKProofVerification(this.#relayerClient, {
        zkProof,
        extraData,
        options,
      });

    return inputProof.toBytes();
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createRelayerZKProofBuilder(
  relayerClient: RelayerClient,
  args: {
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly pkeParams: TFHEPkeParams;
    readonly options?: RelayerInputProofOptions | undefined;
  },
): RelayerZKProofBuilder {
  const { contractAddress, userAddress } = args;
  assertIsAddress(contractAddress, {});
  assertIsAddress(userAddress, {});

  return new RelayerZKProofBuilderImpl(relayerClient, {
    contractAddress: addressToChecksummedAddress(contractAddress),
    userAddress: addressToChecksummedAddress(userAddress),
    pkeParams: args.pkeParams,
    options: args.options,
  });
}
