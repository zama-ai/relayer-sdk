import type { RelayerInputProofOptions } from './types/public-api';
import type {
  Bytes,
  Bytes32,
  ChecksummedAddress,
  EncryptionBits,
  ZKProofType,
} from '@base/types/primitives';
import { TFHEZKProofBuilder } from '@sdk/lowlevel/TFHEZKProofBuilder';
import { TFHEPkeParams } from '@sdk/lowlevel/TFHEPkeParams';
import { FhevmHostChainConfig } from '@sdk/fhevmHostChain';

////////////////////////////////////////////////////////////////////////////////
// RelayerZKProofBuilder
////////////////////////////////////////////////////////////////////////////////

export class RelayerZKProofBuilder {
  //////////////////////////////////////////////////////////////////////////////
  // Instance Properties
  //////////////////////////////////////////////////////////////////////////////

  #builder: TFHEZKProofBuilder;
  #config: FhevmHostChainConfig;
  #contractAddress: ChecksummedAddress;
  #userAddress: ChecksummedAddress;

  //////////////////////////////////////////////////////////////////////////////
  // Constructor
  //////////////////////////////////////////////////////////////////////////////

  constructor(params: {
    pkeParams: TFHEPkeParams;
    config: FhevmHostChainConfig;
    contractAddress: ChecksummedAddress;
    userAddress: ChecksummedAddress;
  }) {
    this.#builder = new TFHEZKProofBuilder({ pkeParams: params.pkeParams });
    this.#config = params.config;
    this.#contractAddress = params.contractAddress;
    this.#userAddress = params.userAddress;
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

  public getBits(): EncryptionBits[] {
    return this.#builder.getBits();
  }

  //////////////////////////////////////////////////////////////////////////////
  // ZKProof Generation
  //////////////////////////////////////////////////////////////////////////////

  public generateZKProof(): ZKProofType {
    return this.#builder.generateZKProof({
      contractAddress: this.#contractAddress,
      userAddress: this.#userAddress,
      chainId: this.#config.chainId,
      aclContractAddress: this.#config.aclContractAddress,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Missing implementations. Planned for alpha.4
  //////////////////////////////////////////////////////////////////////////////

  public async encrypt(
    _options?: RelayerInputProofOptions,
  ): Promise<{ handles: Bytes32[]; inputProof: Bytes }> {
    throw new Error('To be implemented');
  }
}
