import type {
  Bytes65Hex,
  ChecksummedAddress,
  Uint256BigInt,
} from '@base/types/primitives';
import type { Prettify } from '@base/types/utils';
import type {
  CoprocessorEIP712Domain,
  CoprocessorEIP712Message,
  CoprocessorEIP712,
  CoprocessorEIP712Types,
  FhevmHandleLike,
} from '@fhevm-base/types/public-api';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type { CoprocessorEIP712Builder } from './public-api';
import {
  asChecksummedAddress,
  assertIsChecksummedAddress,
} from '@base/address';
import { assertIsBytes65HexArray, assertIsBytesHex } from '@base/bytes';
import { assertIsUint256, asUint256BigInt } from '@base/uint';
import {
  assertIsFhevmHandleLikeArray,
  fhevmHandleLikeToFhevmHandle,
} from '@fhevm-base/index';

////////////////////////////////////////////////////////////////////////////////
// Private CoprocessorEIP712Builder Class
////////////////////////////////////////////////////////////////////////////////

class CoprocessorEIP712BuilderImpl implements CoprocessorEIP712Builder {
  readonly #domain: CoprocessorEIP712Domain;

  static readonly #types: CoprocessorEIP712Types = {
    CiphertextVerification: [
      { name: 'ctHandles', type: 'bytes32[]' },
      { name: 'userAddress', type: 'address' },
      { name: 'contractAddress', type: 'address' },
      { name: 'contractChainId', type: 'uint256' },
      { name: 'extraData', type: 'bytes' },
    ],
  } as const;

  static {
    Object.freeze(CoprocessorEIP712BuilderImpl.#types);
    Object.freeze(CoprocessorEIP712BuilderImpl.#types.CiphertextVerification);
  }

  constructor(params: {
    readonly gatewayChainId: Uint256BigInt;
    readonly verifyingContractAddressInputVerification: ChecksummedAddress;
  }) {
    this.#domain = {
      name: 'InputVerification',
      version: '1',
      chainId: params.gatewayChainId,
      verifyingContract: params.verifyingContractAddressInputVerification,
    } as const;
    Object.freeze(this.#domain);
  }

  public get gatewayChainId(): Uint256BigInt {
    return this.#domain.chainId as Uint256BigInt;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#domain.verifyingContract;
  }

  public get types(): CoprocessorEIP712Types {
    return CoprocessorEIP712BuilderImpl.#types;
  }

  public create({
    ctHandles,
    contractChainId,
    contractAddress,
    userAddress,
    extraData,
  }: Prettify<
    Omit<CoprocessorEIP712Message, 'ctHandles'> & {
      readonly ctHandles: readonly FhevmHandleLike[];
    }
  >): CoprocessorEIP712 {
    assertIsFhevmHandleLikeArray(ctHandles as unknown);
    assertIsChecksummedAddress(userAddress, {});
    assertIsChecksummedAddress(contractAddress, {});
    assertIsUint256(contractChainId, {});
    assertIsBytesHex(extraData, {});

    /*
    const EIP712DomainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    */

    const eip712 = {
      domain: { ...this.#domain },
      types: {
        // EIP712Domain: EIP712DomainType
        CiphertextVerification: [
          { name: 'ctHandles', type: 'bytes32[]' },
          { name: 'userAddress', type: 'address' },
          { name: 'contractAddress', type: 'address' },
          { name: 'contractChainId', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
        ] as const,
      },
      message: {
        ctHandles: ctHandles.map((h) => {
          return fhevmHandleLikeToFhevmHandle(h).bytes32Hex;
        }),
        userAddress: userAddress,
        contractAddress: contractAddress,
        contractChainId: contractChainId,
        extraData,
      },
    };

    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.CiphertextVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.ctHandles);

    return eip712;
  }

  public async verify({
    signatures,
    message,
    verifier,
  }: {
    readonly signatures: readonly Bytes65Hex[];
    readonly message: CoprocessorEIP712Message;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]> {
    assertIsBytes65HexArray(signatures, {});
    // If primaryType is specified, filter types to only include the primary type
    // This ensures ethers uses the correct primary type for signing
    const primaryType: keyof CoprocessorEIP712Types = 'CiphertextVerification';

    const recoveredAddresses = await Promise.all(
      signatures.map((signature: Bytes65Hex) =>
        verifier.recoverTypedDataAddress({
          signature,
          // force cast
          domain: this.#domain as unknown as Parameters<
            EIP712Lib['recoverTypedDataAddress']
          >[0]['domain'],
          primaryType,
          types: { [primaryType]: [...this.types[primaryType]] },
          message: message as Record<string, unknown>,
        }),
      ),
    );

    return recoveredAddresses;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createCoprocessorEIP712Builder(params: {
  readonly gatewayChainId: bigint;
  readonly verifyingContractAddressInputVerification: string;
}): CoprocessorEIP712Builder {
  // The coprocessor eip712 does not require a uint32 contrary to kms.
  const gatewayChainId = asUint256BigInt(params.gatewayChainId);
  const verifyingContractAddressInputVerification = asChecksummedAddress(
    params.verifyingContractAddressInputVerification,
  );

  return new CoprocessorEIP712BuilderImpl({
    gatewayChainId,
    verifyingContractAddressInputVerification,
  });
}

/*
// Factory: creates a CoprocessorEIP712 from domain + message params
function createCoprocessorEIP712(params: {
  domain: CoprocessorEIP712Domain;
  gatewayChainId: Uint64BigInt,
  verifyingContractAddressInputVerification: ChecksummedAddress,
  handles: readonly FhevmHandleLike[];
  userAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
  contractChainId: bigint;
  extraData: BytesHex;
}): CoprocessorEIP712;
*/
