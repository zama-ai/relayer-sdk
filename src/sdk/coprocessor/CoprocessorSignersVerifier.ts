import { RelayerDuplicateCoprocessorSignerError } from '../../errors/RelayerDuplicateCoprocessorSignerError';
import {
  assertIsChecksummedAddress,
  assertIsChecksummedAddressArray,
} from '../../utils/address';
import { RelayerUnknownCoprocessorSignerError } from '../../errors/RelayerUnknownCoprocessorSignerError';
import {
  CoprocessorEIP712,
  CoprocessorEIP712MessageType,
  CoprocessorEIP712Params,
} from './CoprocessorEIP712';
import type { Prettify } from '../../utils/types';
import { RelayerThresholdCoprocessorSignerError } from '../../errors/RelayerThresholdCoprocessorSignerError';
import { InputProof } from './InputProof';
import type { ethers as EthersT } from 'ethers';
import { Contract } from 'ethers';
import { Bytes65Hex, ChecksummedAddress } from '../../types/primitives';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorSignersVerifier
////////////////////////////////////////////////////////////////////////////////

export type CoprocessorSignersVerifierParams = Prettify<
  {
    coprocessorSignersAddresses: ChecksummedAddress[];
    threshold: number;
  } & CoprocessorEIP712Params
>;

export class CoprocessorSignersVerifier {
  private readonly _coprocessorSignersAddresses: ChecksummedAddress[];
  private readonly _coprocessorSignersAddressesSet: Set<string>;
  private readonly _threshold: number;
  private readonly _eip712: CoprocessorEIP712;

  private constructor(params: CoprocessorSignersVerifierParams) {
    assertIsChecksummedAddressArray(params.coprocessorSignersAddresses);
    this._coprocessorSignersAddresses = [...params.coprocessorSignersAddresses];
    this._threshold = params.threshold;
    Object.freeze(this._coprocessorSignersAddresses);
    this._coprocessorSignersAddressesSet = new Set(
      this._coprocessorSignersAddresses.map((addr) => addr.toLowerCase()),
    );
    this._eip712 = new CoprocessorEIP712(params);
  }

  public static fromAddresses(params: CoprocessorSignersVerifierParams) {
    return new CoprocessorSignersVerifier(params);
  }

  public static async fromProvider(
    params: Prettify<
      {
        inputVerifierContractAddress: ChecksummedAddress;
        provider: EthersT.Provider;
      } & CoprocessorEIP712Params
    >,
  ) {
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
      inputContract.getCoprocessorSigners(),
      inputContract.getThreshold(),
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
    return this._coprocessorSignersAddresses.length;
  }

  public get addresses(): ChecksummedAddress[] {
    return this._coprocessorSignersAddresses;
  }

  public get threshold(): number {
    return this._threshold;
  }

  private _isThresholdReached(addresses: string[]): boolean {
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
      if (!this._coprocessorSignersAddressesSet.has(address.toLowerCase())) {
        throw new RelayerUnknownCoprocessorSignerError({
          unknownAddress: address,
        });
      }
    }

    return addresses.length >= this._threshold;
  }

  public verify(
    signatures: Bytes65Hex[],
    message: CoprocessorEIP712MessageType,
  ) {
    // 1. Verify signatures
    const recoveredAddresses = this._eip712.verify({ signatures, message });

    // 2. Verify signature theshold is reached
    if (!this._isThresholdReached(recoveredAddresses)) {
      throw new RelayerThresholdCoprocessorSignerError();
    }
  }

  public computeInputProof(
    signatures: Bytes65Hex[],
    message: CoprocessorEIP712MessageType,
  ): InputProof {
    // Throws exception if message properties are invalid
    this.verify(signatures, message);

    return InputProof.from({
      signatures,
      handles: message.ctHandles,
      extraData: message.extraData,
    });
  }
}
