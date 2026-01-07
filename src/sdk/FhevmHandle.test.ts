import fs from 'fs';
import path from 'path';
import type {
  Bytes21Hex,
  Bytes32Hex,
  FheTypeId,
} from '../base/types/primitives';
import { bytesToHex, hexToBytes } from '../base/bytes';
import {
  assertIsHandleLike,
  FhevmHandle,
  toHandleBytes32Hex,
} from './FhevmHandle';
import { FhevmHandleError } from '../errors/FhevmHandleError';
import { ZKProof } from './ZKProof';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/sdk/FhevmHandle.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/sdk/FhevmHandle.test.ts --collectCoverageFrom='./src/sdk/FhevmHandle.ts'
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Constants
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

// Valid handle hex from test assets
const VALID_HANDLE_HEX = INPUT_PROOF_ASSET_1.handles[0] as Bytes32Hex;

// A valid 21-byte hash (42 hex chars + 0x prefix)
const VALID_HASH21 =
  '0x1234567890abcdef1234567890abcdef12345678ab' as Bytes21Hex;
const VALID_CHAIN_ID = 11155111;
const VALID_FHE_TYPE_ID = 5 as FheTypeId; // euint64
const VALID_VERSION = 0;

function createValidHandleParams() {
  return {
    hash21: VALID_HASH21,
    chainId: VALID_CHAIN_ID,
    fheTypeId: VALID_FHE_TYPE_ID,
    version: VALID_VERSION,
    computed: false,
    index: 0,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('FhevmHandle', () => {
  //////////////////////////////////////////////////////////////////////////////
  // fromComponents - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('fromComponents', () => {
    it('creates handle with valid params', () => {
      const handle = FhevmHandle.fromComponents(createValidHandleParams());

      expect(handle).toBeInstanceOf(FhevmHandle);
    });

    it.each([VALID_CHAIN_ID, BigInt(VALID_CHAIN_ID)])(
      'creates handle with number or bigint chainId',
      (chainId: number | bigint) => {
        const params = {
          ...createValidHandleParams(),
          chainId,
        };
        const handle = FhevmHandle.fromComponents(params);

        expect(handle.chainId).toBe(BigInt(VALID_CHAIN_ID));
      },
    );

    it('creates handle with bigint chainId', () => {
      const params = {
        ...createValidHandleParams(),
        chainId: BigInt(VALID_CHAIN_ID),
      };

      const handle = FhevmHandle.fromComponents(params);

      expect(handle.chainId).toBe(BigInt(VALID_CHAIN_ID));
    });

    it('creates computed handle with index undefined', () => {
      const params = {
        ...createValidHandleParams(),
        computed: true,
        index: undefined,
      };

      const handle = FhevmHandle.fromComponents(params);

      expect(handle.computed).toBe(true);
      expect(handle.index).toBeUndefined();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromComponents - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('fromComponents validation', () => {
    it('throws for invalid chainId (negative)', () => {
      const params = {
        ...createValidHandleParams(),
        chainId: -1,
      };

      expect(() => FhevmHandle.fromComponents(params)).toThrow(
        FhevmHandleError,
      );
    });

    it('throws for invalid chainId (too large)', () => {
      const params = {
        ...createValidHandleParams(),
        chainId: BigInt('18446744073709551616'), // 2^64
      };

      expect(() => FhevmHandle.fromComponents(params)).toThrow(
        FhevmHandleError,
      );
    });

    it('throws for invalid hash21 (wrong length)', () => {
      const params = {
        ...createValidHandleParams(),
        hash21: '0x1234' as Bytes21Hex,
      };

      expect(() => FhevmHandle.fromComponents(params)).toThrow(
        FhevmHandleError,
      );
    });

    it('throws for invalid hash21 (not hex)', () => {
      const params = {
        ...createValidHandleParams(),
        hash21: 'not a hex string' as Bytes21Hex,
      };

      expect(() => FhevmHandle.fromComponents(params)).toThrow(
        FhevmHandleError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let handle: FhevmHandle;

    beforeEach(() => {
      handle = FhevmHandle.fromComponents(createValidHandleParams());
    });

    it('hash21 returns the hash21', () => {
      expect(handle.hash21).toBe(VALID_HASH21);
    });

    it('chainId returns bigint', () => {
      expect(handle.chainId).toBe(BigInt(VALID_CHAIN_ID));
    });

    it('fheTypeId returns the fheTypeId', () => {
      expect(handle.fheTypeId).toBe(VALID_FHE_TYPE_ID);
    });

    it('fheTypeName returns correct name for euint64', () => {
      expect(handle.fheTypeName).toBe('euint64');
    });

    it('version returns the version', () => {
      expect(handle.version).toBe(VALID_VERSION);
    });

    it('computed returns false for non-computed handle', () => {
      expect(handle.computed).toBe(false);
    });

    it('index returns the index', () => {
      expect(handle.index).toBe(0);
    });

    it('encryptionBits returns correct value for euint64', () => {
      expect(handle.encryptionBits).toBe(64);
    });

    it('solidityPrimitiveTypeName returns correct type for euint64', () => {
      // All FHE types map to uint256 in Solidity (handle representation)
      expect(handle.solidityPrimitiveTypeName).toBe('uint256');
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toJSON
  //////////////////////////////////////////////////////////////////////////////

  describe('toJSON', () => {
    it('returns object with all handle properties', () => {
      const handle = FhevmHandle.fromComponents(createValidHandleParams());
      const json = handle.toJSON();

      expect(json).toHaveProperty('handle');
      expect(json).toHaveProperty('fheTypeName', 'euint64');
      expect(json).toHaveProperty('fheTypeId', VALID_FHE_TYPE_ID);
      expect(json).toHaveProperty('chainId', BigInt(VALID_CHAIN_ID));
      expect(json).toHaveProperty('index', 0);
      expect(json).toHaveProperty('computed', false);
      expect(json).toHaveProperty('encryptionBits', 64);
      expect(json).toHaveProperty('version', VALID_VERSION);
      expect(json).toHaveProperty('solidityPrimitiveTypeName', 'uint256');
      expect(json).toHaveProperty('hash21', VALID_HASH21);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // equals
  //////////////////////////////////////////////////////////////////////////////

  describe('equals', () => {
    it('returns true for equal handles', () => {
      const handle1 = FhevmHandle.fromComponents(createValidHandleParams());
      const handle2 = FhevmHandle.fromComponents(createValidHandleParams());

      expect(handle1.equals(handle2)).toBe(true);
    });

    it('returns false for different hash21', () => {
      const handle1 = FhevmHandle.fromComponents(createValidHandleParams());
      const handle2 = FhevmHandle.fromComponents({
        ...createValidHandleParams(),
        hash21: '0xabcdef1234567890abcdef1234567890abcdef12ab' as Bytes21Hex,
      });

      expect(handle1.equals(handle2)).toBe(false);
    });

    it('returns false for different chainId', () => {
      const handle1 = FhevmHandle.fromComponents(createValidHandleParams());
      const handle2 = FhevmHandle.fromComponents({
        ...createValidHandleParams(),
        chainId: 1,
      });

      expect(handle1.equals(handle2)).toBe(false);
    });

    it('returns false for different fheTypeId', () => {
      const handle1 = FhevmHandle.fromComponents(createValidHandleParams());
      const handle2 = FhevmHandle.fromComponents({
        ...createValidHandleParams(),
        fheTypeId: 4 as FheTypeId, // euint32
      });

      expect(handle1.equals(handle2)).toBe(false);
    });

    it('returns false for different version', () => {
      const handle1 = FhevmHandle.fromComponents(createValidHandleParams());
      const handle2 = FhevmHandle.fromComponents({
        ...createValidHandleParams(),
        version: 1,
      });

      expect(handle1.equals(handle2)).toBe(false);
    });

    it('returns false for different computed flag', () => {
      const handle1 = FhevmHandle.fromComponents(createValidHandleParams());
      const handle2 = FhevmHandle.fromComponents({
        ...createValidHandleParams(),
        computed: true,
        index: undefined,
      });

      expect(handle1.equals(handle2)).toBe(false);
    });

    it('returns false for different index', () => {
      const handle1 = FhevmHandle.fromComponents(createValidHandleParams());
      const handle2 = FhevmHandle.fromComponents({
        ...createValidHandleParams(),
        index: 1,
      });

      expect(handle1.equals(handle2)).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toBytes32 and toBytes32Hex
  //////////////////////////////////////////////////////////////////////////////

  describe('toBytes32 and toBytes32Hex', () => {
    it('toBytes32 returns 32-byte Uint8Array', () => {
      const handle = FhevmHandle.fromComponents(createValidHandleParams());
      const bytes = handle.toBytes32();

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(32);
    });

    it('toBytes32Hex returns hex string', () => {
      const handle = FhevmHandle.fromComponents(createValidHandleParams());
      const hex = handle.toBytes32Hex();

      expect(hex).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it('toBytes32 caches result', () => {
      const handle = FhevmHandle.fromComponents(createValidHandleParams());
      const bytes1 = handle.toBytes32();
      const bytes2 = handle.toBytes32();

      expect(bytes1).toBe(bytes2);
    });

    it('toBytes32Hex caches result', () => {
      const handle = FhevmHandle.fromComponents(createValidHandleParams());
      const hex1 = handle.toBytes32Hex();
      const hex2 = handle.toBytes32Hex();

      expect(hex1).toBe(hex2);
    });

    it('computed handle has index byte set to 255', () => {
      const handle = FhevmHandle.fromComponents({
        ...createValidHandleParams(),
        computed: true,
        index: undefined,
      });
      const bytes = handle.toBytes32();

      expect(bytes[21]).toBe(255);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // from
  //////////////////////////////////////////////////////////////////////////////

  describe('from', () => {
    it('returns same instance for FhevmHandle input', () => {
      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const result = FhevmHandle.from(handle);

      expect(result).toBe(handle);
    });

    it('parses string input', () => {
      const handle = FhevmHandle.from(VALID_HANDLE_HEX);

      expect(handle).toBeInstanceOf(FhevmHandle);
      expect(handle.toBytes32Hex()).toBe(VALID_HANDLE_HEX);
    });

    it('parses Uint8Array input', () => {
      const bytes = hexToBytes(VALID_HANDLE_HEX);
      const handle = FhevmHandle.from(bytes);

      expect(handle).toBeInstanceOf(FhevmHandle);
      expect(handle.toBytes32Hex()).toBe(VALID_HANDLE_HEX);
    });

    it('throws for invalid input type', () => {
      expect(() => FhevmHandle.from(123)).toThrow(FhevmHandleError);
      expect(() => FhevmHandle.from(null)).toThrow(FhevmHandleError);
      expect(() => FhevmHandle.from({})).toThrow(FhevmHandleError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromBytes32
  //////////////////////////////////////////////////////////////////////////////

  describe('fromBytes32', () => {
    it('parses valid bytes32', () => {
      const bytes = hexToBytes(VALID_HANDLE_HEX);
      const handle = FhevmHandle.fromBytes32(bytes);

      expect(handle).toBeInstanceOf(FhevmHandle);
    });

    it('throws for invalid bytes32 (wrong length)', () => {
      const bytes = new Uint8Array(16);

      expect(() => FhevmHandle.fromBytes32(bytes)).toThrow(FhevmHandleError);
    });

    it('throws for invalid fheTypeId in bytes', () => {
      const bytes = hexToBytes(VALID_HANDLE_HEX);
      bytes[30] = 99; // Invalid fheTypeId

      expect(() => FhevmHandle.fromBytes32(bytes)).toThrow(FhevmHandleError);
    });

    it('correctly extracts computed flag (index = 255)', () => {
      const bytes = hexToBytes(VALID_HANDLE_HEX);
      bytes[21] = 255; // Set computed flag

      const handle = FhevmHandle.fromBytes32(bytes);

      expect(handle.computed).toBe(true);
      expect(handle.index).toBeUndefined();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromBytes32Hex
  //////////////////////////////////////////////////////////////////////////////

  describe('fromBytes32Hex', () => {
    it('parses valid hex string', () => {
      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);

      expect(handle).toBeInstanceOf(FhevmHandle);
      expect(handle.toBytes32Hex()).toBe(VALID_HANDLE_HEX);
    });

    it('throws for invalid hex string', () => {
      expect(() => FhevmHandle.fromBytes32Hex('0xinvalid')).toThrow(
        FhevmHandleError,
      );
    });

    it('throws for non-string input', () => {
      expect(() => FhevmHandle.fromBytes32Hex(123 as any)).toThrow(
        FhevmHandleError,
      );
    });

    it('throws for wrong length hex string', () => {
      expect(() => FhevmHandle.fromBytes32Hex('0x1234')).toThrow(
        FhevmHandleError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // parse and canParse
  //////////////////////////////////////////////////////////////////////////////

  describe('parse', () => {
    it('parses hex string', () => {
      const handle = FhevmHandle.from(VALID_HANDLE_HEX);

      expect(handle).toBeInstanceOf(FhevmHandle);
    });

    it('parses Uint8Array', () => {
      const bytes = hexToBytes(VALID_HANDLE_HEX);
      const handle = FhevmHandle.from(bytes);

      expect(handle).toBeInstanceOf(FhevmHandle);
    });
  });

  describe('canParse', () => {
    it('returns true for valid hex string', () => {
      expect(FhevmHandle.canParse(VALID_HANDLE_HEX)).toBe(true);
    });

    it('returns true for valid Uint8Array', () => {
      const bytes = hexToBytes(VALID_HANDLE_HEX);
      expect(FhevmHandle.canParse(bytes)).toBe(true);
    });

    it('returns false for invalid hex string', () => {
      expect(FhevmHandle.canParse('0xinvalid')).toBe(false);
    });

    it('returns false for invalid Uint8Array', () => {
      const bytes = new Uint8Array(16);
      expect(FhevmHandle.canParse(bytes)).toBe(false);
    });

    it('returns false for invalid type', () => {
      expect(FhevmHandle.canParse(123)).toBe(false);
      expect(FhevmHandle.canParse(null)).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // assertIsHandleHex
  //////////////////////////////////////////////////////////////////////////////

  describe('assertIsHandleHex', () => {
    it('does not throw for valid handle hex', () => {
      expect(() => assertIsHandleLike(VALID_HANDLE_HEX)).not.toThrow();
    });

    it('throws for non-string input', () => {
      expect(() => assertIsHandleLike(123)).toThrow(FhevmHandleError);
    });

    it('throws for invalid handle hex', () => {
      expect(() => assertIsHandleLike('0xinvalid')).toThrow(FhevmHandleError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Static constants and helpers
  //////////////////////////////////////////////////////////////////////////////

  describe('static constants', () => {
    it('RAW_CT_HASH_DOMAIN_SEPARATOR is correct', () => {
      expect(FhevmHandle.RAW_CT_HASH_DOMAIN_SEPARATOR).toBe('ZK-w_rct');
    });

    it('HANDLE_HASH_DOMAIN_SEPARATOR is correct', () => {
      expect(FhevmHandle.HANDLE_HASH_DOMAIN_SEPARATOR).toBe('ZK-w_hdl');
    });

    it('CURRENT_CIPHERTEXT_VERSION is correct', () => {
      expect(FhevmHandle.CURRENT_CIPHERTEXT_VERSION).toBe(0);
    });

    it('currentCiphertextVersion returns CURRENT_CIPHERTEXT_VERSION', () => {
      expect(FhevmHandle.currentCiphertextVersion()).toBe(
        FhevmHandle.CURRENT_CIPHERTEXT_VERSION,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromZKProof - existing tests
  //////////////////////////////////////////////////////////////////////////////

  describe('fromZKProof', () => {
    it('fromZKProof 1', () => {
      const zkProof = ZKProof.fromComponents({
        ciphertextWithZKProof:
          INPUT_PROOF_ASSET_1.ciphertextWithInputVerification,
        aclContractAddress: INPUT_PROOF_ASSET_1.aclAddress,
        chainId: BigInt(INPUT_PROOF_ASSET_1.chainId),
        encryptionBits: INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths,
        contractAddress: INPUT_PROOF_ASSET_1.contractAddress,
        userAddress: INPUT_PROOF_ASSET_1.userAddress,
      });
      const handles = FhevmHandle.fromZKProof(
        zkProof,
        INPUT_PROOF_ASSET_1.ciphertextVersion,
      );
      expect(handles[0].toBytes32Hex()).toEqual(INPUT_PROOF_ASSET_1.handles[0]);

      for (let i = 0; i < handles.length; ++i) {
        const h = handles[i].toBytes32Hex();
        expect(FhevmHandle.fromBytes32Hex(h).toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_1.handles[i],
        );
        expect(FhevmHandle.fromComponents(handles[i]).toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_1.handles[i],
        );
        expect(handles[i].encryptionBits).toEqual(
          INPUT_PROOF_ASSET_1.fheTypeEncryptionBitwidths[i],
        );
      }
    });

    it('fromZKProof 2', () => {
      const zkProof = ZKProof.fromComponents({
        ciphertextWithZKProof:
          INPUT_PROOF_ASSET_2.ciphertextWithInputVerification,
        aclContractAddress: INPUT_PROOF_ASSET_2.aclAddress,
        chainId: INPUT_PROOF_ASSET_2.chainId,
        encryptionBits: INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths,
        contractAddress: INPUT_PROOF_ASSET_2.contractAddress,
        userAddress: INPUT_PROOF_ASSET_2.userAddress,
      });
      const handles = FhevmHandle.fromZKProof(
        zkProof,
        INPUT_PROOF_ASSET_2.ciphertextVersion,
      );
      expect(handles.length).toEqual(
        INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths.length,
      );
      for (let i = 0; i < handles.length; ++i) {
        expect(handles[i].toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_2.handles[i],
        );
      }

      for (let i = 0; i < handles.length; ++i) {
        const h = handles[i].toBytes32Hex();
        expect(FhevmHandle.fromBytes32Hex(h).toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_2.handles[i],
        );
        expect(FhevmHandle.fromComponents(handles[i]).toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_2.handles[i],
        );
        expect(handles[i].encryptionBits).toEqual(
          INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths[i],
        );
      }
    });

    it('fromZKProof 3', () => {
      const zkProof = ZKProof.fromComponents({
        ciphertextWithZKProof:
          INPUT_PROOF_ASSET_3.ciphertextWithInputVerification,
        aclContractAddress: INPUT_PROOF_ASSET_3.aclAddress,
        chainId: INPUT_PROOF_ASSET_3.chainId,
        encryptionBits: INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths,
        contractAddress: INPUT_PROOF_ASSET_3.contractAddress,
        userAddress: INPUT_PROOF_ASSET_3.userAddress,
      });
      const handles = FhevmHandle.fromZKProof(
        zkProof,
        INPUT_PROOF_ASSET_3.ciphertextVersion,
      );
      expect(handles.length).toEqual(
        INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths.length,
      );
      for (let i = 0; i < handles.length; ++i) {
        expect(handles[i].toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_3.handles[i],
        );
      }

      for (let i = 0; i < handles.length; ++i) {
        const h = handles[i].toBytes32Hex();
        expect(FhevmHandle.fromBytes32Hex(h).toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_3.handles[i],
        );
        expect(FhevmHandle.fromComponents(handles[i]).toBytes32Hex()).toEqual(
          INPUT_PROOF_ASSET_3.handles[i],
        );
        expect(handles[i].encryptionBits).toEqual(
          INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths[i],
        );
      }
    });

    it('bytesToHex(hexToBytes)', () => {
      expect(
        bytesToHex(
          hexToBytes(INPUT_PROOF_ASSET_1.ciphertextWithInputVerification),
        ),
      ).toEqual(INPUT_PROOF_ASSET_1.ciphertextWithInputVerification);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toHandleBytes32Hex
  //////////////////////////////////////////////////////////////////////////////

  describe('toHandleBytes32Hex', () => {
    it('returns toBytes32Hex() for FhevmHandle input', () => {
      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const result = toHandleBytes32Hex(handle);

      expect(result).toBe(VALID_HANDLE_HEX);
    });

    it('returns input unchanged for Bytes32Hex string', () => {
      const result = toHandleBytes32Hex(VALID_HANDLE_HEX);

      expect(result).toBe(VALID_HANDLE_HEX);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // assertIsHandleLike
  //////////////////////////////////////////////////////////////////////////////

  describe('assertIsHandleLike', () => {
    it('does not throw for FhevmHandle input', () => {
      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);

      expect(() => FhevmHandle.assertIsHandleLike(handle)).not.toThrow();
    });

    it('does not throw for valid Bytes32Hex string', () => {
      expect(() =>
        FhevmHandle.assertIsHandleLike(VALID_HANDLE_HEX),
      ).not.toThrow();
    });

    it('throws for invalid input', () => {
      expect(() => FhevmHandle.assertIsHandleLike('0xinvalid')).toThrow(
        FhevmHandleError,
      );
    });

    it('throws for non-string, non-FhevmHandle input', () => {
      expect(() => FhevmHandle.assertIsHandleLike(123)).toThrow(
        FhevmHandleError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toString
  //////////////////////////////////////////////////////////////////////////////

  describe('toString', () => {
    it('returns same value as toBytes32Hex', () => {
      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);

      expect(handle.toString()).toBe(handle.toBytes32Hex());
      expect(handle.toString()).toBe(VALID_HANDLE_HEX);
    });
  });
});
