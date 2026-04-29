import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { IKMSVerifier } from '../types/private';
import type { Prettify } from '@base/types/utils';
import type { ethers as EthersT } from 'ethers';
import type {
  IKmsEIP712,
  IKmsSignersVerifier,
  KmsPublicDecryptEIP712MessageType,
} from './public-api';
import type { ClearValueType } from '../../types/relayer';
import type { FhevmHandle } from '@sdk/FhevmHandle';
import { RelayerDuplicateKmsSignerError } from '../../errors/RelayerDuplicateKmsSignerError';
import {
  assertIsChecksummedAddress,
  assertIsChecksummedAddressArray,
} from '@base/address';
import { RelayerUnknownKmsSignerError } from '../../errors/RelayerUnknownKmsSignerError';
import { RelayerThresholdKmsSignerError } from '../../errors/RelayerThresholdKmsSignerError';
import { KmsEIP712 } from './KmsEIP712';
import { Contract } from 'ethers';
import { executeWithBatching } from '@base/promise';
import { PublicDecryptionProof } from './PublicDecryptionProof';

////////////////////////////////////////////////////////////////////////////////
// KmsSignersVerifier
////////////////////////////////////////////////////////////////////////////////

export type OrderedFhevmHandleClearValuePairs = Array<{
  fhevmHandle: FhevmHandle;
  clearValue: ClearValueType;
}>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type OrderedAbiEncodedClearValues = {
  abiTypes: Array<'uint256'>;
  abiValues: Array<string | bigint>;
  abiEncodedClearValues: BytesHex;
};

export class KmsSignersVerifier implements IKmsSignersVerifier {
  readonly #kmsSigners: readonly ChecksummedAddress[];
  readonly #kmsSignersSet: Set<string>;
  readonly #threshold: number;
  readonly #eip712: KmsEIP712;

  private constructor(params: IKmsSignersVerifier) {
    assertIsChecksummedAddressArray(params.kmsSigners);
    this.#kmsSigners = [...params.kmsSigners];
    this.#threshold = params.threshold;
    Object.freeze(this.#kmsSigners);
    this.#kmsSignersSet = new Set(
      this.#kmsSigners.map((addr) => addr.toLowerCase()),
    );
    this.#eip712 = new KmsEIP712(params);
  }

  public static fromAddresses(params: IKmsSignersVerifier): KmsSignersVerifier {
    return new KmsSignersVerifier(params);
  }

  public static async fromProvider(
    params: Prettify<
      {
        readonly kmsVerifierContractAddress: ChecksummedAddress;
        readonly provider: EthersT.Provider;
        readonly batchRpcCalls?: boolean;
      } & IKmsEIP712
    >,
  ): Promise<KmsSignersVerifier> {
    assertIsChecksummedAddress(params.kmsVerifierContractAddress);

    const abiKMSVerifier = [
      'function getKmsSigners() view returns (address[])',
      'function getThreshold() view returns (uint256)',
    ];

    const kmsContract = new Contract(
      params.kmsVerifierContractAddress,
      abiKMSVerifier,
      params.provider,
    ) as unknown as IKMSVerifier;

    const res = await executeWithBatching(
      [() => kmsContract.getKmsSigners(), () => kmsContract.getThreshold()],
      params.batchRpcCalls,
    );

    const kmsSignersAddresses = res[0] as ChecksummedAddress[];
    const threshold = res[1] as number;

    return new KmsSignersVerifier({
      ...params,
      kmsSigners: kmsSignersAddresses,
      threshold,
    });
  }

  public get count(): number {
    return this.#kmsSigners.length;
  }

  public get kmsSigners(): readonly ChecksummedAddress[] {
    return this.#kmsSigners;
  }

  public get threshold(): number {
    return this.#threshold;
  }

  public get chainId(): bigint {
    return this.#eip712.chainId;
  }

  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.#eip712.verifyingContractAddressDecryption;
  }

  private _isThresholdReached(recoveredAddresses: readonly string[]): boolean {
    const addressMap = new Set<string>();
    recoveredAddresses.forEach((address) => {
      if (addressMap.has(address.toLowerCase())) {
        throw new RelayerDuplicateKmsSignerError({
          duplicateAddress: address,
        });
      }
      addressMap.add(address);
    });

    for (const address of recoveredAddresses) {
      if (!this.#kmsSignersSet.has(address.toLowerCase())) {
        throw new RelayerUnknownKmsSignerError({
          unknownAddress: address,
        });
      }
    }

    return recoveredAddresses.length >= this.#threshold;
  }

  public verifyPublicDecrypt(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): void {
    const handlesBytes32Hex: readonly Bytes32Hex[] = params.orderedHandles.map(
      (h) => h.toBytes32Hex(),
    );

    const message: KmsPublicDecryptEIP712MessageType = {
      ctHandles: handlesBytes32Hex,
      decryptedResult: params.orderedDecryptedResult,
      extraData: params.extraData,
    };

    this._verifyPublicDecrypt({ signatures: params.signatures, message });
  }

  public verifyAndComputePublicDecryptionProof(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): PublicDecryptionProof {
    // Throws exception if message properties are invalid
    this.verifyPublicDecrypt(params);

    return PublicDecryptionProof.from(params);
  }

  private _verifyPublicDecrypt(params: {
    signatures: readonly Bytes65Hex[];
    message: KmsPublicDecryptEIP712MessageType;
  }): void {
    // 1. Verify signatures
    const recoveredAddresses = this.#eip712.verifyPublicDecrypt(params);

    // 2. Verify signature theshold is reached
    if (!this._isThresholdReached(recoveredAddresses)) {
      throw new RelayerThresholdKmsSignerError();
    }
  }
}
