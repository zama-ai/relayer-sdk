import fs from 'fs';
import path from 'path';
import type { ChecksummedAddress } from '@base/types/primitives';
import type { ZKProof, EncryptionBits } from '../types/public-api';
import { ZKProofError } from '../errors/ZKProofError';
import { InvalidTypeError } from '@base/errors/InvalidTypeError';
import { ChecksummedAddressError } from '@base/errors/ChecksummedAddressError';
import { hexToBytes } from '@base/bytes';
import {
  createZKProofInternal,
  zkProofGetUnsafeRawBytesInternal,
} from './ZKProof';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/fhevm-base/ZKProof.test.ts
// npx jest --colors --passWithNoTests ./src/fhevm-base/ZKProof.test.ts --testNamePattern=xxx
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

const VALID_ACL_ADDRESS = INPUT_PROOF_ASSET_1.aclAddress as ChecksummedAddress;
const VALID_CONTRACT_ADDRESS =
  INPUT_PROOF_ASSET_1.contractAddress as ChecksummedAddress;
const VALID_USER_ADDRESS =
  INPUT_PROOF_ASSET_1.userAddress as ChecksummedAddress;
const VALID_CHAIN_ID = BigInt(INPUT_PROOF_ASSET_1.chainId);
const VALID_CIPHERTEXT_HEX =
  INPUT_PROOF_ASSET_1.ciphertextWithInputVerification;
const VALID_CIPHERTEXT_BYTES = hexToBytes(VALID_CIPHERTEXT_HEX);
const VALID_ENCRYPTION_BITS: EncryptionBits[] =
  INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths;

function createValidZKProofLike() {
  return {
    chainId: VALID_CHAIN_ID,
    aclContractAddress: VALID_ACL_ADDRESS,
    contractAddress: VALID_CONTRACT_ADDRESS,
    userAddress: VALID_USER_ADDRESS,
    ciphertextWithZKProof: VALID_CIPHERTEXT_HEX,
    encryptionBits: VALID_ENCRYPTION_BITS,
  };
}

