import { TFHE as TFHEModule } from './wasm-modules';
import type { TFHEPkeParams } from './public-api';
import type {
  CompactCiphertextListBuilderWasmType,
  ProvenCompactCiphertextListWasmType,
  TFHEZKProofBuilder,
} from './public-api';
import type { EncryptionBits, FheTypeName } from '@fhevm-base/types/public-api';
import type { Bytes20, Bytes32 } from '@base/types/primitives';
import type { ZKProof } from '../types/public-api';
import { EncryptionError } from '../errors/EncryptionError';
import { assert } from '@base/errors/InternalError';
import {
  isUint128,
  isUint16,
  isUint256,
  isUint32,
  isUint64,
  isUint8,
  MAX_UINT16,
  MAX_UINT32,
  MAX_UINT8,
  uint256ToBytes32,
} from '@base/uint';
import { encryptionBitsFromFheTypeName } from '@fhevm-base/FheType';
import { isChecksummedAddress } from '@base/address';
import { hexToBytes20 } from '@base/bytes';
import {
  SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
  TFHE_CRS_BITS_CAPACITY,
  TFHE_ZKPROOF_CIPHERTEXT_CAPACITY,
} from './constants';
import { createZKProof } from '../ZKProof';

////////////////////////////////////////////////////////////////////////////////
// TFHEZKProofBuilder
////////////////////////////////////////////////////////////////////////////////

class TFHEZKProofBuilderImpl implements TFHEZKProofBuilder {
  #totalBits: number = 0;
  #disposed: boolean = false;
  readonly #bits: EncryptionBits[] = [];
  readonly #bitsCapacity: number = TFHE_CRS_BITS_CAPACITY;
  readonly #ciphertextCapacity: number = TFHE_ZKPROOF_CIPHERTEXT_CAPACITY;
  readonly #fheCompactCiphertextListBuilderWasm: CompactCiphertextListBuilderWasmType;
  readonly #pkeParams: TFHEPkeParams;

