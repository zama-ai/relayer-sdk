import type { RelayerV2InputProofOptions } from './v2/types/types';
import type {
  Bytes,
  Bytes32,
  ChecksummedAddress,
  EncryptionBits,
  ZKProofType,
} from '../types/primitives';
import { TFHEZKProofBuilder } from '../sdk/lowlevel/TFHEZKProofBuilder';
import { TFHEPkeParams } from '../sdk/lowlevel/TFHEPkeParams';
import { FhevmHostChainConfig } from '../sdk/fhevmHostChain';

export class RelayerZKProofBuilder {
  #builder: TFHEZKProofBuilder;
  #config: FhevmHostChainConfig;
  #contractAddress: ChecksummedAddress;
  #userAddress: ChecksummedAddress;

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
  public getBits(): EncryptionBits[] {
    return this.#builder.getBits();
  }
  public generateZKProof(): ZKProofType {
    return this.#builder.generateZKProof({
      contractAddress: this.#contractAddress,
      userAddress: this.#userAddress,
      chainId: this.#config.chainId,
      aclContractAddress: this.#config.aclContractAddress,
    });
  }
  public async encrypt(
    options?: RelayerV2InputProofOptions,
  ): Promise<{ handles: Bytes32[]; inputProof: Bytes }> {
    return {
      handles: [],
      inputProof: new Uint8Array(),
    };
  }
}
