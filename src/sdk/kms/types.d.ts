import type { BytesHex, ChecksummedAddress } from '../../types/primitives';
import type { Prettify } from '../../utils/types';

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Types
////////////////////////////////////////////////////////////////////////////////

export type KmsEIP712Params = {
  chainId: number;
  verifyingContractAddressDecryption: ChecksummedAddress;
};

export type KmsEIP712DomainType = {
  readonly name: 'Decryption';
  readonly version: '1';
  chainId: number;
  verifyingContract: ChecksummedAddress;
};

export type KmsEIP712UserArgsType = {
  publicKey: BytesHex;
  contractAddresses: ChecksummedAddress[];
  startTimestamp: number | bigint;
  durationDays: number | bigint;
  extraData: BytesHex;
};

export type KmsEIP712MessageType = {
  publicKey: BytesHex;
  contractAddresses: ChecksummedAddress[];
  startTimestamp: string;
  durationDays: string;
  extraData: BytesHex;
};

export type KmsDelegateEIP712UserArgsType = Prettify<
  KmsEIP712UserArgsType & {
    delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegateEIP712MessageType = Prettify<
  KmsEIP712MessageType & {
    delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegateEIP712TypesType = {
  EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  DelegatedUserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
    { readonly name: 'delegatedAccount'; readonly type: 'address' },
  ];
};

export type KmsEIP712TypesType = {
  EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  UserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type KmsDelegateEIP712Type = {
  types: KmsDelegateEIP712TypesType;
  primaryType: 'DelegatedUserDecryptRequestVerification';
  domain: KmsEIP712DomainType;
  message: KmsDelegateEIP712MessageType;
};

export type KmsEIP712Type = {
  types: KmsEIP712TypesType;
  primaryType: 'UserDecryptRequestVerification';
  domain: KmsEIP712DomainType;
  message: KmsEIP712MessageType;
};
