import type {
  Bytes21Hex,
  Bytes32,
  Bytes32Hex,
  ChecksummedAddress,
  EncryptionBits,
  FheTypeId,
  FheTypeName,
  SolidityPrimitiveTypeName,
  Uint64,
  Uint64BigInt,
} from '@base/types/primitives';
import type { ZKProof } from './ZKProof';
import { keccak256 } from 'ethers';
import {
  assertIsChecksummedAddress,
  checksummedAddressToBytes20,
} from '@base/address';
import {
  assertIsBytes32,
  bytesToHex,
  concatBytes,
  hexToBytes,
  isBytes,
  isBytes32,
  isBytes32Hex,
  isBytesHex,
} from '@base/bytes';
import {
  assertIsUint64,
  assertIsUint8,
  isUint64,
  uint64ToBytes32,
} from '@base/uint';
import { assertRelayer } from '../errors/InternalError';
import { FhevmHandleError } from '../errors/FhevmHandleError';
import {
  encryptionBitsFromFheTypeId,
  fheTypeIdFromEncryptionBits,
  fheTypeNameFromId,
  isFheTypeId,
  solidityPrimitiveTypeNameFromFheTypeId,
} from './FheType';

////////////////////////////////////////////////////////////////////////////////
// FhevmHandle
////////////////////////////////////////////////////////////////////////////////

export class FhevmHandle {
  //////////////////////////////////////////////////////////////////////////////
  // Instance Properties
  //////////////////////////////////////////////////////////////////////////////

  readonly #hash21: Bytes21Hex;
  readonly #chainId: Uint64BigInt;
  readonly #fheTypeId: FheTypeId;
  readonly #version: number;
  readonly #computed: boolean;
  readonly #index?: number;
  #handleBytes32Hex: Bytes32Hex | undefined;
  #handleBytes32: Bytes32 | undefined;

  //////////////////////////////////////////////////////////////////////////////
  // Static Constants
  //////////////////////////////////////////////////////////////////////////////

  public static readonly RAW_CT_HASH_DOMAIN_SEPARATOR = 'ZK-w_rct';
  public static readonly HANDLE_HASH_DOMAIN_SEPARATOR = 'ZK-w_hdl';
  public static readonly CURRENT_CIPHERTEXT_VERSION = 0;

  //////////////////////////////////////////////////////////////////////////////
  // Constructor
  //////////////////////////////////////////////////////////////////////////////

