import type { Prettify } from '../../utils/types';
import type {
  Bytes32Hex,
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
