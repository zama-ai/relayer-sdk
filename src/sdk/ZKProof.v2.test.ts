import fs from 'fs';
import path from 'path';
import type { ChecksummedAddress } from '@base/types/primitives';
import { createZKProofInternal } from '@fhevm-base/coprocessor/ZKProof';
import { ZKProofError } from '@fhevm-base/errors/ZKProofError';
import { parseTFHEProvenCompactCiphertextList } from './lowlevel/TFHEProvenCompactCiphertextList';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/ZKProof.v2.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/ZKProof.v2.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Test Constants
////////////////////////////////////////////////////////////////////////////////

const INPUT_PROOF_ASSET_1 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-1.json'),
    'utf-8',
  ),
);
const INPUT_PROOF_ASSET_2 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-2.json'),
    'utf-8',
  ),
);
const INPUT_PROOF_ASSET_3 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-3.json'),
    'utf-8',
  ),
);
const INPUT_PROOF_ASSET_4 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-4.json'),
    'utf-8',
  ),
);

function createValidZKProofLikeAsset1() {
  return {
    chainId: BigInt(INPUT_PROOF_ASSET_1.chainId),
    aclContractAddress: INPUT_PROOF_ASSET_1.aclAddress as ChecksummedAddress,
    contractAddress: INPUT_PROOF_ASSET_1.contractAddress as ChecksummedAddress,
    userAddress: INPUT_PROOF_ASSET_1.userAddress as ChecksummedAddress,
    ciphertextWithZKProof: INPUT_PROOF_ASSET_1.ciphertextWithInputVerification,
    encryptionBits: INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths,
  };
}

function createValidZKProofLikeAsset2() {
  return {
    chainId: BigInt(INPUT_PROOF_ASSET_2.chainId),
    aclContractAddress: INPUT_PROOF_ASSET_2.aclAddress as ChecksummedAddress,
    contractAddress: INPUT_PROOF_ASSET_2.contractAddress as ChecksummedAddress,
    userAddress: INPUT_PROOF_ASSET_2.userAddress as ChecksummedAddress,
    ciphertextWithZKProof: INPUT_PROOF_ASSET_2.ciphertextWithInputVerification,
    encryptionBits: INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths,
  };
}

function createValidZKProofLikeAsset3() {
  return {
    chainId: BigInt(INPUT_PROOF_ASSET_3.chainId),
    aclContractAddress: INPUT_PROOF_ASSET_3.aclAddress as ChecksummedAddress,
    contractAddress: INPUT_PROOF_ASSET_3.contractAddress as ChecksummedAddress,
    userAddress: INPUT_PROOF_ASSET_3.userAddress as ChecksummedAddress,
    ciphertextWithZKProof: INPUT_PROOF_ASSET_3.ciphertextWithInputVerification,
    encryptionBits: INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths,
  };
}

function createValidZKProofLikeAsset4() {
  return {
    chainId: BigInt(INPUT_PROOF_ASSET_4.chainId),
    aclContractAddress: INPUT_PROOF_ASSET_4.aclAddress as ChecksummedAddress,
    contractAddress: INPUT_PROOF_ASSET_4.contractAddress as ChecksummedAddress,
    userAddress: INPUT_PROOF_ASSET_4.userAddress as ChecksummedAddress,
    ciphertextWithZKProof: INPUT_PROOF_ASSET_4.ciphertextWithInputVerification,
    encryptionBits: INPUT_PROOF_ASSET_4.fheTypeEncryptionBitwidths,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('ZKProof', () => {
  //////////////////////////////////////////////////////////////////////////////
  // createZKProof - invalid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('createZKProof validation', () => {
    it('throws on encryption count mismatch', () => {
      const input = {
        ...createValidZKProofLikeAsset1(),
        encryptionBits: [32, 64], // Ciphertext only contains 1 value
      };

      expect(() =>
        createZKProofInternal(input, {
          parseFn: parseTFHEProvenCompactCiphertextList,
        }),
      ).toThrow(ZKProofError);
      expect(() =>
        createZKProofInternal(input, {
          parseFn: parseTFHEProvenCompactCiphertextList,
        }),
      ).toThrow(/Encryption count mismatch/);
    });

    it('throws on encryption type mismatch', () => {
      const input = {
        ...createValidZKProofLikeAsset1(),
        encryptionBits: [64], // Ciphertext contains 32-bit value, not 64-bit
      };

      expect(() =>
        createZKProofInternal(input, {
          parseFn: parseTFHEProvenCompactCiphertextList,
        }),
      ).toThrow(ZKProofError);
      expect(() =>
        createZKProofInternal(input, {
          parseFn: parseTFHEProvenCompactCiphertextList,
        }),
      ).toThrow(/Encryption type mismatch at index 0/);
    });

    it('Asset 1: accepts input without encryptionBits (derived from ciphertext)', () => {
      const { encryptionBits: _, ...inputWithoutBits } =
        createValidZKProofLikeAsset1();

      const zkProof = createZKProofInternal(inputWithoutBits, {
        parseFn: parseTFHEProvenCompactCiphertextList,
      });

      // encryptionBits should be derived from the ciphertext
      expect(zkProof.encryptionBits).toEqual([32]);
    });

    it('Asset 2: accepts input without encryptionBits (derived from ciphertext)', () => {
      const { encryptionBits: _, ...inputWithoutBits } =
        createValidZKProofLikeAsset2();

      const zkProof = createZKProofInternal(inputWithoutBits, {
        parseFn: parseTFHEProvenCompactCiphertextList,
      });

      // encryptionBits should be derived from the ciphertext
      expect(zkProof.encryptionBits).toEqual([2, 8, 32, 64]);
    });

    it('Asset 1: accepts input with encryptionBits (derived from ciphertext)', () => {
      const zkProof = createZKProofInternal(createValidZKProofLikeAsset1(), {
        parseFn: parseTFHEProvenCompactCiphertextList,
      });
      expect(zkProof.encryptionBits).toEqual([32]);
    });
    it('Asset 2: accepts input with encryptionBits (derived from ciphertext)', () => {
      const zkProof = createZKProofInternal(createValidZKProofLikeAsset2(), {
        parseFn: parseTFHEProvenCompactCiphertextList,
      });
      expect(zkProof.encryptionBits).toEqual([2, 8, 32, 64]);
    });
    it('Asset 3: accepts input with encryptionBits (derived from ciphertext)', () => {
      const zkProof = createZKProofInternal(createValidZKProofLikeAsset3(), {
        parseFn: parseTFHEProvenCompactCiphertextList,
      });
      expect(zkProof.encryptionBits).toEqual([16, 128, 160, 256]);
    });
    it('Asset 4: accepts input with encryptionBits (derived from ciphertext)', () => {
      const zkProof = createZKProofInternal(createValidZKProofLikeAsset4(), {
        parseFn: parseTFHEProvenCompactCiphertextList,
      });
      expect(zkProof.encryptionBits).toEqual([16, 128, 160, 256]);
    });
  });
});
