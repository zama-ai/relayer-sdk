import type { BytesHex } from '../../types/primitives';

/**
 * TFHE Public Key Encryption (PKE) Common Reference String (CRS) compact data with
 * raw bytes representation.
 *
 * @property id - Unique identifier for the public key provided by the relayer
 * @property capacity - The CRS capacity (always 2048 in the current configuration).
 * @property bytes - Serialized TFHE compact PKE CRS bytes
 * @property srcUrl - Optional URL from which the CRS bytes were fetched
 */
export type TFHEPksCrsBytesType = {
  id: string;
  capacity: number;
  bytes: Uint8Array;
  srcUrl?: string;
};

/**
 * TFHE Public Key Encryption (PKE) Common Reference String (CRS) compact data
 * with 0x-prefixed hex-encoded bytes representation.
 *
 * @property id - Unique identifier for the public key provided by the relayer
 * @property capacity - The CRS capacity (always 2048 in the current configuration).
 * @property bytesHex - 0x-prefixed hex-encoded serialized TFHE compact PKE CRS bytes
 * @property srcUrl - Optional URL from which the CRS bytes were fetched
 */
export type TFHEPkeCrsBytesHexType = {
  id: string;
  capacity: number;
  bytesHex: BytesHex;
  srcUrl?: string;
};

/**
 * Configuration for fetching a TFHE Public Key Encryption (PKE) Common Reference
 * String (CRS) from a remote URL.
 *
 * Typically obtained from the <relayer-url>/keyurl response, which provides
 * the URLs for fetching the data.
 *
 * @property id - Unique identifier for the CRS provided by the relayer
 * @property capacity - The CRS capacity (always 2048 in the current configuration).
 * @property srcUrl - URL from which to fetch the CRS bytes
 */
export type TFHEPkeCrsUrlType = {
  id: string;
  capacity: number;
  srcUrl: string;
};

/**
 * TFHE public key data with raw bytes representation.
 *
 * @property id - Unique identifier for the public key provided by the relayer
 * @property bytes - Serialized TFHE compact public key bytes
 * @property srcUrl - Optional URL from which the public key bytes were fetched
 */
export type TFHEPublicKeyBytesType = {
  id: string;
  bytes: Uint8Array;
  srcUrl?: string;
};

/**
 * TFHE public key data with 0x-prefixed hex-encoded bytes representation.
 *
 * @property id - Unique identifier for the public key provided by the relayer
 * @property bytesHex - 0x-prefixed hex-encoded serialized TFHE compact public key bytes
 * @property srcUrl - Optional URL from which the public key bytes were fetched
 */
export type TFHEPublicKeyBytesHexType = {
  id: string;
  bytesHex: BytesHex;
  srcUrl?: string;
};

/**
 * Configuration for fetching a TFHE public key from a remote URL.
 *
 * Typically obtained from the <relayer-url>/keyurl response, which provides
 * the URLs for fetching the data.
 *
 * @property id - Unique identifier for the public key provided by the relayer
 * @property srcUrl - URL from which to fetch the public key bytes
 */
export type TFHEPublicKeyUrlType = { id: string; srcUrl: string };

/**
 * URL configuration for fetching TFHE PKE (Public Key Encryption) parameters.
 *
 * @property publicKeyUrl - URL configuration for the TFHE compact public key
 * @property pkeCrsUrl - URL configuration for the PKE CRS (Common Reference String)
 */
export type TFHEPkeUrlsType = {
  publicKeyUrl: TFHEPublicKeyUrlType;
  pkeCrsUrl: TFHEPkeCrsUrlType;
};
