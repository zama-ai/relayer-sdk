import type { CoprocessorEIP712MessageType, ICoprocessorEIP712 } from './types';
import type {
  Bytes32,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { IInputVerifier } from '../types';
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
import { executeWithBatching } from '@base/promise';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorSignersVerifier
////////////////////////////////////////////////////////////////////////////////

export interface ICoprocessorSignersVerifier extends ICoprocessorEIP712 {
  readonly coprocessorSigners: readonly ChecksummedAddress[];
  readonly threshold: number;
}

export class CoprocessorSignersVerifier implements ICoprocessorSignersVerifier {
  readonly #coprocessorSigners: readonly ChecksummedAddress[];
  readonly #coprocessorSignersSet: Set<string>;
  readonly #threshold: number;
  readonly #eip712: CoprocessorEIP712;

  private constructor(params: ICoprocessorSignersVerifier) {
    assertIsChecksummedAddressArray(params.coprocessorSigners);
    this.#coprocessorSigners = [...params.coprocessorSigners];
    this.#threshold = params.threshold;
    Object.freeze(this.#coprocessorSigners);
    this.#coprocessorSignersSet = new Set(
      this.#coprocessorSigners.map((addr) => addr.toLowerCase()),
    );
    this.#eip712 = new CoprocessorEIP712(params);
  }

  public static fromAddresses(
    params: ICoprocessorSignersVerifier,
  ): CoprocessorSignersVerifier {
    return new CoprocessorSignersVerifier(params);
  }

  public static async fromProvider(
    params: Prettify<
      {
        readonly inputVerifierContractAddress: ChecksummedAddress;
        readonly provider: EthersT.Provider;
        readonly batchRpcCalls?: boolean;
      } & ICoprocessorEIP712
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
    ) as unknown as IInputVerifier;

    const res = await executeWithBatching(
      [
        () => inputContract.getCoprocessorSigners(),
        () => inputContract.getThreshold(),
      ],
      params.batchRpcCalls,
    );

    const coprocessorSignersAddresses = res[0] as ChecksummedAddress[];
    const threshold = res[1] as number;

    return new CoprocessorSignersVerifier({
      ...params,
      coprocessorSigners: coprocessorSignersAddresses,
      threshold,
    });
  }

  public get count(): number {
    return this.#coprocessorSigners.length;
  }

  public get coprocessorSigners(): readonly ChecksummedAddress[] {
    return this.#coprocessorSigners;
  }

  public get threshold(): number {
    return this.#threshold;
  }

  public get gatewayChainId(): bigint {
    return this.#eip712.gatewayChainId;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#eip712.verifyingContractAddressInputVerification;
  }

  private _isThresholdReached(recoveredAddresses: readonly string[]): boolean {
    const addressMap = new Set<string>();
    recoveredAddresses.forEach((address) => {
      if (addressMap.has(address.toLowerCase())) {
        throw new RelayerDuplicateCoprocessorSignerError({
          duplicateAddress: address,
        });
      }
      addressMap.add(address);
    });

    for (const address of recoveredAddresses) {
      if (!this.#coprocessorSignersSet.has(address.toLowerCase())) {
        throw new RelayerUnknownCoprocessorSignerError({
          unknownAddress: address,
        });
      }
    }

    return recoveredAddresses.length >= this.#threshold;
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
      contractChainId: params.zkProof.chainId,
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
