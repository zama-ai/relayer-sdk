import type { Prettify } from '@base/types/utils';
import type {
  Bytes32,
  Bytes32Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorEIP712 Types
////////////////////////////////////////////////////////////////////////////////

export type CoprocessorEIP712Params = {
  readonly gatewayChainId: number;
  readonly verifyingContractAddressInputVerification: ChecksummedAddress;
};

export type CoprocessorEIP712DomainType = {
  readonly name: 'InputVerification';
  readonly version: '1';
  readonly chainId: number;
  readonly verifyingContract: ChecksummedAddress;
};

export type CoprocessorEIP712MessageType = Readonly<{
  ctHandles: readonly Bytes32Hex[] | readonly Bytes32[];
  userAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
  contractChainId: number;
  extraData: BytesHex;
}>;

export type CoprocessorEIP712MessageHexType = Readonly<{
  ctHandles: readonly Bytes32Hex[];
  userAddress: ChecksummedAddress;
  contractAddress: ChecksummedAddress;
  contractChainId: number;
  extraData: BytesHex;
}>;

export type CoprocessorEIP712TypesType = {
  readonly CiphertextVerification: readonly [
    { readonly name: 'ctHandles'; readonly type: 'bytes32[]' },
    { readonly name: 'userAddress'; readonly type: 'address' },
    { readonly name: 'contractAddress'; readonly type: 'address' },
    { readonly name: 'contractChainId'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type CoprocessorEIP712Type = Prettify<{
  readonly domain: CoprocessorEIP712DomainType;
  readonly types: CoprocessorEIP712TypesType;
  readonly message: CoprocessorEIP712MessageType;
}>;
