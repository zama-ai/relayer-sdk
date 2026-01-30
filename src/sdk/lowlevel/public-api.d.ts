/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BytesHex } from '@base/types/primitives';

/**
 * TFHE Public Key Encryption (PKE) Common Reference String (CRS) compact data with
 * raw bytes representation.
 */
export type TFHEPksCrsBytesType = {
  /** Unique identifier for the public key provided by the relayer */
  id: string;
  /** The CRS capacity (always 2048 in the current configuration). */
  capacity: number;
  /** Serialized TFHE compact PKE CRS bytes */
  bytes: Uint8Array;
  /** Optional URL from which the CRS bytes were fetched */
  srcUrl?: string | undefined;
};

/**
 * TFHE Public Key Encryption (PKE) Common Reference String (CRS) compact data
 * with 0x-prefixed hex-encoded bytes representation.
 */
export type TFHEPkeCrsBytesHexType = {
  /** Unique identifier for the public key provided by the relayer */
  id: string;
  /** The CRS capacity (always 2048 in the current configuration). */
  capacity: number;
  /** 0x-prefixed hex-encoded serialized TFHE compact PKE CRS bytes */
  bytesHex: BytesHex;
  /** Optional URL from which the CRS bytes were fetched */
  srcUrl?: string | undefined;
};

/**
 * Configuration for fetching a TFHE Public Key Encryption (PKE) Common Reference
 * String (CRS) from a remote URL.
 *
 * Typically obtained from the <relayer-url>/keyurl response, which provides
 * the URLs for fetching the data.
 */
export type TFHEPkeCrsUrlType = {
  /** Unique identifier for the CRS provided by the relayer */
  id: string;
  /** The CRS capacity (always 2048 in the current configuration). */
  capacity: number;
  /** URL from which to fetch the CRS bytes */
  srcUrl: string;
};

/**
 * TFHE public key data with raw bytes representation.
 */
export type TFHEPublicKeyBytesType = {
  /** Unique identifier for the public key provided by the relayer */
  id: string;
  /** Serialized TFHE compact public key bytes */
  bytes: Uint8Array;
  /** Optional URL from which the public key bytes were fetched */
  srcUrl?: string | undefined;
};

/**
 * TFHE public key data with 0x-prefixed hex-encoded bytes representation.
 */
export type TFHEPublicKeyBytesHexType = {
  /** Unique identifier for the public key provided by the relayer */
  id: string;
  /** 0x-prefixed hex-encoded serialized TFHE compact public key bytes */
  bytesHex: BytesHex;
  /** Optional URL from which the public key bytes were fetched */
  srcUrl?: string | undefined;
};

/**
 * Configuration for fetching a TFHE public key from a remote URL.
 *
 * Typically obtained from the <relayer-url>/keyurl response, which provides
 * the URLs for fetching the data.
 */
export type TFHEPublicKeyUrlType = {
  /** Unique identifier for the public key provided by the relayer */
  id: string;
  /** URL from which to fetch the public key bytes */
  srcUrl: string;
};

/**
 * URL configuration for fetching TFHE PKE (Public Key Encryption) parameters.
 */
export type TFHEPkeUrlsType = {
  /** URL configuration for the TFHE compact public key */
  publicKeyUrl: TFHEPublicKeyUrlType;
  /** URL configuration for the PKE CRS (Common Reference String) */
  pkeCrsUrl: TFHEPkeCrsUrlType;
};

/**
 * Parameters for fetching TFHE resources with retry support.
 */
export type TFHEFetchParams = {
  /** Optional fetch init options (headers, signal, etc.) */
  init?: RequestInit | undefined;
  /** Number of retry attempts on network failure (default: 3) */
  retries?: number;
  /** Delay in milliseconds between retries (default: 1000) */
  retryDelayMs?: number;
};

export type WasmObject = object;

