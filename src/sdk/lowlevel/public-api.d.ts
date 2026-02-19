/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Bytes,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type {
  EncryptionBits,
  KmsEIP712Domain,
} from '@fhevm-base/types/public-api';
import type { Keypair, ZKProof } from '../types/public-api';

/**
 * TFHE Public Key Encryption (PKE) Common Reference String (CRS) compact data with
 * raw bytes representation.
 */
export type TFHEPkeCrsBytes = {
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
export type TFHEPkeCrsBytesHex = {
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
export type TFHEPkeCrsUrl = {
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
export type TFHEPublicKeyBytes = {
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
export type TFHEPublicKeyBytesHex = {
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
export type TFHEPublicKeyUrl = {
  /** Unique identifier for the public key provided by the relayer */
  id: string;
  /** URL from which to fetch the public key bytes */
  srcUrl: string;
};

/**
 * URL configuration for fetching TFHE PKE (Public Key Encryption) parameters.
 */
export type TFHEPkeUrls = {
  /** URL configuration for the TFHE compact public key */
  publicKeyUrl: TFHEPublicKeyUrl;
  /** URL configuration for the PKE CRS (Common Reference String) */
  pkeCrsUrl: TFHEPkeCrsUrl;
};

/**
 * Parameters for fetching TFHE resources with retry support.
 */
export type TFHEFetchParams = {
  /** Optional fetch init options (headers, signal, etc.) */
  init?: RequestInit | undefined;
  /** Number of retry attempts on network failure (default: 3) */
  retries?: number | undefined;
  /** Delay in milliseconds between retries (default: 1000) */
  retryDelayMs?: number | undefined;
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
  free(): void;
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
  free(): void;
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
    Verify: number;
    Proof: number;
  };
}

declare const PrivateEncKeyMlKem512WasmTypeBrand: unique symbol;
declare const PublicEncKeyMlKem512WasmTypeBrand: unique symbol;
declare const ServerIdAddrWasmTypeBrand: unique symbol;
declare const ClientWasmTypeBrand: unique symbol;

export interface PrivateEncKeyMlKem512WasmType {
  readonly [PrivateEncKeyMlKem512WasmTypeBrand]: never;
  free(): void;
}

export interface PublicEncKeyMlKem512WasmType {
  readonly [PublicEncKeyMlKem512WasmTypeBrand]: never;
  free(): void;
}

export interface ServerIdAddrWasmType {
  readonly [ServerIdAddrWasmTypeBrand]: never;
  free(): void;
}

export interface ClientWasmType {
  readonly [ClientWasmTypeBrand]: never;
  free(): void;
}

export type KmsEIP712DomainWasmType = Readonly<
  Omit<KmsEIP712Domain, 'chainId' | 'verifyingContract'> & {
    readonly chain_id: Uint8Array;
    readonly verifying_contract: ChecksummedAddress;
    readonly salt: null;
  }
>;

export interface TKMSType {
  default?: (module_or_path?: any) => Promise<any>;
  u8vec_to_ml_kem_pke_pk(v: Uint8Array): PublicEncKeyMlKem512WasmType;
  u8vec_to_ml_kem_pke_sk(v: Uint8Array): PrivateEncKeyMlKem512WasmType;
  new_client(
    server_addrs: ServerIdAddrWasmType[],
    client_address_hex: string,
    fhe_parameter: string,
  ): ClientWasmType;
  new_server_id_addr(id: number, addr: string): ServerIdAddrWasmType;
  process_user_decryption_resp_from_js(
    client: ClientWasmType,
    request: any,
    eip712_domain: KmsEIP712DomainWasmType,
    agg_resp: any,
    enc_pk: PublicEncKeyMlKem512WasmType,
    enc_sk: PrivateEncKeyMlKem512WasmType,
    verify: boolean,
  ): TypedPlaintextWasmType[];
  ml_kem_pke_keygen(): PrivateEncKeyMlKem512WasmType;
  ml_kem_pke_pk_to_u8vec(pk: PublicEncKeyMlKem512WasmType): Uint8Array;
  ml_kem_pke_sk_to_u8vec(sk: PrivateEncKeyMlKem512WasmType): Uint8Array;
  ml_kem_pke_get_pk(
    sk: PrivateEncKeyMlKem512WasmType,
  ): PublicEncKeyMlKem512WasmType;
}

export interface TypedPlaintextWasmType {
  bytes: Uint8Array;
  fhe_type: number;
}

export type TFHEPkeCrsWasmType = {
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

interface TKMSPkeKeypair extends Keypair<BytesHexNo0x> {
  readonly publicKey: BytesHexNo0x;
  readonly privateKey: BytesHexNo0x;

  toBytesHex(): Keypair<BytesHex>;
  toBytesHexNo0x(): Keypair<BytesHexNo0x>;
  toBytes(): Keypair<Bytes>;
  verify(): void;
}

/**
 * Builder for constructing TFHE zero-knowledge proofs.
 *
 * Accumulates encrypted values via `add*` methods, then generates
 * a ZK proof with {@link TFHEZKProofBuilder.generateZKProof | generateZKProof}.
 */
interface TFHEZKProofBuilder {
  readonly count: number;
  readonly totalBits: number;
  getBits(): readonly EncryptionBits[];
  addBool(value: unknown): this;
  addUint8(value: unknown): this;
  addUint16(value: unknown): this;
  addUint32(value: unknown): this;
  addUint64(value: unknown): this;
  addUint128(value: unknown): this;
  addUint256(value: unknown): this;
  addAddress(value: unknown): this;
  /**
   * Generates the ZK proof from the accumulated encrypted values.
   *
   * **CPU-intensive** — proof generation runs WASM cryptographic operations
   * that can take several seconds depending on the number and size of inputs.
   */
  generateZKProof(args: {
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly aclContractAddress: string;
    readonly chainId: number | bigint;
  }): ZKProof;
}

export interface TFHEPkeCrs {
  readonly id: string;
  readonly srcUrl: string | undefined;

  supportsCapacity(capacity: number): boolean;
  getWasmForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    wasm: CompactPkeCrsWasmType;
  };
  getBytesForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    bytes: Uint8Array;
  };
  toBytes(): TFHEPkeCrsBytes;
}

export interface TFHEPublicKey {
  readonly id: string;
  readonly srcUrl: string | undefined;
  readonly tfheCompactPublicKeyWasm: TfheCompactPublicKeyWasmType;

  toBytes(): TFHEPublicKeyBytes;
}

export interface TFHEPkeParams {
  readonly tfhePublicKey: TFHEPublicKey;
  readonly tfhePkeCrs: TFHEPkeCrs;
}
