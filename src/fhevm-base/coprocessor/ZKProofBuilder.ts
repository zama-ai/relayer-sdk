import type {
  EncryptionBits,
  FheTypeName,
  FhevmHostChainConfig,
} from '@fhevm-base/types/public-api';
import type { Bytes20, Bytes32, UintNumber } from '@base/types/primitives';
import type { ZKProof } from '../types/public-api';
import { assert } from '@base/errors/InternalError';
import { isUint64, uint256ToBytes32 } from '@base/uint';
import {
  encryptionBitsFromFheTypeName,
  fheTypeNameFromTypeName,
} from '../FheType';
import { isAddress } from '@base/address';
import { hexToBytes20 } from '@base/bytes';
import { ZKProofError } from '../errors/ZKProofError';
import { createTypedValue, TypedValueArrayBuilder } from '@base/typedvalue';
import type {
  TypedValueLike,
  TypedValue,
  Uint32ValueLike,
  Uint64ValueLike,
  Uint128ValueLike,
  Uint256ValueLike,
  Uint8ValueLike,
  Uint16ValueLike,
  BoolValueLike,
  AddressValueLike,
} from '@base/typedvalue';
import type { TFHELib } from '@fhevm-base/types/libs';
import type { TfhePublicEncryptionParams } from '@fhevm-base/types/private';
import { toZKProof } from './ZKProof';

////////////////////////////////////////////////////////////////////////////////

export const TFHE_CRS_BITS_CAPACITY = 2048 as UintNumber;
export const TFHE_ZKPROOF_CIPHERTEXT_CAPACITY = 256 as UintNumber;

////////////////////////////////////////////////////////////////////////////////
// ZKProofBuilder
////////////////////////////////////////////////////////////////////////////////

export interface ZKProofBuilder {
  addBool(value: boolean | number | bigint | BoolValueLike): this;
  addUint8(value: number | bigint | Uint8ValueLike): this;
  addUint16(value: number | bigint | Uint16ValueLike): this;
  addUint32(value: number | bigint | Uint32ValueLike): this;
  addUint64(value: number | bigint | Uint64ValueLike): this;
  addUint128(value: number | bigint | Uint128ValueLike): this;
  addUint256(value: number | bigint | Uint256ValueLike): this;
  addAddress(value: string | AddressValueLike): this;
  addTypedValue(typedValue: TypedValue): this;
  getBits(): EncryptionBits[];
  build(
    fhevm: {
      readonly libs: { readonly tfheLib: TFHELib };
      readonly config: { readonly hostChainConfig: FhevmHostChainConfig };
    },
    {
      contractAddress,
      userAddress,
      tfhePublicEncryptionParams,
    }: {
      readonly contractAddress: string;
      readonly userAddress: string;
      readonly tfhePublicEncryptionParams: TfhePublicEncryptionParams;
    },
  ): ZKProof;
}

class ZKProofBuilderImpl implements ZKProofBuilder {
  #totalBits: number = 0;
  readonly #bits: EncryptionBits[] = [];
  readonly #bitsCapacity: UintNumber;
  readonly #ciphertextCapacity: UintNumber;
  readonly #builder = new TypedValueArrayBuilder();

