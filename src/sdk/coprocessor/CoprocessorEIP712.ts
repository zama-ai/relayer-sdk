import { assertIsUint256 } from '../../utils/uint';
import { assertIsChecksummedAddress } from '../../utils/address';
import {
  assertIsBytes32HexArray,
  assertIsBytes65HexArray,
  assertIsBytesHex,
} from '../../utils/bytes';
import type { ethers as EthersT } from 'ethers';
import { Prettify } from '../../utils/types';
import { verifySignature } from '../../utils/signature';
import {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '../../types/primitives';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorEIP712 Types
////////////////////////////////////////////////////////////////////////////////

export type CoprocessorEIP712Params = {
  gatewayChainId: number;
  verifyingContractAddressInputVerification: ChecksummedAddress;
};

export type CoprocessorEIP712DomainType = {
  readonly name: 'InputVerification';
  readonly version: '1';
  chainId: number;
  verifyingContract: ChecksummedAddress;
};

export type CoprocessorEIP712MessageType = {
  ctHandles: Bytes32Hex[];
  userAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
  contractChainId: number;
  extraData: BytesHex;
};

export type CoprocessorEIP712TypesType = {
  CiphertextVerification: readonly [
    { readonly name: 'ctHandles'; readonly type: 'bytes32[]' },
    { readonly name: 'userAddress'; readonly type: 'address' },
    { readonly name: 'contractAddress'; readonly type: 'address' },
    { readonly name: 'contractChainId'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type CoprocessorEIP712Type = Prettify<{
  domain: CoprocessorEIP712DomainType;
  types: CoprocessorEIP712TypesType;
  message: CoprocessorEIP712MessageType;
}>;

////////////////////////////////////////////////////////////////////////////////
// CoprocessorEIP712 Class
////////////////////////////////////////////////////////////////////////////////

export class CoprocessorEIP712 {
  public readonly domain: CoprocessorEIP712DomainType;
  private static types: CoprocessorEIP712TypesType = {
    CiphertextVerification: [
      { name: 'ctHandles', type: 'bytes32[]' },
      { name: 'userAddress', type: 'address' },
      { name: 'contractAddress', type: 'address' },
      { name: 'contractChainId', type: 'uint256' },
      { name: 'extraData', type: 'bytes' },
    ],
  } as const;

  static {
    Object.freeze(CoprocessorEIP712.types);
    Object.freeze(CoprocessorEIP712.types.CiphertextVerification);
  }

  constructor(params: {
    gatewayChainId: number;
    verifyingContractAddressInputVerification: string;
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

  public get gatewayChainId(): number {
    return this.domain.chainId;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.domain.verifyingContract;
  }

  public get types(): CoprocessorEIP712TypesType {
    return CoprocessorEIP712.types;
  }

  public createEIP712({
    ctHandles,
    contractChainId,
    contractAddress,
    userAddress,
    extraData,
  }: CoprocessorEIP712MessageType): CoprocessorEIP712Type {
    assertIsBytes32HexArray(ctHandles);
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
        ctHandles: [...ctHandles],
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
    signatures: Bytes65Hex[];
    message: CoprocessorEIP712MessageType;
  }) {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: BytesHex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: this.types as any as Record<
          string,
          Array<EthersT.TypedDataField>
        >,
        message,
      });
      return recoveredAddress;
    });
    return recoveredAddresses;
  }
}
