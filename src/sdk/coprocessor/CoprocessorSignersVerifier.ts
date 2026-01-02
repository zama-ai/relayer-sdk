import type {
  CoprocessorEIP712MessageType,
  CoprocessorEIP712Params,
} from './types';
import type {
  Bytes32,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { Prettify } from '@base/types/utils';
import type { ethers as EthersT } from 'ethers';
import type { ZKProof } from '../ZKProof';
import type { FhevmHandle } from '../FhevmHandle';
import { RelayerDuplicateCoprocessorSignerError } from '../../errors/RelayerDuplicateCoprocessorSignerError';
import {
  assertIsChecksummedAddress,
  assertIsChecksummedAddressArray,
} from '@base/address';
import { RelayerUnknownCoprocessorSignerError } from '../../errors/RelayerUnknownCoprocessorSignerError';
import { CoprocessorEIP712 } from './CoprocessorEIP712';
import { RelayerThresholdCoprocessorSignerError } from '../../errors/RelayerThresholdCoprocessorSignerError';
import { InputProof } from './InputProof';
import { Contract } from 'ethers';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorSignersVerifier
////////////////////////////////////////////////////////////////////////////////

export type CoprocessorSignersVerifierParams = Prettify<
  {
    readonly coprocessorSignersAddresses: readonly ChecksummedAddress[];
    readonly threshold: number;
  } & CoprocessorEIP712Params
>;

export class CoprocessorSignersVerifier {
  readonly #coprocessorSignersAddresses: readonly ChecksummedAddress[];
  readonly #coprocessorSignersAddressesSet: Set<string>;
  readonly #threshold: number;
  readonly #eip712: CoprocessorEIP712;

  private constructor(params: CoprocessorSignersVerifierParams) {
    assertIsChecksummedAddressArray(params.coprocessorSignersAddresses);
    this.#coprocessorSignersAddresses = [...params.coprocessorSignersAddresses];
    this.#threshold = params.threshold;
    Object.freeze(this.#coprocessorSignersAddresses);
    this.#coprocessorSignersAddressesSet = new Set(
      this.#coprocessorSignersAddresses.map((addr) => addr.toLowerCase()),
    );
    this.#eip712 = new CoprocessorEIP712(params);
  }

  public static fromAddresses(
    params: CoprocessorSignersVerifierParams,
  ): CoprocessorSignersVerifier {
    return new CoprocessorSignersVerifier(params);
  }

  public static async fromProvider(
    params: Prettify<
      {
        readonly inputVerifierContractAddress: ChecksummedAddress;
        readonly provider: EthersT.Provider;
      } & CoprocessorEIP712Params
    >,
  ): Promise<CoprocessorSignersVerifier> {
    assertIsChecksummedAddress(params.inputVerifierContractAddress);

    const abiInputVerifier = [
      'function getCoprocessorSigners() view returns (address[])',
      'function getThreshold() view returns (uint256)',
    ];

    const inputContract = new Contract(
      params.inputVerifierContractAddress,
      abiInputVerifier,
      params.provider,
    );

    const res = await Promise.all([
      inputContract['getCoprocessorSigners'](),
      inputContract['getThreshold'](),
    ]);

    const coprocessorSignersAddresses = res[0];
    const threshold = res[1];

    return new CoprocessorSignersVerifier({
      ...params,
      coprocessorSignersAddresses,
      threshold,
    });
  }

  public get count(): number {
    return this.#coprocessorSignersAddresses.length;
  }

  public get addresses(): readonly ChecksummedAddress[] {
    return this.#coprocessorSignersAddresses;
  }

  public get threshold(): number {
    return this.#threshold;
  }

  public get gatewayChainId(): number {
    return this.#eip712.gatewayChainId;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#eip712.verifyingContractAddressInputVerification;
  }

  private _isThresholdReached(addresses: readonly string[]): boolean {
    const addressMap = new Set<string>();
    addresses.forEach((address) => {
      if (addressMap.has(address.toLowerCase())) {
        throw new RelayerDuplicateCoprocessorSignerError({
          duplicateAddress: address,
        });
      }
      addressMap.add(address);
    });

    for (const address of addresses) {
      if (!this.#coprocessorSignersAddressesSet.has(address.toLowerCase())) {
        throw new RelayerUnknownCoprocessorSignerError({
          unknownAddress: address,
        });
      }
    }

    return addresses.length >= this.#threshold;
  }

  public verifyZKProof(params: {
    readonly handles: readonly FhevmHandle[];
    readonly zkProof: ZKProof;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): void {
    const handlesBytes32: Bytes32[] = params.handles.map((h) => h.toBytes32());

    const message: CoprocessorEIP712MessageType = {
      ctHandles: handlesBytes32,
      userAddress: params.zkProof.userAddress,
      contractAddress: params.zkProof.contractAddress,
      contractChainId: Number(params.zkProof.chainId),
      extraData: params.extraData,
    };

    this._verify({ signatures: params.signatures, message });
  }

  private _verify(params: {
    signatures: readonly Bytes65Hex[];
    message: CoprocessorEIP712MessageType;
  }): void {
    // 1. Verify signatures
    const recoveredAddresses = this.#eip712.verify(params);

    // 2. Verify signature theshold is reached
    if (!this._isThresholdReached(recoveredAddresses)) {
      throw new RelayerThresholdCoprocessorSignerError();
    }
  }

  public verifyAndComputeInputProof(params: {
    readonly handles: readonly FhevmHandle[];
    readonly zkProof: ZKProof;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): InputProof {
    // Throws exception if message properties are invalid
    this.verifyZKProof(params);

    const handlesBytes32: Bytes32[] = params.handles.map((h) => h.toBytes32());

    return InputProof.from({
      signatures: params.signatures,
      handles: handlesBytes32,
      extraData: params.extraData,
    });
  }
}