  constructor(params: {
    readonly ciphertextCapacity: UintNumber;
    readonly bitsCapacity: UintNumber;
  }) {
    this.#bitsCapacity = params.bitsCapacity;
    this.#ciphertextCapacity = params.ciphertextCapacity;
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

  public addTypedValue(typedValue: TypedValue): this {
    this.#builder.addTypedValue(typedValue);
    this.#addType(fheTypeNameFromTypeName(typedValue.type));
    return this;
  }

  public addBool(value: boolean | number | bigint | BoolValueLike): this {
    this.#builder.addBool(value);
    this.#addType(fheTypeNameFromTypeName('bool'));
    return this;
  }

  public addUint8(value: number | bigint | Uint8ValueLike): this {
    this.#builder.addUint8(value);
    this.#addType(fheTypeNameFromTypeName('uint8'));
    return this;
  }

  public addUint16(value: number | bigint | Uint16ValueLike): this {
    this.#builder.addUint16(value);
    this.#addType(fheTypeNameFromTypeName('uint16'));
    return this;
  }

  public addUint32(value: number | bigint | Uint32ValueLike): this {
    this.#builder.addUint32(value);
    this.#addType(fheTypeNameFromTypeName('uint32'));
    return this;
  }

  public addUint64(value: number | bigint | Uint64ValueLike): this {
    this.#builder.addUint64(value);
    this.#addType(fheTypeNameFromTypeName('uint64'));
    return this;
  }

  public addUint128(value: number | bigint | Uint128ValueLike): this {
    this.#builder.addUint128(value);
    this.#addType(fheTypeNameFromTypeName('uint128'));
    return this;
  }

  public addUint256(value: number | bigint | Uint256ValueLike): this {
    this.#builder.addUint256(value);
    this.#addType(fheTypeNameFromTypeName('uint256'));
    return this;
  }

  public addAddress(value: string | AddressValueLike): this {
    this.#builder.addAddress(value);
    this.#addType(fheTypeNameFromTypeName('address'));
    return this;
  }

  public build(
    fhevm: {
      readonly libs: { readonly tfheLib: TFHELib };
      readonly config: { readonly hostChainConfig: FhevmHostChainConfig };
    },
    {
      contractAddress,
      userAddress,
      tfhePublicEncryptionParams,
    }: {
      readonly contractAddress: string;
      readonly userAddress: string;
      readonly tfhePublicEncryptionParams: TfhePublicEncryptionParams;
    },
  ): ZKProof {
    if (this.#totalBits === 0) {
      throw new ZKProofError({
        message: `Encrypted input must contain at least one value`,
      });
    }

    // should be guaranteed at this point
    assert(this.#totalBits <= this.#bitsCapacity);

    if (!isAddress(contractAddress)) {
      throw new ZKProofError({
        message: `Invalid contract address: ${contractAddress}`,
      });
    }
    if (!isAddress(userAddress)) {
      throw new ZKProofError({
        message: `Invalid user address: ${userAddress}`,
      });
    }

    const aclContractAddress = fhevm.config.hostChainConfig.aclContractAddress;
    const chainId = fhevm.config.hostChainConfig.chainId;

    if (!isAddress(aclContractAddress)) {
      throw new ZKProofError({
        message: `Invalid ACL address: ${aclContractAddress}`,
      });
    }
    if (!isUint64(chainId)) {
      throw new ZKProofError({
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

    const ciphertextWithZKProofBytes: Uint8Array =
      fhevm.libs.tfheLib.buildWithProofPacked({
        typedValues: [...this.#builder.build()],
        publicEncryptionParams: tfhePublicEncryptionParams,
        metaData,
      });

    return toZKProof(
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
  }

  //////////////////////////////////////////////////////////////////////////////
  // Private helpers
  //////////////////////////////////////////////////////////////////////////////

  #checkLimit(encryptionBits: EncryptionBits): void {
    if (this.#totalBits + encryptionBits > this.#bitsCapacity) {
      throw new ZKProofError({
        message: `Packing more than ${this.#bitsCapacity.toString()} bits in a single input ciphertext is unsupported`,
      });
    }
    if (this.#bits.length >= this.#ciphertextCapacity) {
      throw new ZKProofError({
        message: `Packing more than ${this.#ciphertextCapacity.toString()} variables in a single input ciphertext is unsupported`,
      });
    }
  }

  #addType(fheTypeName: FheTypeName): void {
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

export function createZKProofBuilder(): ZKProofBuilder {
  return new ZKProofBuilderImpl({
    ciphertextCapacity: TFHE_ZKPROOF_CIPHERTEXT_CAPACITY,
    bitsCapacity: TFHE_CRS_BITS_CAPACITY,
  });
}

export function generateZKProof(
  fhevm: {
    readonly libs: { readonly tfheLib: TFHELib };
    readonly config: { readonly hostChainConfig: FhevmHostChainConfig };
  },
  args: {
    readonly tfhePublicEncryptionParams: TfhePublicEncryptionParams;
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly values: readonly TypedValueLike[];
  },
): ZKProof {
  const { values, contractAddress, userAddress, tfhePublicEncryptionParams } =
    args;
  const builder = createZKProofBuilder();
  for (let i = 0; i < values.length; ++i) {
    builder.addTypedValue(createTypedValue(values[i]));
  }
  return builder.build(fhevm, {
    tfhePublicEncryptionParams,
    contractAddress,
    userAddress,
  });
}
