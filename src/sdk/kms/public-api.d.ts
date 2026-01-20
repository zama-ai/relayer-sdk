import type {
  Bytes32Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { Prettify } from '@base/types/utils';

export interface KeypairType<T> {
  publicKey: T;
  privateKey: T;
}

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Types
////////////////////////////////////////////////////////////////////////////////

export interface IKmsSignersVerifier extends IKmsEIP712 {
  readonly kmsSigners: readonly ChecksummedAddress[];
  readonly threshold: number;
}

export interface IKmsEIP712 {
  readonly chainId: bigint;
  readonly verifyingContractAddressDecryption: ChecksummedAddress;
}

export type KmsEIP712Params = Readonly<{
  chainId: bigint;
  verifyingContractAddressDecryption: ChecksummedAddress;
}>;

export type KmsEIP712DomainType = Readonly<{
  name: 'Decryption';
  version: '1';
  chainId: bigint;
  verifyingContract: ChecksummedAddress;
}>;

////////////////////////////////////////////////////////////////////////////////
// UserDecryptRequestVerification
////////////////////////////////////////////////////////////////////////////////

export type KmsUserDecryptEIP712UserArgsType = Readonly<{
  publicKey:
    | string
    | Uint8Array
    | KeypairType<string>
    | KeypairType<Uint8Array>;
  contractAddresses: readonly string[];
  startTimestamp: number;
  durationDays: number;
  extraData: BytesHex;
}>;

export type KmsUserDecryptEIP712MessageType = Readonly<{
  publicKey: BytesHex;
  contractAddresses: readonly ChecksummedAddress[];
  startTimestamp: string;
  durationDays: string;
  extraData: BytesHex;
}>;

export type KmsUserDecryptEIP712TypesType = {
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

export type KmsUserDecryptEIP712Type = Readonly<
  Prettify<{
    types: KmsUserDecryptEIP712TypesType;
    primaryType: 'UserDecryptRequestVerification';
    domain: KmsEIP712DomainType;
    message: KmsUserDecryptEIP712MessageType;
  }>
>;

////////////////////////////////////////////////////////////////////////////////
// DelegatedUserDecryptRequestVerification
////////////////////////////////////////////////////////////////////////////////

export type KmsDelegateUserDecryptEIP712UserArgsType = Prettify<
  KmsUserDecryptEIP712UserArgsType & {
    readonly delegatorAddress: string;
  }
>;

export type KmsDelegateUserDecryptEIP712MessageType = Prettify<
  KmsUserDecryptEIP712MessageType & {
    readonly delegatorAddress: ChecksummedAddress;
  }
>;

export type KmsDelegatedUserDecryptEIP712TypesType = {
  readonly EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  readonly DelegatedUserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'delegatorAddress'; readonly type: 'address' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type KmsDelegatedUserDecryptEIP712Type = Readonly<{
  types: KmsDelegatedUserDecryptEIP712TypesType;
  primaryType: 'DelegatedUserDecryptRequestVerification';
  domain: KmsEIP712DomainType;
  message: KmsDelegateUserDecryptEIP712MessageType;
}>;

////////////////////////////////////////////////////////////////////////////////
// PublicDecryptVerification
////////////////////////////////////////////////////////////////////////////////

export type KmsPublicDecryptEIP712UserArgsType = Readonly<{
  ctHandles: readonly Bytes32Hex[];
  decryptedResult: BytesHex;
  extraData: BytesHex;
}>;

export type KmsPublicDecryptEIP712MessageType = Readonly<{
  ctHandles: readonly Bytes32Hex[];
  decryptedResult: BytesHex;
  extraData: BytesHex;
}>;

export type KmsPublicDecryptEIP712TypesType = {
  readonly EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  readonly PublicDecryptVerification: readonly [
    { readonly name: 'ctHandles'; readonly type: 'bytes32[]' },
    { readonly name: 'decryptedResult'; readonly type: 'bytes' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type KmsPublicDecryptEIP712Type = Readonly<
  Prettify<{
    types: KmsPublicDecryptEIP712TypesType;
    primaryType: 'PublicDecryptVerification';
    domain: KmsEIP712DomainType;
    message: KmsPublicDecryptEIP712MessageType;
  }>
>;
