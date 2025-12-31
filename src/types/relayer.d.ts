import type { Prettify } from '../utils/types';
import type { Bytes32Hex, BytesHex, ChecksummedAddress } from './primitives';

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

export type RelayerOperation =
  | 'INPUT_PROOF'
  | 'PUBLIC_DECRYPT'
  | 'USER_DECRYPT'
  | 'KEY_URL';

export type RelayerGetOperation = 'KEY_URL';
export type RelayerPostOperation = Exclude<
  RelayerOperation,
  RelayerGetOperation
>;

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/public_decrypt_http_listener.rs#L19
export type RelayerPublicDecryptPayload = {
  ciphertextHandles: `0x${string}`[];
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/input_http_listener.rs#L17
export type RelayerInputProofPayload = {
  // Hex encoded uint256 string without prefix
  contractChainId: `0x${string}`;
  // Hex encoded address with 0x prefix.
  contractAddress: `0x${string}`;
  // Hex encoded address with 0x prefix.
  userAddress: `0x${string}`;
  // List of hex encoded binary proof without 0x prefix
  ciphertextWithInputVerification: string;
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L33
export type HandleContractPairRelayer = {
  // Hex encoded bytes32 with 0x prefix.
  handle: `0x${string}`;
  // Hex encoded address with 0x prefix.
  contractAddress: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L20
export type RelayerUserDecryptPayload = {
  handleContractPairs: HandleContractPairRelayer[];
  requestValidity: {
    // Number as a string
    startTimestamp: string;
    // Number as a string
    durationDays: string;
  };
  // Number as a string
  contractsChainId: string;
  // List of hex encoded addresses with 0x prefix
  contractAddresses: `0x${string}`[];
  // Hex encoded address with 0x prefix.
  userAddress: `0x${string}`;
  // Hex encoded signature without 0x prefix.
  signature: string;
  // Hex encoded key without 0x prefix.
  publicKey: string;
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

export type RelayerPublicDecryptResult = {
  signatures: BytesHexNo0x[];
  decryptedValue: BytesHexNo0x;
  extraData: BytesHex;
};

/*
 * [
 *   {
 *     signature: '69e7e040cab157aa819015b321c012dccb1545ffefd325b359b492653f0347517e28e66c572cdc299e259024329859ff9fcb0096e1ce072af0b6e1ca1fe25ec6',
 *     payload: '0100000029...',
 *     extra_data: '01234...',
 *   }
 * ]
 */
export type RelayerUserDecryptResult = {
  payload: BytesHexNo0x;
  signature: BytesHexNo0x;
  //extraData: BytesHex;
}[];

export type RelayerInputProofResult = {
  // Ordered List of hex encoded handles with 0x prefix.
  handles: Bytes32Hex[];
  // Attestation signatures for Input verification for the ordered list of handles with 0x prefix.
  signatures: BytesHex[];
};

export type ClearValueType = bigint | boolean | ChecksummedAddress;
export type ClearValues = Record<Bytes32Hex, ClearValueType>;
export type UserDecryptResults = ClearValues;
export type PublicDecryptResults = {
  clearValues: ClearValues;
  abiEncodedClearValues: BytesHex;
  decryptionProof: BytesHex;
};

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
