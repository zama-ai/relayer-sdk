import type { Prettify } from '@base/types/utils';
import type {
  Bytes32Hex,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type { Eip1193Provider } from 'ethers';

/**
 * Bearer Token Authentication
 */
export type BearerToken = {
  __type: 'BearerToken';
  /**
   * The Bearer token.
   */
  token: string;
};

/**
 * Custom header authentication
 */
export type ApiKeyHeader = {
  __type: 'ApiKeyHeader';
  /**
   * The header name. The default value is `x-api-key`.
   */
  header?: string;
  /**
   * The API key.
   */
  value: string;
};

/**
 * Custom cookie authentication
 */
export type ApiKeyCookie = {
  __type: 'ApiKeyCookie';
  /**
   * The cookie name. The default value is `x-api-key`.
   */
  cookie?: string;
  /**
   * The API key.
   */
  value: string;
};

export type Auth = BearerToken | ApiKeyHeader | ApiKeyCookie;

export type FhevmInstanceOptions = {
  auth?: Auth;
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
    chainId?: number;
  } & Partial<FhevmPkeConfigType> &
    FhevmInstanceOptions
>;

/**
 * The FHEVM TFHE Compact public key.
 * @property data - The TFHE compact public key as raw bytes.
 * @property id - A server-assigned identifier for the key (not required for cryptographic operations).
 */
export type FhevmPublicKeyType = {
  data: Uint8Array;
  id: string;
};

/**
 * The FHEVM TFHE Compact PKE (Public Key Encryption) CRS (Common Reference String).
 * For more info about CRS see: https://docs.zama.org/tfhe-rs/fhe-computation/advanced-features/zk-pok
 * @property publicParams - The TFHE compact pke crs as raw bytes.
 * @property publicParamsId - A server-assigned identifier for the key (not required for cryptographic operations).
 */
export type FhevmPkeCrsType = {
  publicParams: Uint8Array;
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
 *
 * @property publicKey - The TFHE compact public key used for encryption.
 * @property publicParams - PKE CRS parameters indexed by encryption capacity.
 */
export type FhevmPkeConfigType = {
  publicKey: FhevmPublicKeyType;
  publicParams: FhevmPkeCrsByCapacityType;
};

////////////////////////////////////////////////////////////////////////////////
// ClearValues
////////////////////////////////////////////////////////////////////////////////

export type ClearValueType = bigint | boolean | ChecksummedAddress;
export type ClearValues = Record<Bytes32Hex, ClearValueType>;
export type UserDecryptResults = ClearValues;
export type PublicDecryptResults = {
  clearValues: ClearValues;
  abiEncodedClearValues: BytesHex;
  decryptionProof: BytesHex;
};

export type HandleContractPair = {
  handle: Uint8Array | string;
  contractAddress: string;
};
