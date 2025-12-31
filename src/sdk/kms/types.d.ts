import type { BytesHex, ChecksummedAddress } from '../../types/primitives';
import type { Prettify } from '../../utils/types';

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Types
////////////////////////////////////////////////////////////////////////////////

export type KmsEIP712Params = Readonly<{
  chainId: number;
  verifyingContractAddressDecryption: ChecksummedAddress;
}>;

export type KmsEIP712DomainType = Readonly<{
  name: 'Decryption';
  version: '1';
  chainId: number;
  verifyingContract: ChecksummedAddress;
}>;

export type KmsEIP712UserArgsType = Readonly<{
  publicKey: BytesHex;
  contractAddresses: readonly ChecksummedAddress[];
  startTimestamp: number | bigint;
  durationDays: number | bigint;
  extraData: BytesHex;
}>;

export type KmsEIP712MessageType = Readonly<{
  publicKey: BytesHex;
  contractAddresses: readonly ChecksummedAddress[];
  startTimestamp: string;
  durationDays: string;
  extraData: BytesHex;
}>;

export type KmsDelegateEIP712UserArgsType = Prettify<
  KmsEIP712UserArgsType & {
    readonly delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegateEIP712MessageType = Prettify<
  KmsEIP712MessageType & {
    readonly delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegateEIP712TypesType = {
  readonly EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  readonly DelegatedUserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
    { readonly name: 'delegatedAccount'; readonly type: 'address' },
  ];
};

export type KmsEIP712TypesType = {
  readonly EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  readonly UserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type KmsDelegateEIP712Type = Readonly<{
  types: KmsDelegateEIP712TypesType;
  primaryType: 'DelegatedUserDecryptRequestVerification';
  domain: KmsEIP712DomainType;
  message: KmsDelegateEIP712MessageType;
}>;

export type KmsEIP712Type = Readonly<{
  types: KmsEIP712TypesType;
  primaryType: 'UserDecryptRequestVerification';
  domain: KmsEIP712DomainType;
  message: KmsEIP712MessageType;
}>;