  constructor(params: { readonly pkeParams: TFHEPkeParams }) {
    this.#pkeParams = params.pkeParams;
    this.#fheCompactCiphertextListBuilderWasm =
      TFHEModule.CompactCiphertextList.builder(
        this.#pkeParams.tfhePublicKey.tfheCompactPublicKeyWasm,
      );
    assert(this.#pkeParams.tfhePkeCrs.supportsCapacity(this.#bitsCapacity));
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API
  //////////////////////////////////////////////////////////////////////////////

  public get count(): number {
    return this.#bits.length;
  }

  public get totalBits(): number {
    return this.#totalBits;
  }

  public getBits(): EncryptionBits[] {
    return [...this.#bits];
  }

  public addBool(value: unknown): this {
    if (value === null || value === undefined) {
      throw new EncryptionError({ message: 'Missing value' });
    }
    if (
      typeof value !== 'boolean' &&
      typeof value !== 'number' &&
      typeof value !== 'bigint'
    ) {
      throw new EncryptionError({
        message: 'The value must be a boolean, a number or a bigint.',
      });
    }
    const num = Number(value);
    if (num !== 0 && num !== 1) {
      throw new EncryptionError({
        message: 'The value must be true, false, 0 or 1.',
      });
    }
    this.#addType('ebool');
    this.#fheCompactCiphertextListBuilderWasm.push_boolean(num === 1);
    return this;
  }

  public addUint8(value: unknown): this {
    if (!isUint8(value)) {
      throw new EncryptionError({
        message: `The value must be a number or bigint in uint8 range (0-${String(MAX_UINT8)}).`,
      });
    }
    this.#addType('euint8');
    this.#fheCompactCiphertextListBuilderWasm.push_u8(Number(value));
    return this;
  }

  public addUint16(value: unknown): this {
    if (!isUint16(value)) {
      throw new EncryptionError({
        message: `The value must be a number or bigint in uint16 range (0-${String(MAX_UINT16)}).`,
      });
    }
    this.#addType('euint16');
    this.#fheCompactCiphertextListBuilderWasm.push_u16(Number(value));
    return this;
  }

  public addUint32(value: unknown): this {
    if (!isUint32(value)) {
      throw new EncryptionError({
        message: `The value must be a number or bigint in uint32 range (0-${String(MAX_UINT32)}).`,
      });
    }
    this.#addType('euint32');
    this.#fheCompactCiphertextListBuilderWasm.push_u32(Number(value));
    return this;
  }

  public addUint64(value: unknown): this {
    if (!isUint64(value)) {
      throw new EncryptionError({
        message: `The value must be a number or bigint in uint64 range.`,
      });
    }
    this.#addType('euint64');
    this.#fheCompactCiphertextListBuilderWasm.push_u64(BigInt(value));
    return this;
  }

  public addUint128(value: unknown): this {
    if (!isUint128(value)) {
      throw new EncryptionError({
        message: `The value must be a number or bigint in uint128 range.`,
      });
    }
    this.#addType('euint128');
    this.#fheCompactCiphertextListBuilderWasm.push_u128(BigInt(value));
    return this;
  }

  public addUint256(value: unknown): this {
    if (!isUint256(value)) {
      throw new EncryptionError({
        message: `The value must be a number or bigint in uint256 range.`,
      });
    }
    this.#addType('euint256');
    this.#fheCompactCiphertextListBuilderWasm.push_u256(BigInt(value));
    return this;
  }

  public addAddress(value: unknown): this {
    if (!isChecksummedAddress(value)) {
      throw new EncryptionError({
        message: `The value must be a valid checksummed address.`,
      });
    }
    this.#addType('eaddress');
    this.#fheCompactCiphertextListBuilderWasm.push_u160(BigInt(value));
    return this;
  }

  public generateZKProof({
    contractAddress,
    userAddress,
    aclContractAddress,
    chainId,
  }: {
    contractAddress: string;
    userAddress: string;
    aclContractAddress: string;
    chainId: number | bigint;
  }): ZKProof {
    this.#assertNotDisposed();

    if (this.#totalBits === 0) {
      throw new EncryptionError({
        message: `Encrypted input must contain at least one value`,
      });
    }

    // should be guaranteed at this point
    assert(this.#totalBits <= this.#bitsCapacity);

    if (!isChecksummedAddress(contractAddress)) {
      throw new EncryptionError({
        message: `Invalid contract checksummed address: ${contractAddress}`,
      });
    }
    if (!isChecksummedAddress(userAddress)) {
      throw new EncryptionError({
        message: `Invalid user checksummed address: ${userAddress}`,
      });
    }
    if (!isChecksummedAddress(aclContractAddress)) {
      throw new EncryptionError({
        message: `Invalid ACL checksummed address: ${aclContractAddress}`,
      });
    }
    if (!isUint64(chainId)) {
      throw new EncryptionError({
        message: `Invalid chain ID uint64: ${chainId}`,
      });
    }

    // Note about hexToBytes(<address>)
    // ================================
    // All addresses are 42 characters long strings.
    // hexToBytes(<42-characters hex string>) always returns a 20-byte long Uint8Array

    // Bytes20
    const contractAddressBytes20: Bytes20 = hexToBytes20(contractAddress);

    // Bytes20
    const userAddressBytes20: Bytes20 = hexToBytes20(userAddress);

    // Bytes20
    const aclContractAddressBytes20: Bytes20 = hexToBytes20(aclContractAddress);

    // Bytes32
    const chainIdBytes32: Bytes32 = uint256ToBytes32(chainId);

    const metaDataLength = 3 * 20 + 32;
    const metaData = new Uint8Array(metaDataLength);

    metaData.set(contractAddressBytes20, 0);
    metaData.set(userAddressBytes20, 20);
    metaData.set(aclContractAddressBytes20, 40);
    metaData.set(chainIdBytes32, 60);

    assert(metaData.length - chainIdBytes32.length === 60);

    let tfheProvenCompactCiphertextList:
      | ProvenCompactCiphertextListWasmType
      | undefined;

    try {
      tfheProvenCompactCiphertextList =
        this.#fheCompactCiphertextListBuilderWasm.build_with_proof_packed(
          this.#pkeParams.tfhePkeCrs.getWasmForCapacity(this.#bitsCapacity)
            .wasm,
          metaData,
          TFHEModule.ZkComputeLoadVerify,
        );

      const ciphertextWithZKProofBytes: Uint8Array =
        tfheProvenCompactCiphertextList.safe_serialize(
          SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
        );

      return createZKProof(
        {
          chainId: BigInt(chainId),
          aclContractAddress,
          contractAddress,
          userAddress,
          ciphertextWithZKProof: ciphertextWithZKProofBytes,
          encryptionBits: this.#bits,
        },
        { copy: false }, // Take ownership
      );
    } finally {
      this.#disposed = true;
      tfheProvenCompactCiphertextList?.free();
      this.#fheCompactCiphertextListBuilderWasm.free();
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private helpers
  //////////////////////////////////////////////////////////////////////////////

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new EncryptionError({
        message: 'TFHEZKProofBuilder has already been disposed',
      });
    }
  }

  #checkLimit(encryptionBits: EncryptionBits): void {
    if (this.#totalBits + encryptionBits > this.#bitsCapacity) {
      throw new EncryptionError({
        message: `Packing more than ${this.#bitsCapacity.toString()} bits in a single input ciphertext is unsupported`,
      });
    }
    if (this.#bits.length >= this.#ciphertextCapacity) {
      throw new EncryptionError({
        message: `Packing more than ${this.#ciphertextCapacity.toString()} variables in a single input ciphertext is unsupported`,
      });
    }
  }

  #addType(fheTypeName: FheTypeName): void {
    this.#assertNotDisposed();
    // encryptionBits is guaranteed to be >= 2
    const encryptionBits = encryptionBitsFromFheTypeName(fheTypeName);
    this.#checkLimit(encryptionBits);
    this.#totalBits += encryptionBits;
    this.#bits.push(encryptionBits);
  }
}

//////////////////////////////////////////////////////////////////////////////
// Public API
//////////////////////////////////////////////////////////////////////////////

export function createTFHEZKProofBuilder(params: {
  readonly pkeParams: TFHEPkeParams;
}): TFHEZKProofBuilder {
  return new TFHEZKProofBuilderImpl(params);
}
