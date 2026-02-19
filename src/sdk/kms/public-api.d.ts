import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint32BigInt,
} from '@base/types/primitives';
import type { Prettify } from '@base/types/utils';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type {
  FhevmHandle,
  KmsEIP712Domain,
} from '@fhevm-base/types/public-api';

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Types
////////////////////////////////////////////////////////////////////////////////

export interface KmsEIP712Builder {
  readonly chainId: Uint32BigInt;
  readonly verifyingContractAddressDecryption: ChecksummedAddress;
  readonly userDecryptTypes: KmsUserDecryptEIP712Types;
  readonly delegateUserDecryptTypes: KmsDelegateUserDecryptEIP712Types;
  readonly publicDecryptTypes: KmsPublicDecryptEIP712Types;
  readonly domain: KmsEIP712Domain;

  createPublicDecrypt(
    params: KmsPublicDecryptEIP712UserArgs,
  ): KmsPublicDecryptEIP712;
  createUserDecrypt(params: KmsUserDecryptEIP712UserArgs): KmsUserDecryptEIP712;
  createDelegateUserDecrypt(
    params: KmsDelegateUserDecryptEIP712UserArgs,
  ): KmsDelegateUserDecryptEIP712;

  verifyPublicDecrypt(params: {
    readonly signatures: readonly string[];
    readonly message: KmsPublicDecryptEIP712UserArgs;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]>;
  verifyUserDecrypt(params: {
    readonly signatures: string[];
    readonly message: KmsUserDecryptEIP712UserArgs;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]>;
  verifyDelegateUserDecrypt(params: {
    readonly signatures: string[];
    readonly message: KmsDelegateUserDecryptEIP712UserArgs;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]>;
}

////////////////////////////////////////////////////////////////////////////////
// UserDecryptRequestVerification
////////////////////////////////////////////////////////////////////////////////

export type KmsUserDecryptEIP712UserArgs = Readonly<{
  readonly publicKey: string | Uint8Array;
  readonly contractAddresses: readonly string[];
  readonly startTimestamp: number;
  readonly durationDays: number;
  readonly extraData: string;
}>;

export type KmsUserDecryptEIP712Message = Readonly<{
  publicKey: BytesHex;
  contractAddresses: readonly ChecksummedAddress[];
  startTimestamp: string;
  durationDays: string;
  extraData: BytesHex;
}>;

export type KmsUserDecryptEIP712Types = {
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

export type KmsUserDecryptEIP712 = Readonly<
  Prettify<{
    types: KmsUserDecryptEIP712Types;
    primaryType: 'UserDecryptRequestVerification';
    domain: KmsEIP712Domain;
    message: KmsUserDecryptEIP712Message;
  }>
>;

////////////////////////////////////////////////////////////////////////////////
// DelegatedUserDecryptRequestVerification
////////////////////////////////////////////////////////////////////////////////

export type KmsDelegateUserDecryptEIP712UserArgs = Prettify<
  KmsUserDecryptEIP712UserArgs & {
    readonly delegatedAccount: string;
  }
>;

export type KmsDelegateUserDecryptEIP712Message = Prettify<
  KmsUserDecryptEIP712Message & {
    readonly delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegateUserDecryptEIP712Types = {
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

export type KmsDelegateUserDecryptEIP712 = Readonly<{
  types: KmsDelegateUserDecryptEIP712Types;
  primaryType: 'DelegatedUserDecryptRequestVerification';
  domain: KmsEIP712Domain;
  message: KmsDelegateUserDecryptEIP712Message;
}>;

////////////////////////////////////////////////////////////////////////////////
// PublicDecryptVerification
////////////////////////////////////////////////////////////////////////////////

export type KmsPublicDecryptEIP712UserArgs = Readonly<{
  ctHandles: readonly string[];
  decryptedResult: string;
  extraData: string;
}>;

export type KmsPublicDecryptEIP712Message = Readonly<{
  ctHandles: readonly Bytes32Hex[];
  decryptedResult: BytesHex;
  extraData: BytesHex;
}>;

export type KmsPublicDecryptEIP712Types = {
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

export type KmsPublicDecryptEIP712 = Readonly<
  Prettify<{
    types: KmsPublicDecryptEIP712Types;
    primaryType: 'PublicDecryptVerification';
    domain: KmsEIP712Domain;
    message: KmsPublicDecryptEIP712Message;
  }>
>;

interface KmsSignersVerifier {
  readonly count: number;
  readonly kmsSigners: readonly ChecksummedAddress[];
  readonly kmsSignerThreshold: number;
  readonly chainId: Uint32BigInt;
  readonly verifyingContractAddressDecryption: ChecksummedAddress;

  verifyPublicDecrypt(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<void>;

  verifyAndComputePublicDecryptionProof(params: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedDecryptedResult: BytesHex;
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }): Promise<PublicDecryptionProof>;
}

export type ClearValueType = bigint | boolean | `0x${string}`;
export type ClearValues = Readonly<Record<`0x${string}`, ClearValueType>>;
export type PublicDecryptResults = Readonly<{
  clearValues: ClearValues;
  abiEncodedClearValues: `0x${string}`;
  decryptionProof: `0x${string}`;
}>;

export interface PublicDecryptionProof {
  readonly proof: BytesHex;
  readonly orderedHandles: readonly FhevmHandle[];
  readonly orderedClearValues: readonly ClearValueType[];
  readonly orderedAbiEncodedClearValues: BytesHex;
  readonly extraData: BytesHex;
  toPublicDecryptResults(): PublicDecryptResults;
}
