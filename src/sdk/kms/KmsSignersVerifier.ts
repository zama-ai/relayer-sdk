import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint32BigInt,
  UintNumber,
} from '@base/types/primitives';
import type {
  KmsEIP712Builder,
  KmsPublicDecryptEIP712Message,
  KmsSignersVerifier,
  PublicDecryptionProof,
} from './public-api';
import type { FhevmHandle } from '@fhevm-base/types/public-api';
import type {
  FhevmChainClient,
  ABILib,
  EIP712Lib,
} from '@fhevm-base-types/public-api';
import { createPublicDecryptionProof } from './PublicDecryptionProof';
import {
  DuplicateSignerError,
  ThresholdSignerError,
  UnknownSignerError,
} from '../errors/SignersError';
import { createKmsEIP712Builder } from './KmsEIP712Builder';
import { assertIsChecksummedAddress } from '@base/address';
import { executeWithBatching } from '@base/promise';
import { assertIsUintNumber, asUint32BigInt } from '@base/uint';

////////////////////////////////////////////////////////////////////////////////
// KmsSignersVerifier
////////////////////////////////////////////////////////////////////////////////

// export type OrderedFhevmHandleClearValuePairs = Array<{
//   fhevmHandle: FhevmHandle;
//   clearValue: ClearValueType;
// }>;

// // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
// export type OrderedAbiEncodedClearValues = {
//   abiTypes: Array<'uint256'>;
//   abiValues: Array<string | bigint>;
//   abiEncodedClearValues: BytesHex;
// };

class KmsSignersVerifierImpl implements KmsSignersVerifier {
  readonly #kmsSigners: readonly ChecksummedAddress[];
  readonly #kmsSignersSet: Set<string>;
  readonly #kmsSignerThreshold: number;
  readonly #eip712Builder: KmsEIP712Builder;
  readonly #eip712Lib: EIP712Lib;
  readonly #abiLib: ABILib;

  constructor(
    libs: {
      readonly eip712Lib: EIP712Lib;
      readonly abiLib: ABILib;
    },
    params: {
      readonly kmsSigners: readonly ChecksummedAddress[];
      readonly kmsSignerThreshold: UintNumber;
      readonly chainId: Uint32BigInt;
      readonly verifyingContractAddressDecryption: ChecksummedAddress;
    },
  ) {
    this.#kmsSigners = [...params.kmsSigners];
    this.#kmsSignerThreshold = params.kmsSignerThreshold;
    Object.freeze(this.#kmsSigners);
    this.#kmsSignersSet = new Set(
      this.#kmsSigners.map((addr) => addr.toLowerCase()),
    );
    this.#eip712Builder = createKmsEIP712Builder(params);
    this.#eip712Lib = libs.eip712Lib;
    this.#abiLib = libs.abiLib;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public get count(): number {
    return this.#kmsSigners.length;
  }

  public get kmsSigners(): readonly ChecksummedAddress[] {
    return this.#kmsSigners;
  }

  public get kmsSignerThreshold(): number {
    return this.#kmsSignerThreshold;
  }

  public get chainId(): Uint32BigInt {
    return this.#eip712Builder.chainId;
  }

  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.#eip712Builder.verifyingContractAddressDecryption;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public async verifyPublicDecrypt(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<void> {
    const handlesBytes32Hex: readonly Bytes32Hex[] = params.orderedHandles.map(
      (h) => h.bytes32Hex,
    );

    const message: KmsPublicDecryptEIP712Message = {
      ctHandles: handlesBytes32Hex,
      decryptedResult: params.orderedDecryptedResult,
      extraData: params.extraData,
    };

    // 1. Verify signatures
    const recoveredAddresses = await this.#eip712Builder.verifyPublicDecrypt({
      signatures: params.signatures,
      message,
      verifier: this.#eip712Lib,
    });

    // 2. Verify signature theshold is reached
    if (!this.#_isThresholdReached(recoveredAddresses)) {
      throw new ThresholdSignerError({
        type: 'kms',
      });
    }
  }

  public async verifyAndComputePublicDecryptionProof(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<PublicDecryptionProof> {
    // Throws exception if message properties are invalid
    await this.verifyPublicDecrypt(params);

    return createPublicDecryptionProof({ abiLib: this.#abiLib }, params);
  }

  #_isThresholdReached(recoveredAddresses: readonly string[]): boolean {
    const addressMap = new Set<string>();
    recoveredAddresses.forEach((address) => {
      if (addressMap.has(address.toLowerCase())) {
        throw new DuplicateSignerError({
          duplicateAddress: address,
          type: 'kms',
        });
      }
      addressMap.add(address);
    });

    for (const address of recoveredAddresses) {
      if (!this.#kmsSignersSet.has(address.toLowerCase())) {
        throw new UnknownSignerError({
          unknownAddress: address,
          type: 'kms',
        });
      }
    }

    return recoveredAddresses.length >= this.#kmsSignerThreshold;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createKmsSignersVerifier(
  libs: {
    readonly eip712Lib: EIP712Lib;
    readonly abiLib: ABILib;
  },
  args: {
    readonly chainId: Uint32BigInt;
    readonly verifyingContractAddressDecryption: ChecksummedAddress;
    readonly kmsSigners: readonly ChecksummedAddress[];
    readonly kmsSignerThreshold: UintNumber;
  },
): KmsSignersVerifier {
  return new KmsSignersVerifierImpl(libs, args);
}

export async function fetchKmsSignersVerifier(
  client: FhevmChainClient,
  args: {
    readonly chainId: bigint;
    readonly verifyingContractAddressDecryption: string;
    readonly kmsVerifierContractAddress: string;
  },
): Promise<KmsSignersVerifier> {
  const { kmsVerifierContractAddress, verifyingContractAddressDecryption } =
    args;
  assertIsChecksummedAddress(kmsVerifierContractAddress, {});
  assertIsChecksummedAddress(verifyingContractAddressDecryption, {});

  const chainId = asUint32BigInt(args.chainId);

  const kmsContract = client.libs.kmsVerifierContractLib;

  const res = await executeWithBatching(
    [
      () =>
        kmsContract.getKmsSigners(
          client.nativeClient,
          kmsVerifierContractAddress,
        ),
      () =>
        kmsContract.getThreshold(
          client.nativeClient,
          kmsVerifierContractAddress,
        ),
    ],
    client.batchRpcCalls,
  );

  const kmsSigners = res[0] as ChecksummedAddress[];
  const kmsSignerThreshold = res[1] as number;

  assertIsUintNumber(kmsSignerThreshold, {});

  return new KmsSignersVerifierImpl(client.libs, {
    verifyingContractAddressDecryption,
    chainId,
    kmsSigners,
    kmsSignerThreshold,
  });
}
