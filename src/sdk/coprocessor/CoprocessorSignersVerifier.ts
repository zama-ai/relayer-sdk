import type {
  Bytes32,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint256BigInt,
  UintBigInt,
  UintNumber,
} from '@base/types/primitives';
import type { FhevmHandle } from '@fhevm-base/index';
import type { FhevmChainClient, EIP712Lib } from '@fhevm-base-types/public-api';
import type {
  CoprocessorEIP712Message,
  InputVerifierContractData,
} from '@fhevm-base/types/public-api';
import type {
  CoprocessorEIP712Builder,
  CoprocessorSignersVerifier,
  InputProof,
} from './public-api';
import type { ZKProof } from '../types/public-api';
import { assertIsChecksummedAddress } from '@base/address';
import { executeWithBatching } from '@base/promise';
import { assertIsUintNumber, asUint256BigInt } from '@base/uint';
import { createCoprocessorEIP712Builder } from './CoprocessorEIP712Builder';
import { createInputProofFromSignatures } from './InputProof';
import {
  DuplicateSignerError,
  ThresholdSignerError,
  UnknownSignerError,
} from '../errors/SignersError';

////////////////////////////////////////////////////////////////////////////////
// Private class CoprocessorSignersVerifier
////////////////////////////////////////////////////////////////////////////////

class CoprocessorSignersVerifierImpl implements CoprocessorSignersVerifier {
  readonly #coprocessorSigners: readonly ChecksummedAddress[];
  readonly #coprocessorSignersSet: Set<string>;
  readonly #coprocessorSignerThreshold: UintNumber;
  readonly #eip712Builder: CoprocessorEIP712Builder;
  readonly #eip712Lib: EIP712Lib;

  constructor(
    libs: {
      readonly eip712Lib: EIP712Lib;
    },
    params: {
      readonly coprocessorSigners: readonly ChecksummedAddress[];
      readonly coprocessorSignerThreshold: UintNumber;
      readonly gatewayChainId: Uint256BigInt;
      readonly verifyingContractAddressInputVerification: ChecksummedAddress;
    },
  ) {
    this.#coprocessorSigners = [...params.coprocessorSigners];
    this.#coprocessorSignerThreshold = params.coprocessorSignerThreshold;
    Object.freeze(this.#coprocessorSigners);
    this.#coprocessorSignersSet = new Set(
      this.#coprocessorSigners.map((addr) => addr.toLowerCase()),
    );
    this.#eip712Builder = createCoprocessorEIP712Builder(params);
    this.#eip712Lib = libs.eip712Lib;
  }

  public get count(): number {
    return this.#coprocessorSigners.length;
  }

  public get coprocessorSigners(): readonly ChecksummedAddress[] {
    return this.#coprocessorSigners;
  }

  public get coprocessorSignerThreshold(): UintNumber {
    return this.#coprocessorSignerThreshold;
  }

  public get gatewayChainId(): Uint256BigInt {
    return this.#eip712Builder.gatewayChainId;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#eip712Builder.verifyingContractAddressInputVerification;
  }

  private _isThresholdReached(recoveredAddresses: readonly string[]): boolean {
    const addressMap = new Set<string>();
    recoveredAddresses.forEach((address) => {
      if (addressMap.has(address.toLowerCase())) {
        throw new DuplicateSignerError({
          duplicateAddress: address,
          type: 'coprocessor',
        });
      }
      addressMap.add(address);
    });

    for (const address of recoveredAddresses) {
      if (!this.#coprocessorSignersSet.has(address.toLowerCase())) {
        throw new UnknownSignerError({
          unknownAddress: address,
          type: 'coprocessor',
        });
      }
    }

    return recoveredAddresses.length >= this.#coprocessorSignerThreshold;
  }

