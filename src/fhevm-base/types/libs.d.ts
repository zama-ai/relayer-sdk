import type { Bytes65Hex, BytesHex } from '@base/types/primitives';
import type {
  DecryptedFhevmHandle,
  EncryptionBits,
  FheTypeId,
  FhevmHandle,
  KmsSigncryptedShares,
  ZKProof,
} from './public-api';

export type FHEPublicKey = unknown;
export type FHEPrivateKey = unknown;
export type RelayerFetchOptions = unknown;

export interface FHELib {
  parseTFHEProvenCompactCiphertextList(
    ciphertextWithZKProof: Uint8Array | string,
  ): { fheTypeIds: FheTypeId[]; encryptionBits: EncryptionBits[] };
  buildWithProofPacked(
    fhePublicKey: FHEPublicKey,
    metaData: Uint8Array,
  ): Uint8Array;
  kmsDecryptAndReconstruct(
    privateKey: FHEPrivateKey,
    shares: KmsSigncryptedShares,
  ): readonly DecryptedFhevmHandle[];
  generateKeypair(): { publicKey: FHEPublicKey; privateKey: FHEPrivateKey };
}

export interface RelayerLib {
  fetchCoprocessorSignatures(
    relayerUrl: string,
    payload: {
      zkProof: ZKProof;
      extraData: BytesHex;
    },
    options?: RelayerFetchOptions,
  ): Promise<{
    readonly handles: readonly FhevmHandle[];
    readonly signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }>;

  fetchPublicDecrypt(
    relayerUrl: string,
    payload: unknown,
    options?: RelayerFetchOptions,
  ): Promise<Record<string, unknown>>;

  fetchUserDecrypt(
    relayerUrl: string,
    payload: unknown,
    options?: RelayerFetchOptions,
  ): Promise<Record<string, unknown>>;

  fetchDelegatedUserDecrypt(
    relayerUrl: string,
    payload: unknown,
    options?: RelayerFetchOptions,
  ): Promise<Record<string, unknown>>;
}
