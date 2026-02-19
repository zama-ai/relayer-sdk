import type {
  Bytes65Hex,
  Bytes65HexNo0x,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { FhevmHandle, KMSVerifierContractData } from './public-api';

export interface KmsSigncryptedSharesMetadata {
  readonly kmsVerifier: KMSVerifierContractData;
  readonly eip712Signature: Bytes65Hex;
  readonly eip712SignerAddress: ChecksummedAddress;
  readonly fhevmHandles: readonly FhevmHandle[];
}

export interface KmsSigncryptedShare {
  readonly payload: BytesHexNo0x; // signcrypted share: a bunch of bytes that contains
  readonly signature: Bytes65HexNo0x;
}
