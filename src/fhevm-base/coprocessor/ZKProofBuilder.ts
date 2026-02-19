import type {
  EncryptionBits,
  FheTypeName,
  FhevmConfig,
} from '@fhevm-base/types/public-api';
import type {
  Address,
  Bytes20,
  Bytes32,
  Uint128,
  Uint128BigInt,
  Uint16,
  Uint16Number,
  Uint256,
  Uint256BigInt,
  Uint32,
  Uint32Number,
  Uint64,
  Uint64BigInt,
  Uint8,
  Uint8Number,
  UintNumber,
} from '@base/types/primitives';
import type { ZKProof } from '../types/public-api';
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
import { encryptionBitsFromFheTypeName } from '../FheType';
import { isAddress } from '@base/address';
import { hexToBytes20 } from '@base/bytes';
import { ZKProofError } from '../errors/ZKProofError';
import { createTypedValue, isTypedValue } from '@base/typedvalue';
import type { InputTypedValue, TypedValue } from '@base/typedvalue';
import type { FHELib, FHEPublicKey } from '@fhevm-base/types/libs';
import { createZKProofInternal } from './ZKProof';

////////////////////////////////////////////////////////////////////////////////

export const TFHE_CRS_BITS_CAPACITY = 2048 as UintNumber;
export const TFHE_ZKPROOF_CIPHERTEXT_CAPACITY = 256 as UintNumber;

////////////////////////////////////////////////////////////////////////////////
// ZKProofBuilder
////////////////////////////////////////////////////////////////////////////////

interface ZKProofBuilder {
  addBool(value: unknown): this;
  addUint8(value: unknown): this;
  addUint16(value: unknown): this;
  addUint32(value: unknown): this;
  addUint64(value: unknown): this;
  addUint128(value: unknown): this;
  addUint256(value: unknown): this;
  addAddress(value: unknown): this;
}

class ZKProofBuilderImpl implements ZKProofBuilder {
  #totalBits: number = 0;
  readonly #bits: EncryptionBits[] = [];
  readonly #bitsCapacity: UintNumber;
  readonly #ciphertextCapacity: UintNumber;
  readonly #typedValues: TypedValue[] = [];

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
    if (!isTypedValue(typedValue)) {
      throw new ZKProofError({
        message: 'Invalid typed value',
      });
    }