export interface ProvenCompactCiphertextListStaticWasmType {
  constructor: { name: string };
  safe_deserialize(
    buffer: Uint8Array,
    serialized_size_limit: bigint,
  ): ProvenCompactCiphertextListWasmType;
}

export interface ProvenCompactCiphertextListWasmType {
  constructor: { name: string };
  safe_serialize(serialized_size_limit: bigint): Uint8Array;
  get_kind_of(index: number): unknown;
  is_empty(): boolean;
  len(): number;
}

export interface CompactCiphertextListBuilderWasmType {
  constructor: { name: string };
  push_boolean(value: boolean): void;
  push_u8(value: number): void;
  push_u16(value: number): void;
  push_u32(value: number): void;
  push_u64(value: bigint): void;
  push_u128(value: bigint): void;
  push_u160(value: bigint): void;
  push_u256(value: bigint): void;
  build_with_proof_packed(
    crs: CompactPkeCrsWasmType,
    metadata: Uint8Array,
    compute_load: unknown,
  ): ProvenCompactCiphertextListWasmType;
}

export interface TfheCompactPublicKeyWasmType {
  safe_serialize(serialized_size_limit: bigint): Uint8Array;
}

export interface TfheCompactPublicKeyStaticWasmType {
  constructor: { name: string };
  safe_deserialize(
    buffer: Uint8Array,
    serialized_size_limit: bigint,
  ): TfheCompactPublicKeyWasmType;
}

export interface CompactPkeCrsWasmType {
  safe_serialize(serialized_size_limit: bigint): Uint8Array;
}

export interface CompactPkeCrsStaticWasmType {
  constructor: { name: string };
  safe_deserialize(
    buffer: Uint8Array,
    serialized_size_limit: bigint,
  ): CompactPkeCrsWasmType;
}

export interface TFHEType {
  default?: (module_or_path?: any) => Promise<any>;
  TfheCompactPublicKey: TfheCompactPublicKeyStaticWasmType;
  CompactPkeCrs: CompactPkeCrsStaticWasmType;
  initThreadPool?: (num_threads: number) => Promise<any>;
  init_panic_hook: () => void;
  CompactCiphertextList: {
    builder(
      publicKey: TfheCompactPublicKeyWasmType,
    ): CompactCiphertextListBuilderWasmType;
  };
  ProvenCompactCiphertextList: ProvenCompactCiphertextListStaticWasmType;
  ZkComputeLoad: {
    Verify: unknown;
    Proof: unknown;
  };
}

export interface TKMSType {
  default?: (module_or_path?: any) => Promise<any>;
  u8vec_to_ml_kem_pke_pk(v: Uint8Array): WasmObject;
  u8vec_to_ml_kem_pke_sk(v: Uint8Array): WasmObject;
  new_client(
    server_addrs: WasmObject[],
    client_address_hex: string,
    fhe_parameter: string,
  ): WasmObject;
  new_server_id_addr(id: number, addr: string): WasmObject;
  process_user_decryption_resp_from_js(
    client: WasmObject,
    request: any,
    eip712_domain: any,
    agg_resp: any,
    enc_pk: WasmObject,
    enc_sk: WasmObject,
    verify: boolean,
  ): TypedPlaintextWasmType[];
  ml_kem_pke_keygen(): WasmObject;
  ml_kem_pke_pk_to_u8vec(pk: WasmObject): Uint8Array;
  ml_kem_pke_sk_to_u8vec(sk: WasmObject): Uint8Array;
  ml_kem_pke_get_pk(sk: WasmObject): WasmObject;
}

export interface TypedPlaintextWasmType {
  bytes: Uint8Array;
  fhe_type: number;
}

export type TFHEPksCrsWasmType = {
  id: string;
  capacity: number;
  wasm: CompactPkeCrsWasmType;
  srcUrl?: string | undefined;
};

export type TFHEPublicKeyWasmType = {
  id: string;
  wasm: TfheCompactPublicKeyWasmType;
  srcUrl?: string | undefined;
};
