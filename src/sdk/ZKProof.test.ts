import fs from 'fs';
import path from 'path';
import type {
  ChecksummedAddress,
  EncryptionBits,
} from '../base/types/primitives';
import { ZKProof } from './ZKProof';
import { ZKProofError } from '../errors/ZKProofError';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import { ChecksummedAddressError } from '../errors/ChecksummedAddressError';
import { hexToBytes } from '../base/bytes';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/ZKProof.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/ZKProof.test.ts --testNamePattern=xxx
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
  // fromComponents - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('fromComponents', () => {
    it('creates ZKProof from valid hex string ciphertext', () => {
      const zkProof = ZKProof.fromComponents(createValidZKProofLike());

      expect(zkProof).toBeInstanceOf(ZKProof);
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

      const zkProof = ZKProof.fromComponents(input);

      expect(zkProof.ciphertextWithZKProof).toEqual(VALID_CIPHERTEXT_BYTES);
    });

    it('accepts chainId as number', () => {
      const input = {
        ...createValidZKProofLike(),
        chainId: 11155111,
      };

      const zkProof = ZKProof.fromComponents(input);

      expect(zkProof.chainId).toBe(BigInt(11155111));
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromComponents - copy option
  //////////////////////////////////////////////////////////////////////////////

  describe('fromComponents copy option', () => {
    it('takes ownership of Uint8Array by default (no copy)', () => {
      const input = {
        ...createValidZKProofLikeBytes(),
      };

      const zkProof = ZKProof.fromComponents(input);

      // Should be the same reference (Uint8Array input)
      expect(zkProof.ciphertextWithZKProof).toBe(input.ciphertextWithZKProof);
    });

    it('makes defensive copy when copy: true', () => {
      const input = {
        ...createValidZKProofLikeBytes(),
      };

      const zkProof = ZKProof.fromComponents(input, { copy: true });

      // Should be a different reference but same content
      expect(zkProof.ciphertextWithZKProof).not.toBe(
        input.ciphertextWithZKProof,
      );
      expect(zkProof.ciphertextWithZKProof).toEqual(VALID_CIPHERTEXT_BYTES);
    });

    it('copy option has no effect on hex string input', () => {
      const zkProof1 = ZKProof.fromComponents(createValidZKProofLike());
      const zkProof2 = ZKProof.fromComponents(createValidZKProofLike(), {
        copy: true,
      });

      expect(zkProof1.ciphertextWithZKProof).toEqual(
        zkProof2.ciphertextWithZKProof,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromComponents - invalid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('fromComponents validation', () => {
    it('throws on invalid chainId (negative)', () => {
      const input = {
        ...createValidZKProofLike(),
        chainId: -1,
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(InvalidTypeError);
    });

    it('throws on invalid chainId (not a number)', () => {
      const input = {
        ...createValidZKProofLike(),
        chainId: 'invalid' as any,
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(InvalidTypeError);
    });

    it('throws on invalid aclContractAddress', () => {
      const input = {
        ...createValidZKProofLike(),
        aclContractAddress: 'not-an-address',
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws on invalid contractAddress', () => {
      const input = {
        ...createValidZKProofLike(),
        contractAddress: '0xinvalid',
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws on invalid userAddress', () => {
      const input = {
        ...createValidZKProofLike(),
        userAddress: '',
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws on empty ciphertextWithZKProof hex string', () => {
      const input = {
        ...createValidZKProofLike(),
        ciphertextWithZKProof: '0x',
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(ZKProofError);
    });

    it('throws on empty ciphertextWithZKProof Uint8Array', () => {
      const input = {
        ...createValidZKProofLike(),
        ciphertextWithZKProof: new Uint8Array(0),
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(ZKProofError);
    });

    it('throws on invalid ciphertextWithZKProof type', () => {
      const input = {
        ...createValidZKProofLike(),
        ciphertextWithZKProof: 12345 as any,
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(ZKProofError);
    });

    it('throws on invalid encryptionBits value', () => {
      const input = {
        ...createValidZKProofLike(),
        encryptionBits: [8, 999] as any,
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(InvalidTypeError);
    });

    it('throws on encryption count mismatch', () => {
      const input = {
        ...createValidZKProofLike(),
        encryptionBits: [32, 64], // Ciphertext only contains 1 value
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(ZKProofError);
      expect(() => ZKProof.fromComponents(input)).toThrow(
        /Encryption count mismatch/,
      );
    });

    it('throws on encryption type mismatch', () => {
      const input = {
        ...createValidZKProofLike(),
        encryptionBits: [64], // Ciphertext contains 32-bit value, not 64-bit
      };

      expect(() => ZKProof.fromComponents(input)).toThrow(ZKProofError);
      expect(() => ZKProof.fromComponents(input)).toThrow(
        /Encryption type mismatch at index 0/,
      );
    });

    it('accepts input without encryptionBits (derived from ciphertext)', () => {
      const { encryptionBits: _, ...inputWithoutBits } =
        createValidZKProofLike();

      const zkProof = ZKProof.fromComponents(inputWithoutBits);

      // encryptionBits should be derived from the ciphertext
      expect(zkProof.encryptionBits).toEqual([32]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let zkProof: ZKProof;

    beforeEach(() => {
      zkProof = ZKProof.fromComponents(createValidZKProofLike());
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
      const malformedZKProof = new (ZKProof as any)({
        chainId: VALID_CHAIN_ID,
        aclContractAddress: VALID_ACL_ADDRESS,
        contractAddress: VALID_CONTRACT_ADDRESS,
        userAddress: VALID_USER_ADDRESS,
        ciphertextWithZKProof: new Uint8Array(0), // Empty!
        encryptionBits: VALID_ENCRYPTION_BITS,
      });

      expect(() => malformedZKProof.ciphertextWithZKProof).toThrow(
        ZKProofError,
      );
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
      const zkProof = ZKProof.fromComponents(createValidZKProofLike());

      expect(Object.isFrozen(zkProof.encryptionBits)).toBe(true);
    });

    it('modifying original encryptionBits array does not affect ZKProof', () => {
      const encryptionBits: EncryptionBits[] = [32];
      const input = {
        ...createValidZKProofLike(),
        encryptionBits,
      };

      const zkProof = ZKProof.fromComponents(input);

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
      const zkProof = ZKProof.fromComponents(createValidZKProofLike());
      const json = zkProof.toJSON();

      // chainId is converted to number when within safe integer range
      expect(json.chainId).toBe(Number(VALID_CHAIN_ID));
      expect(json.aclContractAddress).toBe(VALID_ACL_ADDRESS);
      expect(json.contractAddress).toBe(VALID_CONTRACT_ADDRESS);
      expect(json.userAddress).toBe(VALID_USER_ADDRESS);
      expect(typeof json.ciphertextWithZKProof).toBe('string');
      expect(json.encryptionBits).toEqual(VALID_ENCRYPTION_BITS);
    });

    it('ciphertextWithZKProof is serialized as hex string', () => {
      const zkProof = ZKProof.fromComponents(createValidZKProofLike());
      const json = zkProof.toJSON();

      expect(json.ciphertextWithZKProof).toBe(VALID_CIPHERTEXT_HEX);
    });

    it('can round-trip through toJSON and fromComponents', () => {
      const original = ZKProof.fromComponents(createValidZKProofLike());
      const json = original.toJSON();
      const restored = ZKProof.fromComponents(json);

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
      const zkProof = ZKProof.fromComponents(createValidZKProofLike());

      // chainId within Number.MAX_SAFE_INTEGER is converted to number
      const jsonString = JSON.stringify(zkProof);
      const parsed = JSON.parse(jsonString);

      expect(parsed.aclContractAddress).toBe(VALID_ACL_ADDRESS);
      expect(parsed.contractAddress).toBe(VALID_CONTRACT_ADDRESS);
      expect(parsed.userAddress).toBe(VALID_USER_ADDRESS);
      expect(parsed.ciphertextWithZKProof).toBe(VALID_CIPHERTEXT_HEX);
    });

    it('chainId is serialized as number when within safe integer range', () => {
      const zkProof = ZKProof.fromComponents(createValidZKProofLike());

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

      const zkProof = ZKProof.fromComponents(input);

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