    this.#typedValues.push(typedValue);
    this.#addType(`e${typedValue.type}`);
    return this;
  }

  public addBool(value: unknown): this {
    if (value === null || value === undefined) {
      throw new ZKProofError({ message: 'Missing value' });
    }

    let boolValue: boolean | undefined;
    if (typeof value === 'boolean') {
      boolValue = value;
    } else if (typeof value === 'bigint') {
      if (value === 0n || value === 1n) {
        boolValue = value === 1n;
      }
    } else if (typeof value === 'number') {
      if (value === 0 || value === 1) {
        boolValue = value === 1;
      }
    } else if (isTypedValue(value) && value.type === 'bool') {
      boolValue = value.value;
    }

    if (boolValue === undefined) {
      throw new ZKProofError({
        message: 'The value must be true, false, 0 or 1.',
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'bool',
        value: boolValue,
      }),
    );

    this.#addType('ebool');
    return this;
  }

  public addUint8(value: unknown): this {
    let num: Uint8;
    if (isUint8(value)) {
      num = value;
    } else if (isTypedValue(value) && value.type === 'uint8') {
      num = value.value;
    } else {
      throw new ZKProofError({
        message: `The value must be a number or bigint in uint8 range (0-${String(MAX_UINT8)}).`,
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'uint8',
        value: Number(num) as Uint8Number,
      }),
    );

    this.#addType('euint8');
    return this;
  }

  public addUint16(value: unknown): this {
    let num: Uint16;
    if (isUint16(value)) {
      num = value;
    } else if (isTypedValue(value) && value.type === 'uint16') {
      num = value.value;
    } else {
      throw new ZKProofError({
        message: `The value must be a number or bigint in uint16 range (0-${String(MAX_UINT16)}).`,
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'uint16',
        value: Number(num) as Uint16Number,
      }),
    );

    this.#addType('euint16');
    return this;
  }

  public addUint32(value: unknown): this {
    let num: Uint32;
    if (isUint32(value)) {
      num = value;
    } else if (isTypedValue(value) && value.type === 'uint32') {
      num = value.value;
    } else {
      throw new ZKProofError({
        message: `The value must be a number or bigint in uint32 range (0-${String(MAX_UINT32)}).`,
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'uint32',
        value: Number(num) as Uint32Number,
      }),
    );

    this.#addType('euint32');
    return this;
  }

  public addUint64(value: unknown): this {
    let num: Uint64;
    if (isUint64(value)) {
      num = value;
    } else if (isTypedValue(value) && value.type === 'uint64') {
      num = value.value;
    } else {
      throw new ZKProofError({
        message: 'The value must be a number or bigint in uint64 range.',
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'uint64',
        value: BigInt(num) as Uint64BigInt,
      }),
    );

    this.#addType('euint64');
    return this;
  }

  public addUint128(value: unknown): this {
    let num: Uint128;
    if (isUint128(value)) {
      num = value;
    } else if (isTypedValue(value) && value.type === 'uint128') {
      num = value.value;
    } else {
      throw new ZKProofError({
        message: 'The value must be a number or bigint in uint128 range.',
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'uint128',
        value: BigInt(num) as Uint128BigInt,
      }),
    );

    this.#addType('euint128');
    return this;
  }

  public addUint256(value: unknown): this {
    let num: Uint256;
    if (isUint256(value)) {
      num = value;
    } else if (isTypedValue(value) && value.type === 'uint256') {
      num = value.value;
    } else {
      throw new ZKProofError({
        message: 'The value must be a number or bigint in uint256 range.',
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'uint256',
        value: BigInt(num) as Uint256BigInt,
      }),
    );

    this.#addType('euint256');
    return this;
  }

  public addAddress(value: unknown): this {
    let addr: Address;
    if (isAddress(value)) {
      addr = value;
    } else if (isTypedValue(value) && value.type === 'address') {
      addr = value.value;
    } else {
      throw new ZKProofError({
        message: 'The value must be a valid address.',
      });
    }

    this.#typedValues.push(
      createTypedValue({
        type: 'address',
        value: addr,
      }),
    );

    this.#addType('eaddress');
    return this;
  }

  public generateZKProof(
    fhevm: {
      readonly libs: { fheLib: FHELib };
      readonly fhePublicKey: FHEPublicKey;
      readonly config: FhevmConfig;
    },
    {
      contractAddress,
      userAddress,
    }: {
      readonly contractAddress: string;
      readonly userAddress: string;
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
      fhevm.libs.fheLib.buildWithProofPacked(fhevm.fhePublicKey, metaData);

    return createZKProofInternal(
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
    readonly libs: { fheLib: FHELib };
    readonly config: FhevmConfig;
    readonly fhePublicKey: FHEPublicKey;
  },
  args: {
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly values: readonly InputTypedValue[];
  },
): ZKProof {
  const { values, contractAddress, userAddress } = args;
  const builder = new ZKProofBuilderImpl({
    ciphertextCapacity: TFHE_ZKPROOF_CIPHERTEXT_CAPACITY,
    bitsCapacity: TFHE_CRS_BITS_CAPACITY,
  });
  for (let i = 0; i < values.length; ++i) {
    builder.addTypedValue(createTypedValue(values[i]));
  }
  return builder.generateZKProof(fhevm, {
    contractAddress,
    userAddress,
  });
}

/*
1. generate a ZKProof
2. use relayer to fetch InputProof Signatures using ZKProof
3. build InputProof using signatures and ZKProof
*/
