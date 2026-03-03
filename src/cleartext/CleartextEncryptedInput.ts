import type { RelayerEncryptedInput } from '@relayer-provider/types/public-api';
import type {
  EncryptionBits,
  ChecksummedAddress,
  Uint64,
} from '@base/types/primitives';
import { isChecksummedAddress } from '@base/address';
import { InputProof } from '@sdk/coprocessor/InputProof';
import { computeCleartextHandles } from './cleartextHandles';

function checkEncryptedValue(value: number | bigint, bits: number): void {
  if (value == null) throw new Error('Missing value');
  let limit: bigint;
  if (bits >= 8) {
    limit = BigInt(`0x${'ff'.repeat(bits / 8)}`);
  } else {
    limit = BigInt(2 ** bits - 1);
  }
  if (typeof value !== 'number' && typeof value !== 'bigint')
    throw new Error('Value must be a number or a bigint.');
  if (BigInt(value) > limit) {
    throw new Error(
      `The value exceeds the limit for ${bits}bits integer (${limit}).`,
    );
  }
}

export function createCleartextEncryptedInput(params: {
  aclContractAddress: ChecksummedAddress;
  chainId: Uint64;
  contractAddress: ChecksummedAddress;
  userAddress: ChecksummedAddress;
}): RelayerEncryptedInput {
  const { aclContractAddress, chainId, contractAddress, userAddress } = params;

  if (!isChecksummedAddress(contractAddress))
    throw new Error('Contract address is not a valid address.');
  if (!isChecksummedAddress(userAddress))
    throw new Error('User address is not a valid address.');

  const bits: EncryptionBits[] = [];
  const values: bigint[] = [];

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

  const self: RelayerEncryptedInput = {
    addBool(value: boolean | number | bigint) {
      if (value == null) throw new Error('Missing value');
      if (Number(value) > 1) throw new Error('The value must be 1 or 0.');
      checkEncryptedValue(Number(value), 1);
      checkLimit(2);
      values.push(BigInt(Number(value)));
      bits.push(2);
      return self;
    },
    add8(value: number | bigint) {
      checkEncryptedValue(value, 8);
      checkLimit(8);
      values.push(BigInt(value));
      bits.push(8);
      return self;
    },
    add16(value: number | bigint) {
      checkEncryptedValue(value, 16);
      checkLimit(16);
      values.push(BigInt(value));
      bits.push(16);
      return self;
    },
    add32(value: number | bigint) {
      checkEncryptedValue(value, 32);
      checkLimit(32);
      values.push(BigInt(value));
      bits.push(32);
      return self;
    },
    add64(value: number | bigint) {
      checkEncryptedValue(value, 64);
      checkLimit(64);
      values.push(BigInt(value));
      bits.push(64);
      return self;
    },
    add128(value: number | bigint) {
      checkEncryptedValue(value, 128);
      checkLimit(128);
      values.push(BigInt(value));
      bits.push(128);
      return self;
    },
    add256(value: number | bigint) {
      checkEncryptedValue(value, 256);
      checkLimit(256);
      values.push(BigInt(value));
      bits.push(256);
      return self;
    },
    addAddress(value: string) {
      if (!isChecksummedAddress(value))
        throw new Error('The value must be a valid address.');
      checkLimit(160);
      values.push(BigInt(value));
      bits.push(160);
      return self;
    },
    getBits() {
      return [...bits];
    },
    generateZKProof() {
      if (bits.length === 0)
        throw new Error('Encrypted input must contain at least one value');

      const { fakeCiphertext } = computeCleartextHandles({
        values,
        encryptionBits: bits,
        aclContractAddress,
        chainId,
      });

      return {
        chainId: BigInt(chainId),
        aclContractAddress: aclContractAddress as `0x${string}`,
        contractAddress: contractAddress as `0x${string}`,
        userAddress: userAddress as `0x${string}`,
        ciphertextWithZKProof: fakeCiphertext,
        encryptionBits: bits as readonly EncryptionBits[],
      };
    },
    async encrypt() {
      if (bits.length === 0)
        throw new Error('Encrypted input must contain at least one value');

      const { handles } = computeCleartextHandles({
        values,
        encryptionBits: bits,
        aclContractAddress,
        chainId,
      });

      // Build extraData: [version(1 byte)] [per-handle: 32 bytes plaintext value]
      // The CleartextFHEVMExecutor.verifyInput reads plaintext values from this layout.
      let extraData = '0x00'; // version byte
      for (const v of values) {
        extraData += v.toString(16).padStart(64, '0');
      }

      // Build InputProof with no signatures (cleartext mode skips coprocessor verification)
      const inputProof = InputProof.from({
        signatures: [],
        handles: handles.map((h) => h.toBytes32Hex()),
        extraData: extraData as `0x${string}`,
      });

      return inputProof.toBytes();
    },
  };

  return self;
}