  private constructor({
    hash21,
    chainId,
    fheTypeId,
    version,
    computed,
    index,
    handleBytes32,
    handleBytes32Hex,
  }: {
    hash21: Bytes21Hex;
    chainId: number | bigint;
    fheTypeId: FheTypeId;
    version: number;
    computed: boolean;
    index?: number | undefined;
    handleBytes32?: Bytes32 | undefined;
    handleBytes32Hex?: Bytes32Hex | undefined;
  }) {
    if (!isUint64(chainId)) {
      throw new FhevmHandleError({
        message: 'ChainId must be a uint64',
      });
    }
    if (!isBytesHex(hash21, 21)) {
      throw new FhevmHandleError({ message: 'Hash21 should be 21 bytes long' });
    }

    this.#handleBytes32 = handleBytes32;
    this.#handleBytes32Hex = handleBytes32Hex;
    this.#hash21 = hash21;
    this.#chainId = BigInt(chainId);
    this.#fheTypeId = fheTypeId;
    this.#version = version;
    this.#computed = computed;
    if (index !== undefined) {
      this.#index = index;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Instance Getters
  //////////////////////////////////////////////////////////////////////////////

  public get hash21(): Bytes21Hex {
    return this.#hash21;
  }

  public get chainId(): Uint64BigInt {
    return this.#chainId;
  }

  public get fheTypeId(): FheTypeId {
    return this.#fheTypeId;
  }

  public get fheTypeName(): FheTypeName {
    return fheTypeNameFromId(this.#fheTypeId);
  }

  public get version(): number {
    return this.#version;
  }

  public get computed(): boolean {
    return this.#computed;
  }

  public get index(): number | undefined {
    return this.#index;
  }

  public get encryptionBits(): EncryptionBits {
    return encryptionBitsFromFheTypeId(this.#fheTypeId);
  }

  public get solidityPrimitiveTypeName(): SolidityPrimitiveTypeName {
    return solidityPrimitiveTypeNameFromFheTypeId(this.#fheTypeId);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
  public toJSON() {
    return {
      handle: this.toBytes32Hex(),
      fheTypeName: this.fheTypeName,
      fheTypeId: this.fheTypeId,
      chainId: this.chainId,
      index: this.index,
      computed: this.computed,
      encryptionBits: this.encryptionBits,
      version: this.version,
      solidityPrimitiveTypeName: this.solidityPrimitiveTypeName,
      hash21: this.hash21,
    };
  }

  public equals(to: FhevmHandle): boolean {
    return (
      this.#hash21 === to.#hash21 &&
      this.#chainId === to.#chainId &&
      this.#fheTypeId === to.#fheTypeId &&
      this.#version === to.#version &&
      this.#computed === to.#computed &&
      this.#index === to.#index
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // Instance Serialization
  //////////////////////////////////////////////////////////////////////////////

  public toBytes32(): Bytes32 {
    if (this.#handleBytes32 === undefined) {
      assertRelayer(
        (this.#index === undefined && this.#computed) ||
          (this.#index !== undefined && this.#index < 255 && !this.#computed),
      );

      const chainId32Bytes = uint64ToBytes32(this.#chainId);
      const chainId8Bytes = chainId32Bytes.subarray(24, 32);

      const handleHash21 = hexToBytes(this.#hash21);
      assertRelayer(handleHash21.length === 21);

      const handleBytes32AsBytes = new Uint8Array(32);
      handleBytes32AsBytes.set(handleHash21, 0);
      handleBytes32AsBytes[21] = this.#index === undefined ? 255 : this.#index;
      handleBytes32AsBytes.set(chainId8Bytes, 22);
      handleBytes32AsBytes[30] = this.#fheTypeId;
      handleBytes32AsBytes[31] = this.#version;
      this.#handleBytes32 = handleBytes32AsBytes;
    }

    return this.#handleBytes32;
  }

  public toBytes32Hex(): Bytes32Hex {
    if (this.#handleBytes32Hex === undefined) {
      this.#handleBytes32Hex = bytesToHex(this.toBytes32());
    }
    return this.#handleBytes32Hex;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Static Factory Methods
  //////////////////////////////////////////////////////////////////////////////

  public static fromComponents(params: {
    hash21: Bytes21Hex;
    chainId: number | bigint;
    fheTypeId: FheTypeId;
    version: number;
    computed: boolean;
    index?: number | undefined;
  }): FhevmHandle {
    return new FhevmHandle(params);
  }

  public static from(handle: unknown): FhevmHandle {
    if (handle instanceof FhevmHandle) {
      return handle;
    }
    if (typeof handle === 'string') {
      return FhevmHandle.fromBytes32Hex(handle);
    }
    if (isBytes(handle)) {
      return FhevmHandle.fromBytes32(handle);
    }
    throw new FhevmHandleError({
      message: `FHEVM Handle must be a Uint8Array or a string.`,
    });
  }

  public static fromBytes32(handle: unknown): FhevmHandle {
    if (!isBytes32(handle)) {
      throw new FhevmHandleError({
        message: `FHEVM Handle is not a valid bytes32 array.`,
      });
    }

    const bytes: Uint8Array = handle;

    // Extract hash21 (bytes 0-20)
    const hash21 = bytesToHex(bytes.slice(0, 21));

    // Extract index (byte 21) - 255 means computed
    const indexByte = bytes[21];
    const computed = indexByte === 255;
    const index = computed ? undefined : indexByte;

    // Extract chainId (bytes 22-29, 8 bytes as big-endian uint64)
    let chainId = 0;
    for (let i = 22; i < 30; i++) {
      chainId = chainId * 256 + bytes[i];
    }

    // Extract fheTypeId (byte 30)
    const fheTypeIdByte = bytes[30];
    if (!isFheTypeId(fheTypeIdByte)) {
      throw new FhevmHandleError({
        handle,
        message: `FHEVM Handle "${handle}" is invalid. Unknown FheType: ${fheTypeIdByte}`,
      });
    }

    // Extract version (byte 31)
    const version = bytes[31];

    return new FhevmHandle({
      hash21,
      chainId,
      fheTypeId: fheTypeIdByte,
      version,
      computed,
      index,
      handleBytes32: handle,
    });
  }

  public static fromBytes32Hex(handle: unknown): FhevmHandle {
    if (!isBytes32Hex(handle)) {
      throw new FhevmHandleError({ handle });
    }

    const bytes: Uint8Array = hexToBytes(handle);

    const h = FhevmHandle.fromBytes32(bytes);
    h.#handleBytes32Hex = handle;

    return h;
  }

  public static fromZKProof(zkProof: ZKProof, version: number): FhevmHandle[] {
    assertIsUint8(version);

    const fheTypeIds = zkProof.encryptionBits.map((w) =>
      fheTypeIdFromEncryptionBits(w),
    );

    assertIsUint8(fheTypeIds.length);

    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(
      FhevmHandle.RAW_CT_HASH_DOMAIN_SEPARATOR,
    );

    const blobHashBytes32Hex: Bytes32Hex = keccak256(
      concatBytes(domainSepBytes, zkProof.ciphertextWithZKProof),
    ) as Bytes32Hex;

    const handles: FhevmHandle[] = [];
    for (let i = 0; i < fheTypeIds.length; ++i) {
      const hash21 = FhevmHandle._computeInputHash21(
        hexToBytes(blobHashBytes32Hex),
        zkProof.aclContractAddress,
        zkProof.chainId,
        i,
      );
      handles.push(
        new FhevmHandle({
          hash21,
          chainId: zkProof.chainId,
          fheTypeId: fheTypeIds[i],
          version,
          computed: false,
          index: i,
        }),
      );
    }
    return handles;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Static Parsing
  //////////////////////////////////////////////////////////////////////////////

  public static parse(handle: unknown): FhevmHandle {
    if (isBytes(handle)) {
      return FhevmHandle.fromBytes32(handle);
    }
    return FhevmHandle.fromBytes32Hex(handle);
  }

  public static canParse(handle: unknown): boolean {
    try {
      FhevmHandle.parse(handle);
      return true;
    } catch {
      return false;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Static Assertions
  //////////////////////////////////////////////////////////////////////////////

  public static assertIsHandleHex(
    handle: unknown,
  ): asserts handle is Bytes32Hex {
    if (typeof handle !== 'string') {
      throw new FhevmHandleError({
        message: 'Invalid bytes32 hexadecimal string',
      });
    }
    if (!FhevmHandle.canParse(handle)) {
      throw new FhevmHandleError({ handle });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Static Helpers
  //////////////////////////////////////////////////////////////////////////////

  public static currentCiphertextVersion(): number {
    return FhevmHandle.CURRENT_CIPHERTEXT_VERSION;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private Helpers
  //////////////////////////////////////////////////////////////////////////////

  /**
   * blobHashBytes32 = keccak256(ciphertextWithZKProof)
   */
  private static _computeInputHash21(
    blobHashBytes32: Bytes32,
    aclAddress: ChecksummedAddress,
    chainId: Uint64,
    index: number,
  ): Bytes21Hex {
    /*
        https://github.com/zama-ai/fhevm/blob/8ffbd5906ab3d57af178e049930e3fc065c9d4b3/coprocessor/fhevm-engine/zkproof-worker/src/verifier.rs#L431C7-L431C8

        handle_hash = Bytes("ZK-w_hdl") + blobHash 32 Bytes + index 1 Byte + aclAddress 20 Bytes + chainId 32 bytes
        ===========================================================================================================

        const HANDLE_HASH_DOMAIN_SEPARATOR: [u8; 8] = *b"ZK-w_hdl";

        let mut handle_hash = Keccak256::new();
        handle_hash.update(HANDLE_HASH_DOMAIN_SEPARATOR);
        handle_hash.update(blob_hash);
        handle_hash.update([ct_idx as u8]);
        handle_hash.update(
            Address::from_str(&aux_data.acl_contract_address)
                .expect("valid acl_contract_address")
                .into_array(),
        );
        handle_hash.update(chain_id_bytes);
        let mut handle = handle_hash.finalize().to_vec();
        assert_eq!(handle.len(), 32);

    */
    assertIsBytes32(blobHashBytes32);
    assertIsChecksummedAddress(aclAddress);
    assertIsUint8(index);
    assertIsUint64(chainId);

    const encryptionIndexByte1 = new Uint8Array([index]);
    const aclContractAddressBytes20 = checksummedAddressToBytes20(aclAddress);
    const chainIdBytes32 = uint64ToBytes32(chainId);

    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(
      FhevmHandle.HANDLE_HASH_DOMAIN_SEPARATOR,
    );

    const hashBytes32Hex = keccak256(
      concatBytes(
        domainSepBytes,
        blobHashBytes32,
        encryptionIndexByte1,
        aclContractAddressBytes20,
        chainIdBytes32,
      ),
    ) as Bytes32Hex;

    // Truncate to 21 bytes (0x + 42 hex chars)
    return hashBytes32Hex.slice(0, 2 + 2 * 21) as Bytes21Hex;
  }
}