  public async verifyFhevmHandles(params: {
    readonly handles: readonly FhevmHandle[];
    readonly signatures: readonly Bytes65Hex[];
    readonly userAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
    readonly chainId: UintBigInt;
    readonly extraData: BytesHex;
  }): Promise<void> {
    const handlesBytes32: Bytes32[] = params.handles.map((h) => h.bytes32);

    const message: CoprocessorEIP712Message = {
      ctHandles: handlesBytes32,
      userAddress: params.userAddress,
      contractAddress: params.contractAddress,
      contractChainId: params.chainId,
      extraData: params.extraData,
    };

    // 1. Verify signatures
    const recoveredAddresses = await this.#eip712Builder.verify({
      signatures: params.signatures,
      message,
      verifier: this.#eip712Lib,
    });

    // 2. Verify signature theshold is reached
    if (!this._isThresholdReached(recoveredAddresses)) {
      throw new ThresholdSignerError({ type: 'coprocessor' });
    }
  }

  public async verifyZKProof(params: {
    readonly zkProof: ZKProof;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<void> {
    return this.verifyFhevmHandles({
      handles: params.zkProof.getFhevmHandles(),
      userAddress: params.zkProof.userAddress,
      contractAddress: params.zkProof.contractAddress,
      chainId: params.zkProof.chainId,
      extraData: params.extraData,
      signatures: params.signatures,
    });
  }

  public async verifyZKProofAndComputeInputProof(params: {
    readonly zkProof: ZKProof;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<InputProof> {
    const fhevmHandles: readonly FhevmHandle[] =
      params.zkProof.getFhevmHandles();

    // Throws exception if message properties are invalid
    await this.verifyFhevmHandles({
      chainId: params.zkProof.chainId,
      handles: fhevmHandles,
      contractAddress: params.zkProof.contractAddress,
      userAddress: params.zkProof.userAddress,
      extraData: params.extraData,
      signatures: params.signatures,
    });

    const fhevmHandlesBytes32: Bytes32[] = fhevmHandles.map((h) => h.bytes32);

    return createInputProofFromSignatures({
      signatures: params.signatures,
      handles: fhevmHandlesBytes32,
      extraData: params.extraData,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a CoprocessorSignersVerifier from pre-validated components.
 *
 * Use this function when you already have validated coprocessor signers and threshold data.
 * For fetching data from an on-chain contract, use {@link fetchCoprocessorSignersVerifier} instead.
 *
 * @param params - Trusted, pre-validated configuration components
 * @param params.gatewayChainId - Validated gateway chain ID (uint256)
 * @param params.verifyingContractAddressInputVerification - Validated checksummed address of the verification contract
 * @param params.coprocessorSigners - Validated array of checksummed coprocessor signer addresses
 * @param params.coprocessorSignerThreshold - Validated threshold (minimum number of signatures required)
 * @returns A CoprocessorSignersVerifier instance
 *
 * @remarks
 * All parameters are trusted - no validation is performed. Ensure values are properly
 * validated before calling this function.
 */
export function createCoprocessorSignersVerifier(
  libs: {
    readonly eip712Lib: EIP712Lib;
  },
  params: {
    readonly gatewayChainId: Uint256BigInt;
    readonly verifyingContractAddressInputVerification: ChecksummedAddress;
    readonly coprocessorSigners: readonly ChecksummedAddress[];
    readonly coprocessorSignerThreshold: UintNumber;
  },
): CoprocessorSignersVerifier {
  return new CoprocessorSignersVerifierImpl(libs, params);
}

/**
 * Creates a {@link CoprocessorSignersVerifier} from an {@link InputVerifierContractData} contract result.
 */
export function createCoprocessorSignersVerifierWithInputVerifier(
  libs: {
    readonly eip712Lib: EIP712Lib;
  },
  inputVerifier: InputVerifierContractData,
): CoprocessorSignersVerifier {
  return new CoprocessorSignersVerifierImpl(libs, {
    gatewayChainId: asUint256BigInt(inputVerifier.gatewayChainId),
    coprocessorSigners: inputVerifier.coprocessorSigners,
    coprocessorSignerThreshold: inputVerifier.coprocessorSignerThreshold,
    verifyingContractAddressInputVerification:
      inputVerifier.verifyingContractAddressInputVerification,
  });
}

/**
 * Fetches coprocessor signers and threshold from an on-chain InputVerifier contract
 * and creates a CoprocessorSignersVerifier instance.
 *
 * Use this function when you need to retrieve configuration from the blockchain.
 * For constructing from pre-validated data, use {@link createCoprocessorSignersVerifier} instead.
 *
 * @param client - FHEVM chain client for making RPC calls
 * @param args - Configuration for fetching coprocessor signer data
 * @param args.gatewayChainId - Gateway chain ID (will be validated as uint256)
 * @param args.verifyingContractAddressInputVerification - Address of the verification contract (will be checksummed)
 * @param args.inputVerifierContractAddress - Address of the InputVerifier contract to query
 * @returns A Promise resolving to a CoprocessorSignersVerifier instance
 *
 * @remarks
 * This function performs validation on inputs and makes asynchronous RPC calls to fetch:
 * - Coprocessor signer addresses from the contract
 * - Signature threshold from the contract
 */
export async function fetchCoprocessorSignersVerifier(
  client: FhevmChainClient,
  args: {
    readonly gatewayChainId: bigint;
    readonly verifyingContractAddressInputVerification: string;
    readonly inputVerifierContractAddress: string;
  },
): Promise<CoprocessorSignersVerifier> {
  const {
    inputVerifierContractAddress,
    verifyingContractAddressInputVerification,
  } = args;
  assertIsChecksummedAddress(inputVerifierContractAddress, {});
  assertIsChecksummedAddress(verifyingContractAddressInputVerification, {});
  const gatewayChainId = asUint256BigInt(args.gatewayChainId);

  const inputContract = client.libs.inputVerifierContractLib;

  const res = await executeWithBatching(
    [
      () =>
        inputContract.getCoprocessorSigners(
          client.nativeClient,
          inputVerifierContractAddress,
        ),
      () =>
        inputContract.getThreshold(
          client.nativeClient,
          inputVerifierContractAddress,
        ),
    ],
    client.batchRpcCalls,
  );

  const coprocessorSignersAddresses = res[0] as ChecksummedAddress[];
  const threshold = res[1];

  assertIsUintNumber(threshold, {});

  return new CoprocessorSignersVerifierImpl(
    { eip712Lib: client.libs.eip712Lib },
    {
      verifyingContractAddressInputVerification,
      gatewayChainId,
      coprocessorSigners: coprocessorSignersAddresses,
      coprocessorSignerThreshold: threshold,
    },
  );
}
