import type {
  Bytes,
  ChecksummedAddress,
  Uint64BigInt,
} from '@base/types/primitives';
import type { EncryptionBits, FhevmHandle } from '@fhevm-base/types/public-api';

////////////////////////////////////////////////////////////////////////////////
//
// ZKProof
//
////////////////////////////////////////////////////////////////////////////////

export interface ZKProofLike {
  readonly chainId: bigint | number;
  readonly aclContractAddress: string;
  readonly contractAddress: string;
  readonly userAddress: string;
  readonly ciphertextWithZKProof: Uint8Array | string;
  readonly encryptionBits?: readonly number[];
}

export interface ZKProof {
  readonly chainId: Uint64BigInt;
  readonly aclContractAddress: ChecksummedAddress;
  readonly contractAddress: ChecksummedAddress;
  readonly userAddress: ChecksummedAddress;
  readonly ciphertextWithZKProof: Bytes;
  readonly encryptionBits: readonly EncryptionBits[];
  getUnsafeRawBytes(): Bytes;
  getFhevmHandles(): FhevmHandle[];
}

////////////////////////////////////////////////////////////////////////////////
// Keypair
////////////////////////////////////////////////////////////////////////////////

export interface Keypair<T> {
  publicKey: T;
  privateKey: T;
}

export declare const KmsSigncryptedSharesBrand: unique symbol;
export interface KmsSigncryptedShares {
  readonly [KmsSigncryptedSharesBrand]: never;
}