function createValidZKProofLikeBytes() {
  return {
    chainId: VALID_CHAIN_ID,
    aclContractAddress: VALID_ACL_ADDRESS,
    contractAddress: VALID_CONTRACT_ADDRESS,
    userAddress: VALID_USER_ADDRESS,
    ciphertextWithZKProof: VALID_CIPHERTEXT_BYTES,
    encryptionBits: VALID_ENCRYPTION_BITS,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('ZKProof', () => {
  //////////////////////////////////////////////////////////////////////////////
  // createZKProof - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('createZKProof', () => {
    it('creates ZKProof from valid hex string ciphertext', () => {
      const zkProof = createZKProofInternal(createValidZKProofLike());

      expect(zkProof.chainId).toBe(VALID_CHAIN_ID);
      expect(zkProof.aclContractAddress).toBe(VALID_ACL_ADDRESS);
      expect(zkProof.contractAddress).toBe(VALID_CONTRACT_ADDRESS);
      expect(zkProof.userAddress).toBe(VALID_USER_ADDRESS);
      expect(zkProof.ciphertextWithZKProof).toEqual(VALID_CIPHERTEXT_BYTES);
      expect(zkProof.encryptionBits).toEqual(VALID_ENCRYPTION_BITS);
    });

    it('creates ZKProof from valid Uint8Array ciphertext', () => {
      const input = {
        ...createValidZKProofLike(),
        ciphertextWithZKProof: VALID_CIPHERTEXT_BYTES,
      };

      const zkProof = createZKProofInternal(input);

      expect(zkProof.ciphertextWithZKProof).toEqual(VALID_CIPHERTEXT_BYTES);
    });

    it('accepts chainId as number', () => {
      const input = {
        ...createValidZKProofLike(),
        chainId: 11155111,
      };

      const zkProof = createZKProofInternal(input);

      expect(zkProof.chainId).toBe(BigInt(11155111));
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createZKProof - copy option
  //////////////////////////////////////////////////////////////////////////////

  describe('createZKProof copy option', () => {
    it('takes ownership when copy: false (no defensive copy)', () => {
      const input = createValidZKProofLikeBytes();

      const zkProof = createZKProofInternal(input, { copy: false });

      // Should be the same reference (no copy was made)
      expect(zkProofGetUnsafeRawBytesInternal(zkProof)).toBe(
        input.ciphertextWithZKProof,
      );
    });

    it('makes defensive copy by default (copy: true)', () => {
      const input = createValidZKProofLikeBytes();

      const zkProof = createZKProofInternal(input, { copy: true });

      // Should be a different reference but same content
      expect(zkProofGetUnsafeRawBytesInternal(zkProof)).not.toBe(
        input.ciphertextWithZKProof,
      );
      expect(zkProofGetUnsafeRawBytesInternal(zkProof)).toEqual(
        VALID_CIPHERTEXT_BYTES,
      );
    });

    it('copy option has no effect on hex string input', () => {
      const zkProof1 = createZKProofInternal(createValidZKProofLike());
      const zkProof2 = createZKProofInternal(createValidZKProofLike(), {
        copy: true,
      });

      expect(zkProofGetUnsafeRawBytesInternal(zkProof1)).toEqual(
        zkProofGetUnsafeRawBytesInternal(zkProof2),
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createZKProof - invalid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('createZKProof validation', () => {
    it('throws on invalid chainId (negative)', () => {
      const input = {
        ...createValidZKProofLike(),
        chainId: -1,
      };

      expect(() => createZKProofInternal(input)).toThrow(InvalidTypeError);
    });

    it('throws on invalid chainId (not a number)', () => {
      const input = {
        ...createValidZKProofLike(),
        chainId: 'invalid' as any,
      };

      expect(() => createZKProofInternal(input)).toThrow(InvalidTypeError);
    });

    it('throws on invalid aclContractAddress', () => {
      const input = {
        ...createValidZKProofLike(),
        aclContractAddress: 'not-an-address',
      };

      expect(() => createZKProofInternal(input)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws on invalid contractAddress', () => {
      const input = {
        ...createValidZKProofLike(),
        contractAddress: '0xinvalid',
      };

      expect(() => createZKProofInternal(input)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws on invalid userAddress', () => {
      const input = {
        ...createValidZKProofLike(),
        userAddress: '',
      };

      expect(() => createZKProofInternal(input)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws on empty ciphertextWithZKProof hex string', () => {
      const input = {
        ...createValidZKProofLike(),
        ciphertextWithZKProof: '0x',
      };

      expect(() => createZKProofInternal(input)).toThrow(ZKProofError);
    });

    it('throws on empty ciphertextWithZKProof Uint8Array', () => {
      const input = {
        ...createValidZKProofLike(),
        ciphertextWithZKProof: new Uint8Array(0),
      };

      expect(() => createZKProofInternal(input)).toThrow(ZKProofError);
    });

    it('throws on invalid ciphertextWithZKProof type', () => {
      const input = {
        ...createValidZKProofLike(),
        ciphertextWithZKProof: 12345 as any,
      };

      expect(() => createZKProofInternal(input)).toThrow(InvalidTypeError);
    });

    it('throws on invalid encryptionBits value', () => {
      const input = {
        ...createValidZKProofLike(),
        encryptionBits: [8, 999] as any,
      };

      expect(() => createZKProofInternal(input)).toThrow(InvalidTypeError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let zkProof: ZKProof;

    beforeEach(() => {
      zkProof = createZKProofInternal(createValidZKProofLike());
    });

    it('chainId returns bigint', () => {
      expect(typeof zkProof.chainId).toBe('bigint');
      expect(zkProof.chainId).toBe(VALID_CHAIN_ID);
    });

    it('aclContractAddress returns ChecksummedAddress', () => {
      expect(zkProof.aclContractAddress).toBe(VALID_ACL_ADDRESS);
    });

    it('contractAddress returns ChecksummedAddress', () => {
      expect(zkProof.contractAddress).toBe(VALID_CONTRACT_ADDRESS);
    });

    it('userAddress returns ChecksummedAddress', () => {
      expect(zkProof.userAddress).toBe(VALID_USER_ADDRESS);
    });

    it('ciphertextWithZKProof returns Uint8Array', () => {
      expect(zkProof.ciphertextWithZKProof).toBeInstanceOf(Uint8Array);
    });

    it('ciphertextWithZKProof getter throws if internally empty (defensive check)', () => {
      // Bypass TypeScript private constructor to test the getter's defensive check
      // This simulates a scenario where the internal state is corrupted
      expect(() =>
        createZKProofInternal({
          chainId: VALID_CHAIN_ID,
          aclContractAddress: VALID_ACL_ADDRESS,
          contractAddress: VALID_CONTRACT_ADDRESS,
          userAddress: VALID_USER_ADDRESS,
          ciphertextWithZKProof: new Uint8Array(0), // Empty!
          encryptionBits: VALID_ENCRYPTION_BITS,
        }),
      ).toThrow(ZKProofError);
    });

    it('encryptionBits returns readonly array', () => {
      expect(zkProof.encryptionBits).toEqual(VALID_ENCRYPTION_BITS);
      expect(Object.isFrozen(zkProof.encryptionBits)).toBe(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    it('encryptionBits array is frozen', () => {
      const zkProof = createZKProofInternal(createValidZKProofLike());

      expect(Object.isFrozen(zkProof.encryptionBits)).toBe(true);
    });

    it('modifying original encryptionBits array does not affect ZKProof', () => {
      const encryptionBits: EncryptionBits[] = [32];
      const input = {
        ...createValidZKProofLike(),
        encryptionBits,
      };

      const zkProof = createZKProofInternal(input);

      // Mutate the original array
      encryptionBits.push(64);

      // ZKProof should not be affected
      expect(zkProof.encryptionBits).toEqual([32]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toJSON
  //////////////////////////////////////////////////////////////////////////////

  describe('toJSON', () => {
    it('serializes to ZKProofLike', () => {
      const zkProof = createZKProofInternal(createValidZKProofLike());
      const jsonStr = JSON.stringify(zkProof);
      const json = JSON.parse(jsonStr);

      // chainId is converted to number when within safe integer range
      expect(json.chainId).toBe(Number(VALID_CHAIN_ID));
      expect(json.aclContractAddress).toBe(VALID_ACL_ADDRESS);
      expect(json.contractAddress).toBe(VALID_CONTRACT_ADDRESS);
      expect(json.userAddress).toBe(VALID_USER_ADDRESS);
      expect(typeof json.ciphertextWithZKProof).toBe('string');
      expect(json.encryptionBits).toEqual(VALID_ENCRYPTION_BITS);
    });

    it('ciphertextWithZKProof is serialized as hex string', () => {
      const zkProof = createZKProofInternal(createValidZKProofLike());
      const jsonStr = JSON.stringify(zkProof);
      const json = JSON.parse(jsonStr);

      expect(json.ciphertextWithZKProof).toBe(VALID_CIPHERTEXT_HEX);
    });

    it('can round-trip through toJSON and createZKProof', () => {
      const original = createZKProofInternal(createValidZKProofLike());
      const jsonStr = JSON.stringify(original);
      const json = JSON.parse(jsonStr);
      const restored = createZKProofInternal(json);

      expect(restored.chainId).toBe(original.chainId);
      expect(restored.aclContractAddress).toBe(original.aclContractAddress);
      expect(restored.contractAddress).toBe(original.contractAddress);
      expect(restored.userAddress).toBe(original.userAddress);
      expect(restored.ciphertextWithZKProof).toEqual(
        original.ciphertextWithZKProof,
      );
      expect(restored.encryptionBits).toEqual([...original.encryptionBits]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // JSON.stringify compatibility
  //////////////////////////////////////////////////////////////////////////////

  describe('JSON.stringify compatibility', () => {
    it('works with JSON.stringify natively for safe integer chainIds', () => {
      const zkProof = createZKProofInternal(createValidZKProofLike());

      // chainId within Number.MAX_SAFE_INTEGER is converted to number
      const jsonString = JSON.stringify(zkProof);
      const parsed = JSON.parse(jsonString);

      expect(parsed.aclContractAddress).toBe(VALID_ACL_ADDRESS);
      expect(parsed.contractAddress).toBe(VALID_CONTRACT_ADDRESS);
      expect(parsed.userAddress).toBe(VALID_USER_ADDRESS);
      expect(parsed.ciphertextWithZKProof).toBe(VALID_CIPHERTEXT_HEX);
    });

    it('chainId is serialized as number when within safe integer range', () => {
      const zkProof = createZKProofInternal(createValidZKProofLike());

      const jsonString = JSON.stringify(zkProof);
      const parsed = JSON.parse(jsonString);

      // chainId within MAX_SAFE_INTEGER is serialized as number
      expect(typeof parsed.chainId).toBe('number');
      expect(parsed.chainId).toBe(Number(VALID_CHAIN_ID));
    });

    it('chainId remains bigint when exceeding safe integer range', () => {
      const largeChainId = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
      const input = {
        ...createValidZKProofLike(),
        chainId: largeChainId,
      };

      const zkProof = createZKProofInternal(input);

      // Large chainId stays as bigint, requires replacer for JSON.stringify
      expect(() => JSON.stringify(zkProof)).toThrow(TypeError);

      // With replacer it works
      const jsonString = JSON.stringify(zkProof, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );
      const parsed = JSON.parse(jsonString);
      expect(parsed.chainId).toBe(largeChainId.toString());
    });
  });
});
