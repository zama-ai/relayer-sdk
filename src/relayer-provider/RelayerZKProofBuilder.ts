import type { RelayerInputProofOptionsType } from './types/public-api';
import type {
  ChecksummedAddress,
  EncryptionBits,
  ZKProofType,
} from '@base/types/primitives';
import type { TFHEZKProofBuilder } from '@sdk/lowlevel/TFHEZKProofBuilder';
import type { ZKProof } from '@sdk/ZKProof';
import type { AbstractRelayerProvider } from './AbstractRelayerProvider';
import type { InputProof } from '@sdk/coprocessor/InputProof';
import { CoprocessorSignersVerifier } from '@sdk/coprocessor/CoprocessorSignersVerifier';

////////////////////////////////////////////////////////////////////////////////
// RelayerZKProofBuilder
////////////////////////////////////////////////////////////////////////////////

export class RelayerZKProofBuilder {
  //////////////////////////////////////////////////////////////////////////////
  // Instance Properties
  //////////////////////////////////////////////////////////////////////////////

  readonly #builder: TFHEZKProofBuilder;
  readonly #coprocessorSignersVerifier: CoprocessorSignersVerifier;

  //////////////////////////////////////////////////////////////////////////////
  // Constructor
  //////////////////////////////////////////////////////////////////////////////

  constructor(params: {
    builder: TFHEZKProofBuilder;
    coprocessorSigners: ChecksummedAddress[];
    coprocessorSignerThreshold: number;
    gatewayChainId: bigint;
    verifyingContractAddressInputVerification: ChecksummedAddress;
  }) {
    this.#builder = params.builder;
    this.#coprocessorSignersVerifier =
      CoprocessorSignersVerifier.fromAddresses(params);
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

  public generateZKProof(params: {
    chainId: bigint;
    contractAddress: ChecksummedAddress;
    userAddress: ChecksummedAddress;
    aclContractAddress: ChecksummedAddress;
  }): ZKProofType {
    return this.#builder.generateZKProof(params);
  }

  //////////////////////////////////////////////////////////////////////////////

  public async requestCiphertextWithZKProofVerification({
    zkProof,
    relayerProvider,
    options,
  }: {
    zkProof: ZKProof;
    relayerProvider: AbstractRelayerProvider;
    options?: RelayerInputProofOptionsType | undefined;
  }): Promise<InputProof> {
    const extraData: `0x${string}` = '0x00';

    const relayerResult = await relayerProvider.fetchPostInputProofWithZKProof(
      { zkProof, extraData },
      options,
    );

    return this.#coprocessorSignersVerifier.verifyAndComputeInputProof({
      zkProof,
      handles: relayerResult.fhevmHandles,
      signatures: relayerResult.result.signatures,
      extraData,
    });
  }

  //////////////////////////////////////////////////////////////////////////////

  public async encrypt({
    chainId,
    contractAddress,
    userAddress,
    aclContractAddress,
    relayerProvider,
    options,
  }: {
    chainId: bigint;
    contractAddress: ChecksummedAddress;
    userAddress: ChecksummedAddress;
    aclContractAddress: ChecksummedAddress;
    relayerProvider: AbstractRelayerProvider;
    options?: RelayerInputProofOptionsType | undefined;
  }): Promise<InputProof> {
    const zkProof = this.#builder.generateZKProof({
      contractAddress,
      userAddress,
      chainId,
      aclContractAddress,
    });

    return await this.requestCiphertextWithZKProofVerification({
      zkProof,
      relayerProvider,
      options,
    });
  }
}
