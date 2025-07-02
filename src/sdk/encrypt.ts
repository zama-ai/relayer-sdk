import { isAddress } from 'ethers';

import {
  bytesToBigInt,
  fromHexString,
  SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
} from '../utils';
import { EncryptionTypes } from './encryptionTypes';
import { TFHEType } from '../tfheType';

export type EncryptedInput = {
  addBool: (value: boolean | number | bigint) => EncryptedInput;
  add8: (value: number | bigint) => EncryptedInput;
  add16: (value: number | bigint) => EncryptedInput;
  add32: (value: number | bigint) => EncryptedInput;
  add64: (value: number | bigint) => EncryptedInput;
  add128: (value: number | bigint) => EncryptedInput;
  add256: (value: number | bigint) => EncryptedInput;
  addBytes64: (value: Uint8Array) => EncryptedInput;
  addBytes128: (value: Uint8Array) => EncryptedInput;
  addBytes256: (value: Uint8Array) => EncryptedInput;
  addAddress: (value: string) => EncryptedInput;
  getBits: () => EncryptionTypes[];
  encrypt: () => Uint8Array;
};

const checkEncryptedValue = (value: number | bigint, bits: number) => {
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

export type PublicParams<T = TFHEType['CompactPkeCrs']> = {
  [key in EncryptionTypes]?: { publicParams: T; publicParamsId: string };
};

export type EncryptInputParams = {
  aclContractAddress: string;
  chainId: number;
  tfheCompactPublicKey: TFHEType['TfheCompactPublicKey'];
  publicParams: PublicParams;
  contractAddress: string;
  userAddress: string;
};

export const createEncryptedInput = ({
  aclContractAddress,
  chainId,
  tfheCompactPublicKey,
  publicParams,
  contractAddress,
  userAddress,
}: EncryptInputParams): EncryptedInput => {
  if (!isAddress(contractAddress)) {
    throw new Error('Contract address is not a valid address.');
  }

  if (!isAddress(userAddress)) {
    throw new Error('User address is not a valid address.');
  }
  const publicKey: TFHEType['TfheCompactPublicKey'] = tfheCompactPublicKey;
  const bits: EncryptionTypes[] = [];
  const builder = TFHE.CompactCiphertextList.builder(publicKey);
  let ciphertextWithZKProof: Uint8Array = new Uint8Array(); // updated in `_prove`
  const checkLimit = (added: number) => {
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
      builder.push_boolean(!!value);
      bits.push(1); // ebool takes 2 encrypted bits
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
      if (!isAddress(value)) {
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
    addBytes64(value: Uint8Array) {
      if (value.length !== 64)
        throw Error(
          'Uncorrect length of input Uint8Array, should be 64 for an ebytes64',
        );
      const bigIntValue = bytesToBigInt(value);
      checkEncryptedValue(bigIntValue, 512);
      checkLimit(512);
      builder.push_u512(bigIntValue);
      bits.push(512);
      return this;
    },
    addBytes128(value: Uint8Array) {
      if (value.length !== 128)
        throw Error(
          'Uncorrect length of input Uint8Array, should be 128 for an ebytes128',
        );
      const bigIntValue = bytesToBigInt(value);
      checkEncryptedValue(bigIntValue, 1024);
      checkLimit(1024);
      builder.push_u1024(bigIntValue);
      bits.push(1024);
      return this;
    },
    addBytes256(value: Uint8Array) {
      if (value.length !== 256)
        throw Error(
          'Uncorrect length of input Uint8Array, should be 256 for an ebytes256',
        );
      const bigIntValue = bytesToBigInt(value);
      checkEncryptedValue(bigIntValue, 2048);
      checkLimit(2048);
      builder.push_u2048(bigIntValue);
      bits.push(2048);
      return this;
    },
    getBits() {
      return bits;
    },
    encrypt() {
      const getClosestPP = () => {
        const getKeys = <T extends {}>(obj: T) =>
          Object.keys(obj) as Array<keyof T>;

        const totalBits = bits.reduce((total, v) => total + v, 0);
        const ppTypes = getKeys(publicParams);
        const closestPP: EncryptionTypes | undefined = ppTypes.find(
          (k) => Number(k) >= totalBits,
        );
        if (!closestPP) {
          throw new Error(
            `Too many bits in provided values. Maximum is ${
              ppTypes[ppTypes.length - 1]
            }.`,
          );
        }
        return closestPP;
      };
      const closestPP = getClosestPP();
      const pp = publicParams[closestPP]!.publicParams;
      const buffContract = fromHexString(contractAddress);
      const buffUser = fromHexString(userAddress);
      const buffAcl = fromHexString(aclContractAddress);
      const buffChainId = fromHexString(chainId.toString(16).padStart(64, '0'));
      const auxData = new Uint8Array(
        buffContract.length + buffUser.length + buffAcl.length + 32, // buffChainId.length,
      );
      auxData.set(buffContract, 0);
      auxData.set(buffUser, 20);
      auxData.set(buffAcl, 40);
      auxData.set(buffChainId, auxData.length - buffChainId.length);
      const encrypted = builder.build_with_proof_packed(
        pp,
        auxData,
        TFHE.ZkComputeLoad.Verify,
      );
      ciphertextWithZKProof = encrypted.safe_serialize(
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      );
      return ciphertextWithZKProof;
    },
  };
};
