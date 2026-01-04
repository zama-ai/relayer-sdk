import type { ethers as EthersT } from 'ethers';
import type {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';
import type {
  CoprocessorEIP712DomainType,
  CoprocessorEIP712MessageType,
  CoprocessorEIP712Type,
  CoprocessorEIP712TypesType,
} from './types';
import type { Prettify } from '@base/types/utils';
import type { FhevmHandleLike } from '../FhevmHandle';
import { assertIsChecksummedAddress } from '@base/address';
import { assertIsBytes65HexArray, assertIsBytesHex } from '@base/bytes';
import { verifySignature } from '@base/signature';
import { assertIsUint256 } from '@base/uint';
import { assertIsHandleLikeArray, toHandleBytes32Hex } from '../FhevmHandle';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorEIP712 Class
////////////////////////////////////////////////////////////////////////////////

export class CoprocessorEIP712 {
  public readonly domain: CoprocessorEIP712DomainType;

  static readonly #types: CoprocessorEIP712TypesType = {
    CiphertextVerification: [
      { name: 'ctHandles', type: 'bytes32[]' },
      { name: 'userAddress', type: 'address' },
      { name: 'contractAddress', type: 'address' },
      { name: 'contractChainId', type: 'uint256' },
      { name: 'extraData', type: 'bytes' },
    ],
  } as const;

  static {
    Object.freeze(CoprocessorEIP712.#types);
    Object.freeze(CoprocessorEIP712.#types.CiphertextVerification);
  }

  constructor(params: {
    readonly gatewayChainId: bigint;
    readonly verifyingContractAddressInputVerification: string;
  }) {
    // The coprocessor eip712 does not require a uint32 contrary to kms.
    assertIsUint256(params.gatewayChainId);
    assertIsChecksummedAddress(
      params.verifyingContractAddressInputVerification,
    );
    this.domain = {
      name: 'InputVerification',
      version: '1',
      chainId: params.gatewayChainId,
      verifyingContract: params.verifyingContractAddressInputVerification,
    } as const;
    Object.freeze(this.domain);
  }

  public get gatewayChainId(): bigint {
    return this.domain.chainId;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.domain.verifyingContract;
  }

  public get types(): CoprocessorEIP712TypesType {
    return CoprocessorEIP712.#types;
  }

  public createEIP712({
    ctHandles,
    contractChainId,
    contractAddress,
    userAddress,
    extraData,
  }: Prettify<
    Omit<CoprocessorEIP712MessageType, 'ctHandles'> & {
      readonly ctHandles: readonly FhevmHandleLike[];
    }
  >): CoprocessorEIP712Type {
    assertIsHandleLikeArray(ctHandles as unknown);
    assertIsChecksummedAddress(userAddress);
    assertIsChecksummedAddress(contractAddress);
    assertIsUint256(contractChainId);
    assertIsBytesHex(extraData);

    /*
    const EIP712DomainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    */

    const eip712 = {
      domain: { ...this.domain },
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
        ctHandles: ctHandles.map(toHandleBytes32Hex),
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

  public verify({
    signatures,
    message,
  }: {
    readonly signatures: readonly Bytes65Hex[];
    readonly message: CoprocessorEIP712MessageType;
  }): ChecksummedAddress[] {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: BytesHex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: this.types as unknown as Record<
          string,
          EthersT.TypedDataField[]
        >,
        message,
      });
      return recoveredAddress;
    });
    return recoveredAddresses;
  }
}
