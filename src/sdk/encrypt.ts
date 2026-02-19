import { TFHE as TFHEModule } from './lowlevel/wasm-modules';
import type {
  CompactPkeCrsWasmType,
  TfheCompactPublicKeyWasmType,
} from './lowlevel/public-api';
import type { EncryptionBits } from '@fhevm-base/types/public-api';
import { isChecksummedAddress } from '@base/address';
import { hexToBytes } from '@base/bytes';
import { SERIALIZED_SIZE_LIMIT_CIPHERTEXT } from './lowlevel/constants';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EncryptedInput = {
  addBool: (value: boolean | number | bigint) => EncryptedInput;
  add8: (value: number | bigint) => EncryptedInput;
  add16: (value: number | bigint) => EncryptedInput;
  add32: (value: number | bigint) => EncryptedInput;
  add64: (value: number | bigint) => EncryptedInput;
  add128: (value: number | bigint) => EncryptedInput;
  add256: (value: number | bigint) => EncryptedInput;
  addAddress: (value: string) => EncryptedInput;
  getBits: () => EncryptionBits[];
  encrypt: () => Uint8Array;
};

const checkEncryptedValue = (value: number | bigint, bits: number): void => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (value == null) throw new Error('Missing value');
  let limit;
  if (bits >= 8) {
    limit = BigInt(
      `0x${new Array(bits / 8).fill(null).reduce((v) => `${v}ff`, '')}`,
    );
  } else {
    limit = BigInt(2 ** bits - 1);
  }
  if (typeof value !== 'number' && typeof value !== 'bigint')
    throw new Error('Value must be a number or a bigint.');
  if (value > limit) {
    throw new Error(
      `The value exceeds the limit for ${bits}bits integer (${limit.toString()}).`,
    );
  }
};

interface EncryptInputParams {
  aclContractAddress: string;
  chainId: number;
  tfheCompactPublicKey: TfheCompactPublicKeyWasmType;
  tfheCompactPkeCrs: CompactPkeCrsWasmType;
  contractAddress: string;
  userAddress: string;
  capacity: number;
}

export const createEncryptedInput = ({
  aclContractAddress,
  chainId,
  tfheCompactPublicKey,
  tfheCompactPkeCrs,
  contractAddress,
  userAddress,
  capacity,
}: EncryptInputParams): EncryptedInput => {
  if (!isChecksummedAddress(contractAddress)) {
    throw new Error('Contract address is not a valid address.');
  }

  if (!isChecksummedAddress(userAddress)) {
    throw new Error('User address is not a valid address.');
  }
  const bits: EncryptionBits[] = [];
  const builder =
    TFHEModule.CompactCiphertextList.builder(tfheCompactPublicKey);
  let ciphertextWithZKProof: Uint8Array = new Uint8Array(); // updated in `_prove`
  const checkLimit = (added: number): void => {
    if (bits.reduce((acc, val) => acc + Math.max(2, val), 0) + added > 2048) {
      throw Error(
        'Packing more than 2048 bits in a single input ciphertext is unsupported',
      );
    }
    if (bits.length + 1 > 256)
      throw Error(
        'Packing more than 256 variables in a single input ciphertext is unsupported',
      );
  };

  return {
    addBool(value: boolean | number | bigint) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (value == null) throw new Error('Missing value');
      if (
        typeof value !== 'boolean' &&
        typeof value !== 'number' &&
        typeof value !== 'bigint'
      )
        throw new Error('The value must be a boolean, a number or a bigint.');
      if (Number(value) > 1) throw new Error('The value must be 1 or 0.');
      checkEncryptedValue(Number(value), 1);
      checkLimit(2);
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      builder.push_boolean(!!value);
      bits.push(2); // ebool takes 2 encrypted bits
      return this;
    },
    add8(value: number | bigint) {
      checkEncryptedValue(value, 8);
      checkLimit(8);
      builder.push_u8(Number(value));
      bits.push(8);
      return this;
    },
    add16(value: number | bigint) {
      checkEncryptedValue(value, 16);
      checkLimit(16);
      builder.push_u16(Number(value));
      bits.push(16);
      return this;
    },
    add32(value: number | bigint) {
      checkEncryptedValue(value, 32);
      checkLimit(32);
      builder.push_u32(Number(value));
      bits.push(32);
      return this;
    },
    add64(value: number | bigint) {
      checkEncryptedValue(value, 64);
      checkLimit(64);
      builder.push_u64(BigInt(value));
      bits.push(64);
      return this;
    },
    add128(value: number | bigint) {
      checkEncryptedValue(value, 128);
      checkLimit(128);
      builder.push_u128(BigInt(value));
      bits.push(128);
      return this;
    },
    addAddress(value: string) {
      if (!isChecksummedAddress(value)) {
        throw new Error('The value must be a valid address.');
      }
      checkLimit(160);
      builder.push_u160(BigInt(value));
      bits.push(160);
      return this;
    },
    add256(value: number | bigint) {
      checkEncryptedValue(value, 256);
      checkLimit(256);
      builder.push_u256(BigInt(value));
      bits.push(256);
      return this;
    },
    getBits() {
      return bits;
    },
    encrypt() {
      const totalBits = bits.reduce((total, v) => total + v, 0);
      if (totalBits > capacity) {
        throw new Error(`Too many bits in provided values. Maximum is 2048.`);
      }
      // Bytes20
      const contractAddressBytes20 = hexToBytes(contractAddress);
      // Bytes20
      const userAddressBytes20 = hexToBytes(userAddress);
      // Bytes20
      const aclContractAddressBytes20 = hexToBytes(aclContractAddress);
      // Bytes32
      const chainIdBytes32 = hexToBytes(chainId.toString(16).padStart(64, '0'));

      const metaData = new Uint8Array(
        contractAddressBytes20.length +
          userAddressBytes20.length +
          aclContractAddressBytes20.length +
          32, // buffChainId.length,
      );
      metaData.set(contractAddressBytes20, 0);
      metaData.set(userAddressBytes20, 20);
      metaData.set(aclContractAddressBytes20, 40);
      metaData.set(chainIdBytes32, metaData.length - chainIdBytes32.length);

      const encrypted = builder.build_with_proof_packed(
        tfheCompactPkeCrs,
        metaData,
        TFHEModule.ZkComputeLoadVerify,
      );

      ciphertextWithZKProof = encrypted.safe_serialize(
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      );

      return ciphertextWithZKProof;
    },
  };
};
