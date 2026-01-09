import { AbiCoder } from 'ethers';
import type { Bytes32Hex, Bytes65Hex, BytesHex } from '@base/types/primitives';
import { FhevmHandle } from '@sdk/FhevmHandle';
import { PublicDecryptionProof } from './PublicDecryptionProof';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/kms/PublicDecryptionProof.test.ts
//
////////////////////////////////////////////////////////////////////////////////

// Helper to create FhevmHandle with specific fheTypeId
function createHandle(fheTypeId: number, index: number): FhevmHandle {
  // Create a valid 21-byte hash (42 hex chars + 0x prefix = 43 chars)
  const hash21 = `0x${'ab'.repeat(21).slice(0, 42)}` as `0x${string}`;
  return FhevmHandle.fromComponents({
    hash21,
    chainId: 9000,
    fheTypeId: fheTypeId as 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
    version: 0,
    computed: false,
    index,
  });
}

// Helper to create a 65-byte signature
function createSignature(seed: number): Bytes65Hex {
  const hex = seed.toString(16).padStart(2, '0');
  return `0x${hex.repeat(65)}` as Bytes65Hex;
}

describe('PublicDecryptionProof', () => {
  describe('from() factory method', () => {
    it('should create proof with single ebool handle', () => {
      const handles = [createHandle(0, 0)]; // ebool
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(['bool'], [true]) as BytesHex;
      const signatures = [createSignature(1)];
      const extraData = '0xabcd' as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures,
        extraData,
      });

      expect(proof.orderedHandles).toHaveLength(1);
      expect(proof.orderedClearValues).toHaveLength(1);
      expect(proof.orderedClearValues[0]).toBe(true);
      expect(proof.extraData).toBe(extraData);
    });

    it('should create proof with single euint8 handle', () => {
      const handles = [createHandle(2, 0)]; // euint8
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(['uint8'], [42]) as BytesHex;
      const signatures = [createSignature(1)];
      const extraData = '0x' as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures,
        extraData,
      });

      expect(proof.orderedClearValues[0]).toBe(42n);
    });

    it('should create proof with single euint256 handle', () => {
      const handles = [createHandle(8, 0)]; // euint256
      const coder = new AbiCoder();
      const bigValue = BigInt('0x' + 'ff'.repeat(32));
      const orderedDecryptedResult = coder.encode(
        ['uint256'],
        [bigValue],
      ) as BytesHex;
      const signatures = [createSignature(1)];
      const extraData = '0x' as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures,
        extraData,
      });

      expect(proof.orderedClearValues[0]).toBe(bigValue);
    });

    it('should create proof with single eaddress handle', () => {
      const handles = [createHandle(7, 0)]; // eaddress
      const coder = new AbiCoder();
      const address = '0x1234567890123456789012345678901234567890';
      const orderedDecryptedResult = coder.encode(
        ['address'],
        [address],
      ) as BytesHex;
      const signatures = [createSignature(1)];
      const extraData = '0x' as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures,
        extraData,
      });

      expect(proof.orderedClearValues[0]).toBe(address);
    });

    it('should create proof with multiple handles of different types', () => {
      const handles = [
        createHandle(0, 0), // ebool
        createHandle(2, 1), // euint8
        createHandle(4, 2), // euint32
        createHandle(7, 3), // eaddress
      ];
      const coder = new AbiCoder();
      // Use a properly checksummed address
      const address = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';
      const orderedDecryptedResult = coder.encode(
        ['bool', 'uint8', 'uint32', 'address'],
        [false, 255, 123456, address],
      ) as BytesHex;
      const signatures = [createSignature(1), createSignature(2)];
      const extraData = '0xdeadbeef' as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures,
        extraData,
      });

      expect(proof.orderedHandles).toHaveLength(4);
      expect(proof.orderedClearValues).toHaveLength(4);
      expect(proof.orderedClearValues[0]).toBe(false);
      expect(proof.orderedClearValues[1]).toBe(255n);
      expect(proof.orderedClearValues[2]).toBe(123456n);
      expect(proof.orderedClearValues[3]).toBe(address);
    });

    it('should throw when decrypted result is invalid', () => {
      const handles = [createHandle(0, 0), createHandle(2, 1)]; // 2 handles
      const coder = new AbiCoder();
      // Only encode 1 value - ethers will throw BUFFER_OVERRUN when trying to decode 2 values
      const orderedDecryptedResult = coder.encode(['bool'], [true]) as BytesHex;
      const signatures = [createSignature(1)];
      const extraData = '0x' as BytesHex;

      expect(() =>
        PublicDecryptionProof.from({
          orderedHandles: handles,
          orderedDecryptedResult,
          signatures,
          extraData,
        }),
      ).toThrow(); // ethers throws BUFFER_OVERRUN before the length check
    });
  });

  describe('proof construction', () => {
    it('should construct proof with numSigners + signatures + extraData', () => {
      const handles = [createHandle(2, 0)]; // euint8
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(['uint8'], [100]) as BytesHex;
      const signatures = [createSignature(0xaa), createSignature(0xbb)];
      const extraData = '0xcafe' as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures,
        extraData,
      });

      // Proof should start with number of signers (0x02)
      expect(proof.proof.startsWith('0x02')).toBe(true);
      // Proof should contain signatures
      expect(proof.proof).toContain('aa'.repeat(65));
      expect(proof.proof).toContain('bb'.repeat(65));
      // Proof should end with extraData (without 0x prefix)
      expect(proof.proof.endsWith('cafe')).toBe(true);
    });

    it('should handle zero signatures', () => {
      const handles = [createHandle(2, 0)];
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(['uint8'], [50]) as BytesHex;
      const signatures: Bytes65Hex[] = [];
      const extraData = '0x1234' as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures,
        extraData,
      });

      // Proof should start with 0x00 (0 signers)
      expect(proof.proof.startsWith('0x00')).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return frozen orderedHandles array', () => {
      const handles = [createHandle(2, 0)];
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(['uint8'], [10]) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0x' as BytesHex,
      });

      expect(Object.isFrozen(proof.orderedHandles)).toBe(true);
    });

    it('should return frozen orderedClearValues array', () => {
      const handles = [createHandle(2, 0)];
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(['uint8'], [10]) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0x' as BytesHex,
      });

      expect(Object.isFrozen(proof.orderedClearValues)).toBe(true);
    });
  });

  describe('orderedAbiEncodedClearValues', () => {
    it('should ABI encode ebool as uint256 (0 or 1)', () => {
      const handles = [createHandle(0, 0)]; // ebool
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(['bool'], [true]) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0x' as BytesHex,
      });

      // Decode the ABI encoded result
      const decoded = coder.decode(
        ['uint256'],
        proof.orderedAbiEncodedClearValues,
      );
      expect(decoded[0]).toBe(1n);
    });

    it('should ABI encode euint values as uint256', () => {
      const handles = [
        createHandle(2, 0), // euint8
        createHandle(5, 1), // euint64
      ];
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(
        ['uint8', 'uint64'],
        [200, BigInt('9223372036854775807')],
      ) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0x' as BytesHex,
      });

      const decoded = coder.decode(
        ['uint256', 'uint256'],
        proof.orderedAbiEncodedClearValues,
      );
      expect(decoded[0]).toBe(200n);
      expect(decoded[1]).toBe(BigInt('9223372036854775807'));
    });

    it('should ABI encode eaddress as padded hex string', () => {
      const handles = [createHandle(7, 0)]; // eaddress
      const coder = new AbiCoder();
      const address = '0x1234567890123456789012345678901234567890';
      const orderedDecryptedResult = coder.encode(
        ['address'],
        [address],
      ) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0x' as BytesHex,
      });

      // Should be ABI encoded as uint256
      const decoded = coder.decode(
        ['uint256'],
        proof.orderedAbiEncodedClearValues,
      );
      expect(decoded[0]).toBe(BigInt(address));
    });

    it('should handle ebool false correctly', () => {
      const handles = [createHandle(0, 0)]; // ebool
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(
        ['bool'],
        [false],
      ) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0x' as BytesHex,
      });

      // Decode and verify it's 0
      const decoded = coder.decode(
        ['uint256'],
        proof.orderedAbiEncodedClearValues,
      );
      expect(decoded[0]).toBe(0n);
    });
  });

  describe('toPublicDecryptResults', () => {
    it('should return PublicDecryptResults with all required fields', () => {
      const handles = [createHandle(2, 0), createHandle(4, 1)];
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(
        ['uint8', 'uint32'],
        [42, 999],
      ) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0xbeef' as BytesHex,
      });

      const results = proof.toPublicDecryptResults();

      expect(results.decryptionProof).toBe(proof.proof);
      expect(results.abiEncodedClearValues).toBe(
        proof.orderedAbiEncodedClearValues,
      );
      expect(Object.isFrozen(results)).toBe(true);
      expect(Object.isFrozen(results.clearValues)).toBe(true);
    });

    it('should map handles to clear values by handle bytes32hex', () => {
      const handles = [createHandle(2, 0), createHandle(4, 1)];
      const coder = new AbiCoder();
      const orderedDecryptedResult = coder.encode(
        ['uint8', 'uint32'],
        [42, 999],
      ) as BytesHex;

      const proof = PublicDecryptionProof.from({
        orderedHandles: handles,
        orderedDecryptedResult,
        signatures: [createSignature(1)],
        extraData: '0x' as BytesHex,
      });

      const results = proof.toPublicDecryptResults();

      // Check that each handle's bytes32hex maps to the correct clear value
      const handle0Key = handles[0].toBytes32Hex() as Bytes32Hex;
      const handle1Key = handles[1].toBytes32Hex() as Bytes32Hex;

      expect(results.clearValues[handle0Key]).toBe(42n);
      expect(results.clearValues[handle1Key]).toBe(999n);
    });
  });
});
