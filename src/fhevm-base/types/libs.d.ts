import type {
  Bytes,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';
import type {
  DecryptedFhevmHandle,
  EncryptionBits,
  FheTypeId,
  FhevmHandle,
  KmsDelegatedUserDecryptEIP712Message,
  KmsSigncryptedShares,
  KmsUserDecryptEIP712Message,
  ZKProof,
} from './public-api';
import type {
  KmsSigncryptedShare,
  TfheCrs,
  TfheCrsBytes,
  TfhePublicKey,
  TfhePublicKeyBytes,
  TkmsPrivateKey,
} from './private';
import type {
  TfhePublicEncryptionParams,
  TfhePublicEncryptionParamsBytes,
} from './private';
import type { TypedValue } from '@base/typedvalue';

////////////////////////////////////////////////////////////////////////////////
// TFHELib
////////////////////////////////////////////////////////////////////////////////

export interface TFHELib {
  parseTFHEProvenCompactCiphertextList(
    ciphertextWithZKProof: Uint8Array | string,
  ): { fheTypeIds: FheTypeId[]; encryptionBits: EncryptionBits[] };
  buildWithProofPacked(args: {
    publicEncryptionParams: TfhePublicEncryptionParams;
    typedValues: TypedValue[];
    metaData: Uint8Array;
  }): Uint8Array;
  serializeTfhePublicEncryptionParams(
    publicEncryptionParams: TfhePublicEncryptionParams,
  ): TfhePublicEncryptionParamsBytes;
  serializeTfhePublicKey(params: TfhePublicKey): TfhePublicKeyBytes;
  serializeTfheCrs(params: TfheCrs): TfheCrsBytes;
  deserializeTfhePublicEncryptionParams(
    publicEncryptionParamsBytes: TfhePublicEncryptionParamsBytes,
  ): TfhePublicEncryptionParams;
}

////////////////////////////////////////////////////////////////////////////////
// TKMSLib
////////////////////////////////////////////////////////////////////////////////

export interface TKMSLib {
  decryptAndReconstruct(
    tkmsPrivateKey: TkmsPrivateKey,
    shares: KmsSigncryptedShares,
  ): readonly DecryptedFhevmHandle[];
  generateTkmsPrivateKey(): TkmsPrivateKey;
  getTkmsPublicKeyHex(tkmsPrivateKey: TkmsPrivateKey): BytesHex;
  serializeTkmsPrivateKey(tkmsPrivateKey: TkmsPrivateKey): Bytes;
  deserializeTkmsPrivateKey(tkmsPrivateKeyBytes: Bytes): TkmsPrivateKey;
}

////////////////////////////////////////////////////////////////////////////////
// RelayerLib
////////////////////////////////////////////////////////////////////////////////

export type RelayerFetchOptions = unknown;

export interface RelayerLib {
  fetchTfhePublicEncryptionParams(
    relayerUrl: string,
    options?: RelayerFetchOptions,
  ): Promise<TfhePublicEncryptionParamsBytes>;

  fetchCoprocessorSignatures(
    relayerUrl: string,
    payload: {
      readonly zkProof: ZKProof;
      readonly extraData: BytesHex;
    },
    options?: RelayerFetchOptions,
  ): Promise<{
    readonly handles: readonly FhevmHandle[];
    readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }>;

  fetchPublicDecrypt(
    relayerUrl: string,
    payload: {
      readonly orderedHandles: readonly FhevmHandle[];
      readonly extraData: BytesHex;
    },
    options?: RelayerFetchOptions,
  ): Promise<{
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly kmsPublicDecryptEIP712Signatures: Bytes65Hex[];
  }>;

  fetchUserDecrypt(
    relayerUrl: string,
    payload: {
      readonly handleContractPairs: ReadonlyArray<{
        readonly handle: FhevmHandle;
        readonly contractAddress: ChecksummedAddress;
      }>;
      readonly kmsUserDecryptEIP712Signer: ChecksummedAddress;
      readonly kmsUserDecryptEIP712Message: KmsUserDecryptEIP712Message;
      readonly kmsUserDecryptEIP712Signature: Bytes65Hex;
    },
    options?: RelayerFetchOptions,
  ): Promise<readonly KmsSigncryptedShare[]>;

  fetchDelegatedUserDecrypt(
    relayerUrl: string,
    payload: {
      readonly handleContractPairs: ReadonlyArray<{
        readonly handle: FhevmHandle;
        readonly contractAddress: ChecksummedAddress;
      }>;
      readonly kmsDelegatedUserDecryptEIP712Signer: ChecksummedAddress;
      readonly kmsDelegatedUserDecryptEIP712Message: KmsDelegatedUserDecryptEIP712Message;
      readonly kmsDelegatedUserDecryptEIP712Signature: Bytes65Hex;
    },
    options?: RelayerFetchOptions,
  ): Promise<readonly KmsSigncryptedShare[]>;
}
