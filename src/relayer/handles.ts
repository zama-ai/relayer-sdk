import createHash from 'keccak';

import { ENCRYPTION_TYPES } from '../sdk/encryptionTypes';
import { fromHexString } from '../utils';

type EncryptionBitwidths = keyof typeof ENCRYPTION_TYPES;

const MAX_UINT64 = BigInt('18446744073709551615'); // 2^64 - 1

export const computeHandles = (
  ciphertextWithZKProof: Uint8Array,
  bitwidths: EncryptionBitwidths[],
  aclContractAddress: string,
  chainId: number,
  ciphertextVersion: number,
) => {
  // Should be identical to:
  // https://github.com/zama-ai/fhevm-backend/blob/bae00d1b0feafb63286e94acdc58dc88d9c481bf/fhevm-engine/zkproof-worker/src/verifier.rs#L301
  const blob_hash = createHash('keccak256')
    .update(Buffer.from(ciphertextWithZKProof))
    .digest();
  const aclContractAddress20Bytes = Buffer.from(
    fromHexString(aclContractAddress),
  );
  const hex = chainId.toString(16).padStart(64, '0'); // 64 hex chars = 32 bytes
  const chainId32Bytes = Buffer.from(hex, 'hex');
  const handles = bitwidths.map((bitwidth, encryptionIndex) => {
    const encryptionType = ENCRYPTION_TYPES[bitwidth];
    const encryptionIndex1Byte = Buffer.from([encryptionIndex]);
    const handleHash = createHash('keccak256')
      .update(blob_hash)
      .update(encryptionIndex1Byte)
      .update(aclContractAddress20Bytes)
      .update(chainId32Bytes)
      .digest();
    const dataInput = new Uint8Array(32);
    dataInput.set(handleHash, 0);

    // Check if chainId exceeds 8 bytes
    if (BigInt(chainId) > MAX_UINT64) {
      throw new Error('ChainId exceeds maximum allowed value (8 bytes)'); // fhevm assumes chainID is only taking up to 8 bytes
    }

    const chainId8Bytes = fromHexString(hex).slice(24, 32);
    dataInput[21] = encryptionIndex;
    dataInput.set(chainId8Bytes, 22);
    dataInput[30] = encryptionType;
    dataInput[31] = ciphertextVersion;

    return dataInput;
  });
  return handles;
};
