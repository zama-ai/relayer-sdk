import type {
  Bytes32Hex,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { Auth } from '@relayer-provider/types/public-api';
import type { Eip1193Provider } from 'ethers';
import type { Prettify } from '@base/types/utils';

export type FhevmInstanceOptions = {
  auth?: Auth;
  debug?: boolean;
};

export type PublicParams<T> = {
  2048: { publicParams: T; publicParamsId: string };
};

export type FhevmInstanceConfig = Prettify<
  {
    verifyingContractAddressDecryption: string;
    verifyingContractAddressInputVerification: string;
    kmsContractAddress: string;
    inputVerifierContractAddress: string;
    aclContractAddress: string;
    gatewayChainId: number;
    relayerUrl: string;
    network: Eip1193Provider | string;
    chainId: number;
    batchRpcCalls?: boolean;
    relayerRouteVersion?: 1 | 2;
  } & Partial<FhevmPkeConfigType> &
    FhevmInstanceOptions
>;

/**
 * The FHEVM TFHE Compact public key.
 */
export type FhevmPublicKeyType = {
  /** The TFHE compact public key as raw bytes. */
  data: Uint8Array;
  /** A server-assigned identifier for the key (not required for cryptographic operations). */
  id: string;
};

/**
 * The FHEVM TFHE Compact PKE (Public Key Encryption) CRS (Common Reference String).
 * For more info about CRS see: https://docs.zama.org/tfhe-rs/fhe-computation/advanced-features/zk-pok
 */
export type FhevmPkeCrsType = {
  /** The TFHE compact pke crs as raw bytes. */
  publicParams: Uint8Array;
  /** A server-assigned identifier for the key (not required for cryptographic operations). */
  publicParamsId: string;
};

/**
 * TFHE Compact PKE CRS parameters indexed by maximum encryption capacity in bits.
 *
 * The key (e.g., 2048) represents the maximum number of plaintext bits that can be
 * encrypted together in a single compact list. When encrypting multiple values,
 * choose a CRS configuration that supports at least the total bit count of all values.
 * Note that a boolean needs 2 encryption bits instead of 1.
 *
 * Currently only 2048-bit capacity is supported.
 * @see {@link FhevmPkeCrsType}
 */
export type FhevmPkeCrsByCapacityType = {
  2048: FhevmPkeCrsType;
};

/**
 * Complete FHEVM public key encryption (PKE) configuration.
 *
 * Contains the TFHE compact public key and the associated PKE CRS parameters
 * required for encrypting values on the client side.
 * @see {@link FhevmPublicKeyType}
 * @see {@link FhevmPkeCrsByCapacityType}
 */
export type FhevmPkeConfigType = {
  /** The TFHE compact public key used for encryption. */
  publicKey: FhevmPublicKeyType;
  /** PKE CRS parameters indexed by encryption capacity. */
  publicParams: FhevmPkeCrsByCapacityType;
};

////////////////////////////////////////////////////////////////////////////////
// ClearValues
////////////////////////////////////////////////////////////////////////////////

export type ClearValueType = bigint | boolean | `0x${string}`;
export type ClearValues = Readonly<Record<`0x${string}`, ClearValueType>>;
export type UserDecryptResults = ClearValues;
export type PublicDecryptResults = Readonly<{
  clearValues: ClearValues;
  abiEncodedClearValues: `0x${string}`;
  decryptionProof: `0x${string}`;
}>;

export type HandleContractPair = {
  handle: Uint8Array | string;
  contractAddress: string;
};
