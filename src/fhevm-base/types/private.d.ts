import type {
  Bytes,
  UintNumber,
  Bytes65Hex,
  Bytes65HexNo0x,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { FhevmHandle, KMSVerifierContractData } from './public-api';

////////////////////////////////////////////////////////////////////////////////

export interface KmsSigncryptedSharesMetadata {
  readonly kmsVerifier: KMSVerifierContractData;
  readonly eip712Signature: Bytes65Hex;
  readonly eip712SignerAddress: ChecksummedAddress;
  readonly fhevmHandles: readonly FhevmHandle[];
}

export interface KmsSigncryptedShare {
  readonly payload: BytesHexNo0x;
  readonly signature: Bytes65HexNo0x;
}

////////////////////////////////////////////////////////////////////////////////

declare const TfhePublicKeyBrand: unique symbol;
declare const TfheCrsBrand: unique symbol;

////////////////////////////////////////////////////////////////////////////////

declare const TkmsPublicKeyBrand: unique symbol;
declare const TkmsPrivateKeyBrand: unique symbol;

////////////////////////////////////////////////////////////////////////////////

export interface TfhePublicKey {
  readonly [TfhePublicKeyBrand]: never;
  readonly id: string;
}

export interface TfhePublicKeyBytes extends TfhePublicKey {
  readonly bytes: Bytes;
}

////////////////////////////////////////////////////////////////////////////////

export interface TfheCrs {
  readonly [TfheCrsBrand]: never;
  readonly id: string;
  readonly capacity: UintNumber;
}

export interface TfheCrsBytes extends TfheCrs {
  readonly bytes: Bytes;
}

////////////////////////////////////////////////////////////////////////////////

export interface TfhePublicEncryptionParams {
  readonly publicKey: TfhePublicKey;
  readonly crs: TfheCrs;
}

export interface TfhePublicEncryptionParamsBytes
  extends TfhePublicEncryptionParams {
  readonly publicKey: TfhePublicKeyBytes;
  readonly crs: TfheCrsBytes;
}

////////////////////////////////////////////////////////////////////////////////

export interface TkmsPrivateKey {
  readonly [TkmsPrivateKeyBrand]: never;
}

////////////////////////////////////////////////////////////////////////////////
