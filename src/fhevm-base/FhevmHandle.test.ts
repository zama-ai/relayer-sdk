import fs from 'fs';
import path from 'path';
import {
  assertIsFhevmHandleLike,
  isFhevmHandleLike,
  isFhevmHandleBytes32,
  isFhevmHandleBytes32Hex,
  isFhevmHandle,
  toFhevmHandle,
  fhevmHandleLikeToFhevmHandle,
  fhevmHandleEquals,
  asFhevmHandleBytes32,
  asFhevmHandleBytes32Hex,
  buildFhevmHandle,
} from './FhevmHandle';
import { FhevmHandleError } from './errors/FhevmHandleError';
import type {
  FheTypeId,
  FheTypeName,
  EncryptionBits,
  SolidityPrimitiveTypeName,
  FhevmHandle,
  FhevmHandleBytes32Hex,
} from './types/public-api';
import { InvalidTypeError } from '@base/errors/InvalidTypeError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/fhevm-base/FhevmHandle.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/fhevm-base/FhevmHandle.test.ts --collectCoverageFrom='./src/fhevm-handle/FhevmHandle.ts'
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
// Test Data from INPUT_PROOF_ASSET_3
////////////////////////////////////////////////////////////////////////////////

/**
 * Test data structure for FhevmHandle tests.
 * Each entry contains expected values extracted from INPUT_PROOF_ASSET_3.
 *
 * Handle structure (32 bytes):
 * - Bytes 0-20 (21 bytes): hash21
 * - Byte 21: index (255 = computed)
 * - Bytes 22-29 (8 bytes): chainId (big-endian uint64)
 * - Byte 30: fheTypeId
 * - Byte 31: version
 */
interface HandleTestCase {
  handleHex: string;
  computedHandleBytes: Record<string, number>;
  index: number;
  chainId: bigint;
  fheTypeId: FheTypeId;
  fheTypeName: FheTypeName;
  version: number;
  encryptionBits: EncryptionBits;
  solidityPrimitiveTypeName: SolidityPrimitiveTypeName;
  isComputed: boolean;
  isExternal: boolean;
  hash21: string;
}

const HANDLE_TEST_CASES: HandleTestCase[] = [
  // ============================================================================
  // INPUT_PROOF_ASSET_2: ebool, euint8, euint32, euint64
  // ============================================================================
  {
    // Handle 0: ebool
    handleHex:
      '0xb956f5d8a5c3652952eecba34451c57820979f3b2d000000000000aa36a70000',
    computedHandleBytes: INPUT_PROOF_ASSET_2.computed_handles[0],
    index: 0,
    chainId: BigInt(INPUT_PROOF_ASSET_2.chainId),
    fheTypeId: INPUT_PROOF_ASSET_2.fheTypeIds[0] as FheTypeId,
    fheTypeName: 'ebool',
    version: INPUT_PROOF_ASSET_2.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_2
      .fheTypeEncryptionBitwidths[0] as EncryptionBits,
    solidityPrimitiveTypeName: 'bool',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0xb956f5d8a5c3652952eecba34451c57820979f3b2d',
  },
  {
    // Handle 1: euint8
    handleHex:
      '0xe60b67abc7cb34f1a3ca5427acf62ffd4099170e4b010000000000aa36a70200',
    computedHandleBytes: INPUT_PROOF_ASSET_2.computed_handles[1],
    index: 1,
    chainId: BigInt(INPUT_PROOF_ASSET_2.chainId),
    fheTypeId: INPUT_PROOF_ASSET_2.fheTypeIds[1] as FheTypeId,
    fheTypeName: 'euint8',
    version: INPUT_PROOF_ASSET_2.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_2
      .fheTypeEncryptionBitwidths[1] as EncryptionBits,
    solidityPrimitiveTypeName: 'uint256',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0xe60b67abc7cb34f1a3ca5427acf62ffd4099170e4b',
  },
  {
    // Handle 2: euint32
    handleHex:
      '0xc8f67727303d04bcc94c9d727e296c4dfcb15397eb020000000000aa36a70400',
    computedHandleBytes: INPUT_PROOF_ASSET_2.computed_handles[2],
    index: 2,
    chainId: BigInt(INPUT_PROOF_ASSET_2.chainId),
    fheTypeId: INPUT_PROOF_ASSET_2.fheTypeIds[2] as FheTypeId,
    fheTypeName: 'euint32',
    version: INPUT_PROOF_ASSET_2.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_2
      .fheTypeEncryptionBitwidths[2] as EncryptionBits,
    solidityPrimitiveTypeName: 'uint256',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0xc8f67727303d04bcc94c9d727e296c4dfcb15397eb',
  },
  {
    // Handle 3: euint64
    handleHex:
      '0xf6900fa64431b7c9a08b68e7141a92e8af020a435d030000000000aa36a70500',
    computedHandleBytes: INPUT_PROOF_ASSET_2.computed_handles[3],
    index: 3,
    chainId: BigInt(INPUT_PROOF_ASSET_2.chainId),
    fheTypeId: INPUT_PROOF_ASSET_2.fheTypeIds[3] as FheTypeId,
    fheTypeName: 'euint64',
    version: INPUT_PROOF_ASSET_2.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_2
      .fheTypeEncryptionBitwidths[3] as EncryptionBits,
    solidityPrimitiveTypeName: 'uint256',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0xf6900fa64431b7c9a08b68e7141a92e8af020a435d',
  },
  // ============================================================================
  // INPUT_PROOF_ASSET_3: euint16, euint128, eaddress, euint256
  // ============================================================================
  {
    // Handle 0: euint16
    handleHex:
      '0x99f3713714e82df39fe8e2bffa56769e505ae35953000000000000aa36a70300',
    computedHandleBytes: INPUT_PROOF_ASSET_3.computed_handles[0],
    index: 0,
    chainId: BigInt(INPUT_PROOF_ASSET_3.chainId),
    fheTypeId: INPUT_PROOF_ASSET_3.fheTypeIds[0] as FheTypeId,
    fheTypeName: 'euint16',
    version: INPUT_PROOF_ASSET_3.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_3
      .fheTypeEncryptionBitwidths[0] as EncryptionBits,
    solidityPrimitiveTypeName: 'uint256',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0x99f3713714e82df39fe8e2bffa56769e505ae35953',
  },
  {
    // Handle 1: euint128
    handleHex:
      '0x6e830b7c80a4113a0626b1937431b6150adab2d983010000000000aa36a70600',
    computedHandleBytes: INPUT_PROOF_ASSET_3.computed_handles[1],
    index: 1,
    chainId: BigInt(INPUT_PROOF_ASSET_3.chainId),
    fheTypeId: INPUT_PROOF_ASSET_3.fheTypeIds[1] as FheTypeId,
    fheTypeName: 'euint128',
    version: INPUT_PROOF_ASSET_3.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_3
      .fheTypeEncryptionBitwidths[1] as EncryptionBits,
    solidityPrimitiveTypeName: 'uint256',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0x6e830b7c80a4113a0626b1937431b6150adab2d983',
  },
  {
    // Handle 2: eaddress
    handleHex:
      '0x7ad65d7b4cc563f40266d001f04f2f0b124686deb3020000000000aa36a70700',
    computedHandleBytes: INPUT_PROOF_ASSET_3.computed_handles[2],
    index: 2,
    chainId: BigInt(INPUT_PROOF_ASSET_3.chainId),
    fheTypeId: INPUT_PROOF_ASSET_3.fheTypeIds[2] as FheTypeId,
    fheTypeName: 'eaddress',
    version: INPUT_PROOF_ASSET_3.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_3
      .fheTypeEncryptionBitwidths[2] as EncryptionBits,
    solidityPrimitiveTypeName: 'address',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0x7ad65d7b4cc563f40266d001f04f2f0b124686deb3',
  },
  {
    // Handle 3: euint256
    handleHex:
      '0x58fab174f55bb8a8f771704d9302fe78c2ac37d7cc030000000000aa36a70800',
    computedHandleBytes: INPUT_PROOF_ASSET_3.computed_handles[3],
    index: 3,
    chainId: BigInt(INPUT_PROOF_ASSET_3.chainId),
    fheTypeId: INPUT_PROOF_ASSET_3.fheTypeIds[3] as FheTypeId,
    fheTypeName: 'euint256',
    version: INPUT_PROOF_ASSET_3.ciphertextVersion,
    encryptionBits: INPUT_PROOF_ASSET_3
      .fheTypeEncryptionBitwidths[3] as EncryptionBits,
    solidityPrimitiveTypeName: 'uint256',
    isComputed: false,
    isExternal: true,
    // hash21 = bytes 0-20 (21 bytes = 42 hex chars)
    hash21: '0x58fab174f55bb8a8f771704d9302fe78c2ac37d7cc',
  },
];

/**
 * Helper to convert computed_handles object to Uint8Array
 */
function computedHandleToBytes(
  computedHandle: Record<string, number>,
): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = computedHandle[i.toString()];
  }
  return bytes;
}

////////////////////////////////////////////////////////////////////////////////
// Tests
////////////////////////////////////////////////////////////////////////////////

describe('FhevmHandle', () => {
  describe('toFhevmHandle', () => {
    describe('from hex string', () => {
      it.each(HANDLE_TEST_CASES)(
        'should create FhevmHandle from hex string for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle).toBeDefined();
          expect(handle.bytes32Hex).toBe(testCase.handleHex);
        },
      );

      it('should handle lowercase hex strings', () => {
        const testCase = HANDLE_TEST_CASES[0];
        const handle = toFhevmHandle(testCase.handleHex.toLowerCase());
        expect(handle.bytes32Hex.toLowerCase()).toBe(
          testCase.handleHex.toLowerCase(),
        );
      });

      it('should throw for invalid hex string (wrong length)', () => {
        expect(() => toFhevmHandle('0x1234')).toThrow(InvalidTypeError);
      });

      it('should throw for non-hex string', () => {
        expect(() => toFhevmHandle('not a hex string')).toThrow(
          InvalidTypeError,
        );
      });

      it('should throw for hex string without 0x prefix', () => {
        const testCase = HANDLE_TEST_CASES[0];
        const hexWithout0x = testCase.handleHex.slice(2);
        expect(() => toFhevmHandle(hexWithout0x)).toThrow(InvalidTypeError);
      });
    });

    describe('from Uint8Array', () => {
      it.each(HANDLE_TEST_CASES)(
        'should create FhevmHandle from Uint8Array for $fheTypeName',
        (testCase) => {
          const bytes = computedHandleToBytes(testCase.computedHandleBytes);
          const handle = toFhevmHandle(bytes);
          expect(handle).toBeDefined();
          expect(handle.bytes32Hex.toLowerCase()).toBe(
            testCase.handleHex.toLowerCase(),
          );
        },
      );

      it('should throw for Uint8Array with wrong length', () => {
        const bytes = new Uint8Array(16);
        expect(() => toFhevmHandle(bytes)).toThrow(InvalidTypeError);
      });
    });

    describe('from object with bytes32Hex', () => {
      it.each(HANDLE_TEST_CASES)(
        'should create FhevmHandle from object with bytes32Hex for $fheTypeName',
        (testCase) => {
          const obj = {
            bytes32Hex: testCase.handleHex as FhevmHandleBytes32Hex,
          };
          const handle = toFhevmHandle(obj);
          expect(handle).toBeDefined();
          expect(handle.bytes32Hex).toBe(testCase.handleHex);
        },
      );
    });

    describe('from existing FhevmHandle', () => {
      it('should return the same instance for FhevmHandle input', () => {
        const testCase = HANDLE_TEST_CASES[0];
        const handle1 = toFhevmHandle(testCase.handleHex);
        const handle2 = toFhevmHandle(handle1);
        expect(handle2).toBe(handle1);
      });
    });

    describe('invalid fheTypeId', () => {
      it('should throw for invalid fheTypeId (1 - deprecated euint4)', () => {
        // Create a handle with fheTypeId = 1 (deprecated)
        const invalidHandle =
          '0x99f3713714e82df39fe8e2bffa56769e505ae35953000000000000aa36a70100';
        expect(() => toFhevmHandle(invalidHandle)).toThrow(FhevmHandleError);
      });

      it('should throw for invalid fheTypeId (9 - out of range)', () => {
        const invalidHandle =
          '0x99f3713714e82df39fe8e2bffa56769e505ae35953000000000000aa36a70900';
        expect(() => toFhevmHandle(invalidHandle)).toThrow(FhevmHandleError);
      });
    });

    describe('invalid version', () => {
      it('should throw for invalid version (non-zero)', () => {
        // Create a handle with version = 1 (invalid - only 0 is valid)
        const invalidHandle =
          '0x99f3713714e82df39fe8e2bffa56769e505ae35953000000000000aa36a70301';
        expect(() => toFhevmHandle(invalidHandle)).toThrow(FhevmHandleError);
      });
    });
  });

  describe('FhevmHandle getters', () => {
    describe('bytes32Hex', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct bytes32Hex for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.bytes32Hex).toBe(testCase.handleHex);
        },
      );
    });

    describe('bytes32HexNo0x', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return hex without 0x prefix for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.bytes32HexNo0x).toBe(testCase.handleHex.slice(2));
        },
      );
    });

    describe('bytes32', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct bytes32 for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          const expectedBytes = computedHandleToBytes(
            testCase.computedHandleBytes,
          );
          expect(handle.bytes32).toEqual(expectedBytes);
        },
      );

      it('should return a copy of bytes32', () => {
        const testCase = HANDLE_TEST_CASES[0];
        const handle = toFhevmHandle(testCase.handleHex);
        const bytes1 = handle.bytes32;
        const bytes2 = handle.bytes32;
        expect(bytes1).not.toBe(bytes2);
        expect(bytes1).toEqual(bytes2);
      });
    });

    describe('hash21', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct hash21 for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.hash21.toLowerCase()).toBe(
            testCase.hash21.toLowerCase(),
          );
        },
      );
    });

    describe('chainId', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct chainId for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.chainId).toBe(testCase.chainId);
        },
      );
    });

    describe('fheTypeId', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct fheTypeId for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.fheTypeId).toBe(testCase.fheTypeId);
        },
      );
    });

    describe('fheTypeName', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct fheTypeName for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.fheTypeName).toBe(testCase.fheTypeName);
        },
      );
    });

    describe('version', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct version for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.version).toBe(testCase.version);
        },
      );
    });

    describe('index', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct index for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.index).toBe(testCase.index);
        },
      );

      it('should return undefined for computed handles (index = 255)', () => {
        // Create a handle with index = 255 (computed)
        // byte 21 (chars 42-43 after 0x) set to ff
        const computedHandle =
          '0x99f3713714e82df39fe8e2bffa56769e505ae35953ff0000000000aa36a70300';
        const handle = toFhevmHandle(computedHandle);
        expect(handle.index).toBeUndefined();
      });
    });

    describe('isComputed', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct isComputed for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.isComputed).toBe(testCase.isComputed);
        },
      );

      it('should return true for computed handles (index = 255)', () => {
        // byte 21 (chars 42-43 after 0x) set to ff
        const computedHandle =
          '0x99f3713714e82df39fe8e2bffa56769e505ae35953ff0000000000aa36a70300';
        const handle = toFhevmHandle(computedHandle);
        expect(handle.isComputed).toBe(true);
      });
    });

    describe('isExternal', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct isExternal for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.isExternal).toBe(testCase.isExternal);
        },
      );

      it('should return false for computed handles', () => {
        // byte 21 (chars 42-43 after 0x) set to ff
        const computedHandle =
          '0x99f3713714e82df39fe8e2bffa56769e505ae35953ff0000000000aa36a70300';
        const handle = toFhevmHandle(computedHandle);
        expect(handle.isExternal).toBe(false);
      });
    });

    describe('encryptionBits', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct encryptionBits for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.encryptionBits).toBe(testCase.encryptionBits);
        },
      );
    });

    describe('solidityPrimitiveTypeName', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return correct solidityPrimitiveTypeName for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.solidityPrimitiveTypeName).toBe(
            testCase.solidityPrimitiveTypeName,
          );
        },
      );
    });

    describe('toString', () => {
      it.each(HANDLE_TEST_CASES)(
        'should return bytes32Hex for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          expect(handle.toString()).toBe(testCase.handleHex);
        },
      );
    });

    describe('JSON serialization', () => {
      it.each(HANDLE_TEST_CASES)(
        'should serialize correctly with JSON.stringify for $fheTypeName',
        (testCase) => {
          const handle = toFhevmHandle(testCase.handleHex);
          const json = JSON.stringify({ handle });
          expect(JSON.parse(json)).toEqual({ handle: testCase.handleHex });
        },
      );
    });
  });

  describe('isFhevmHandleLike', () => {
    it.each(HANDLE_TEST_CASES)(
      'should return true for valid hex string ($fheTypeName)',
      (testCase) => {
        expect(isFhevmHandleLike(testCase.handleHex)).toBe(true);
      },
    );

    it.each(HANDLE_TEST_CASES)(
      'should return true for valid Uint8Array ($fheTypeName)',
      (testCase) => {
        const bytes = computedHandleToBytes(testCase.computedHandleBytes);
        expect(isFhevmHandleLike(bytes)).toBe(true);
      },
    );

    it.each(HANDLE_TEST_CASES)(
      'should return true for object with bytes32Hex ($fheTypeName)',
      (testCase) => {
        const obj = { bytes32Hex: testCase.handleHex };
        expect(isFhevmHandleLike(obj)).toBe(true);
      },
    );

    it.each(HANDLE_TEST_CASES)(
      'should return true for FhevmHandle instance ($fheTypeName)',
      (testCase) => {
        const handle = toFhevmHandle(testCase.handleHex);
        expect(isFhevmHandleLike(handle)).toBe(true);
      },
    );

    it('should return false for invalid values', () => {
      expect(isFhevmHandleLike(null)).toBe(false);
      expect(isFhevmHandleLike(undefined)).toBe(false);
      expect(isFhevmHandleLike(123)).toBe(false);
      expect(isFhevmHandleLike('invalid')).toBe(false);
      expect(isFhevmHandleLike({})).toBe(false);
      expect(isFhevmHandleLike({ bytes32Hex: 'invalid' })).toBe(false);
    });
  });

  describe('assertIsFhevmHandleLike', () => {
    it.each(HANDLE_TEST_CASES)(
      'should not throw for valid hex string ($fheTypeName)',
      (testCase) => {
        expect(() => assertIsFhevmHandleLike(testCase.handleHex)).not.toThrow();
      },
    );

    it.each(HANDLE_TEST_CASES)(
      'should not throw for valid Uint8Array ($fheTypeName)',
      (testCase) => {
        const bytes = computedHandleToBytes(testCase.computedHandleBytes);
        expect(() => assertIsFhevmHandleLike(bytes)).not.toThrow();
      },
    );

    it('should throw for invalid values', () => {
      expect(() => assertIsFhevmHandleLike(null)).toThrow(FhevmHandleError);
      expect(() => assertIsFhevmHandleLike('invalid')).toThrow(
        FhevmHandleError,
      );
      expect(() => assertIsFhevmHandleLike(new Uint8Array(16))).toThrow(
        FhevmHandleError,
      );
    });
  });

  describe('isFhevmHandleBytes32Hex', () => {
    it.each(HANDLE_TEST_CASES)(
      'should return true for valid handle hex ($fheTypeName)',
      (testCase) => {
        expect(isFhevmHandleBytes32Hex(testCase.handleHex)).toBe(true);
      },
    );

    it('should return false for invalid fheTypeId', () => {
      const invalidHandle =
        '0x99f3713714e82df39fe8e2bffa56769e505ae35953000000000000aa36a70100';
      expect(isFhevmHandleBytes32Hex(invalidHandle)).toBe(false);
    });

    it('should return false for invalid version', () => {
      const invalidHandle =
        '0x99f3713714e82df39fe8e2bffa56769e505ae35953000000000000aa36a70301';
      expect(isFhevmHandleBytes32Hex(invalidHandle)).toBe(false);
    });
  });

  describe('isFhevmHandleBytes32', () => {
    it.each(HANDLE_TEST_CASES)(
      'should return true for valid handle bytes ($fheTypeName)',
      (testCase) => {
        const bytes = computedHandleToBytes(testCase.computedHandleBytes);
        expect(isFhevmHandleBytes32(bytes)).toBe(true);
      },
    );

    it('should return false for invalid fheTypeId', () => {
      const bytes = computedHandleToBytes(
        HANDLE_TEST_CASES[0].computedHandleBytes,
      );
      bytes[30] = 1; // Set fheTypeId to deprecated value
      expect(isFhevmHandleBytes32(bytes)).toBe(false);
    });
  });

  describe('isFhevmHandle', () => {
    it.each(HANDLE_TEST_CASES)(
      'should return true for FhevmHandle instance ($fheTypeName)',
      (testCase) => {
        const handle = toFhevmHandle(testCase.handleHex);
        expect(isFhevmHandle(handle)).toBe(true);
      },
    );

    it('should return false for non-FhevmHandle values', () => {
      expect(isFhevmHandle(HANDLE_TEST_CASES[0].handleHex)).toBe(false);
      expect(
        isFhevmHandle({ bytes32Hex: HANDLE_TEST_CASES[0].handleHex }),
      ).toBe(false);
      expect(isFhevmHandle(null)).toBe(false);
    });
  });

  describe('fhevmHandleLikeToFhevmHandle', () => {
    it.each(HANDLE_TEST_CASES)(
      'should convert hex string to FhevmHandle ($fheTypeName)',
      (testCase) => {
        const handle = fhevmHandleLikeToFhevmHandle(
          testCase.handleHex as FhevmHandleBytes32Hex,
        );
        expect(isFhevmHandle(handle)).toBe(true);
        expect(handle.bytes32Hex).toBe(testCase.handleHex);
      },
    );

    it('should return same instance for FhevmHandle input', () => {
      const testCase = HANDLE_TEST_CASES[0];
      const handle1 = toFhevmHandle(testCase.handleHex);
      const handle2 = fhevmHandleLikeToFhevmHandle(handle1);
      expect(handle2).toBe(handle1);
    });
  });

  describe('fhevmHandleEquals', () => {
    it('should return true for equal handles', () => {
      const testCase = HANDLE_TEST_CASES[0];
      const handle1 = toFhevmHandle(testCase.handleHex);
      const handle2 = toFhevmHandle(testCase.handleHex);
      expect(fhevmHandleEquals(handle1, handle2)).toBe(true);
    });

    it('should return false for different handles', () => {
      const handle1 = toFhevmHandle(HANDLE_TEST_CASES[0].handleHex);
      const handle2 = toFhevmHandle(HANDLE_TEST_CASES[1].handleHex);
      expect(fhevmHandleEquals(handle1, handle2)).toBe(false);
    });

    it.each(HANDLE_TEST_CASES)(
      'should return true for same handle created from different sources ($fheTypeName)',
      (testCase) => {
        const handleFromHex = toFhevmHandle(testCase.handleHex);
        const handleFromBytes = toFhevmHandle(
          computedHandleToBytes(testCase.computedHandleBytes),
        );
        expect(fhevmHandleEquals(handleFromHex, handleFromBytes)).toBe(true);
      },
    );
  });

  describe('asFhevmHandleBytes32Hex', () => {
    it.each(HANDLE_TEST_CASES)(
      'should return the input for valid hex ($fheTypeName)',
      (testCase) => {
        const result = asFhevmHandleBytes32Hex(testCase.handleHex);
        expect(result).toBe(testCase.handleHex);
      },
    );

    it('should throw for invalid hex', () => {
      expect(() => asFhevmHandleBytes32Hex('invalid')).toThrow(
        FhevmHandleError,
      );
    });
  });

  describe('asFhevmHandleBytes32', () => {
    it.each(HANDLE_TEST_CASES)(
      'should return the input for valid bytes ($fheTypeName)',
      (testCase) => {
        const bytes = computedHandleToBytes(testCase.computedHandleBytes);
        const result = asFhevmHandleBytes32(bytes);
        expect(result).toEqual(bytes);
      },
    );

    it('should throw for invalid bytes', () => {
      const invalidBytes = new Uint8Array(32);
      invalidBytes[30] = 1; // Invalid fheTypeId
      expect(() => asFhevmHandleBytes32(invalidBytes)).toThrow(
        FhevmHandleError,
      );
    });
  });

  describe('Integration with INPUT_PROOF_ASSET_2', () => {
    it('should correctly parse all handles from INPUT_PROOF_ASSET_2', () => {
      const handles = INPUT_PROOF_ASSET_2.handles.map((hex: string) =>
        toFhevmHandle(hex),
      );

      expect(handles).toHaveLength(4);

      // Verify chainId is consistent
      handles.forEach((handle: FhevmHandle) => {
        expect(handle.chainId).toBe(BigInt(INPUT_PROOF_ASSET_2.chainId));
        expect(handle.version).toBe(INPUT_PROOF_ASSET_2.ciphertextVersion);
      });

      // Verify fheTypeIds match the asset
      const fheTypeIds = handles.map((h: FhevmHandle) => h.fheTypeId);
      expect(fheTypeIds).toEqual(INPUT_PROOF_ASSET_2.fheTypeIds);

      // Verify encryption bitwidths match
      const encryptionBits = handles.map((h: FhevmHandle) => h.encryptionBits);
      expect(encryptionBits).toEqual(
        INPUT_PROOF_ASSET_2.fheTypeEncryptionBitwidths,
      );
    });

    it('should match handles from computed_handles bytes', () => {
      for (let i = 0; i < INPUT_PROOF_ASSET_2.handles.length; i++) {
        const handleFromHex = toFhevmHandle(INPUT_PROOF_ASSET_2.handles[i]);
        const handleFromBytes = toFhevmHandle(
          computedHandleToBytes(INPUT_PROOF_ASSET_2.computed_handles[i]),
        );

        expect(fhevmHandleEquals(handleFromHex, handleFromBytes)).toBe(true);
        expect(handleFromHex.index).toBe(i);
      }
    });

    it('should match handles from fetch_json response', () => {
      const fetchHandles = INPUT_PROOF_ASSET_2.fetch_json.response.handles;
      const assetHandles = INPUT_PROOF_ASSET_2.handles;

      expect(fetchHandles).toEqual(assetHandles);

      fetchHandles.forEach((hex: string, index: number) => {
        const handle = toFhevmHandle(hex);
        expect(handle.index).toBe(index);
      });
    });
  });

  describe('Integration with INPUT_PROOF_ASSET_3', () => {
    it('should correctly parse all handles from INPUT_PROOF_ASSET_3', () => {
      const handles = INPUT_PROOF_ASSET_3.handles.map((hex: string) =>
        toFhevmHandle(hex),
      );

      expect(handles).toHaveLength(4);

      // Verify chainId is consistent
      handles.forEach((handle: FhevmHandle) => {
        expect(handle.chainId).toBe(BigInt(INPUT_PROOF_ASSET_3.chainId));
        expect(handle.version).toBe(INPUT_PROOF_ASSET_3.ciphertextVersion);
      });

      // Verify fheTypeIds match the asset
      const fheTypeIds = handles.map((h: FhevmHandle) => h.fheTypeId);
      expect(fheTypeIds).toEqual(INPUT_PROOF_ASSET_3.fheTypeIds);

      // Verify encryption bitwidths match
      const encryptionBits = handles.map((h: FhevmHandle) => h.encryptionBits);
      expect(encryptionBits).toEqual(
        INPUT_PROOF_ASSET_3.fheTypeEncryptionBitwidths,
      );
    });

    it('should match handles from computed_handles bytes', () => {
      for (let i = 0; i < INPUT_PROOF_ASSET_3.handles.length; i++) {
        const handleFromHex = toFhevmHandle(INPUT_PROOF_ASSET_3.handles[i]);
        const handleFromBytes = toFhevmHandle(
          computedHandleToBytes(INPUT_PROOF_ASSET_3.computed_handles[i]),
        );

        expect(fhevmHandleEquals(handleFromHex, handleFromBytes)).toBe(true);
        expect(handleFromHex.index).toBe(i);
      }
    });

    it('should match handles from fetch_json response', () => {
      const fetchHandles = INPUT_PROOF_ASSET_3.fetch_json.response.handles;
      const assetHandles = INPUT_PROOF_ASSET_3.handles;

      expect(fetchHandles).toEqual(assetHandles);

      fetchHandles.forEach((hex: string, index: number) => {
        const handle = toFhevmHandle(hex);
        expect(handle.index).toBe(index);
      });
    });
  });

  describe('buildFhevmHandle round-trip validation', () => {
    it.each(HANDLE_TEST_CASES)(
      'should build identical handle from components for $fheTypeName (index: $index)',
      (testCase) => {
        // Build handle from individual components
        const builtHandle = buildFhevmHandle({
          index: testCase.index,
          chainId: testCase.chainId,
          hash21: testCase.hash21,
          fheTypeId: testCase.fheTypeId,
          version: testCase.version,
        });

        // Verify built handle matches original
        const originalHandle = toFhevmHandle(testCase.handleHex);
        expect(fhevmHandleEquals(builtHandle, originalHandle)).toBe(true);
      },
    );

    it.each(HANDLE_TEST_CASES)(
      'should produce correct bytes32Hex for $fheTypeName',
      (testCase) => {
        const builtHandle = buildFhevmHandle({
          index: testCase.index,
          chainId: testCase.chainId,
          hash21: testCase.hash21,
          fheTypeId: testCase.fheTypeId,
          version: testCase.version,
        });

        expect(builtHandle.bytes32Hex.toLowerCase()).toBe(
          testCase.handleHex.toLowerCase(),
        );
      },
    );

    it.each(HANDLE_TEST_CASES)(
      'should preserve all getters for $fheTypeName',
      (testCase) => {
        const builtHandle = buildFhevmHandle({
          index: testCase.index,
          chainId: testCase.chainId,
          hash21: testCase.hash21,
          fheTypeId: testCase.fheTypeId,
          version: testCase.version,
        });

        expect(builtHandle.index).toBe(testCase.index);
        expect(builtHandle.chainId).toBe(testCase.chainId);
        expect(builtHandle.hash21.toLowerCase()).toBe(
          testCase.hash21.toLowerCase(),
        );
        expect(builtHandle.fheTypeId).toBe(testCase.fheTypeId);
        expect(builtHandle.fheTypeName).toBe(testCase.fheTypeName);
        expect(builtHandle.version).toBe(testCase.version);
        expect(builtHandle.encryptionBits).toBe(testCase.encryptionBits);
        expect(builtHandle.solidityPrimitiveTypeName).toBe(
          testCase.solidityPrimitiveTypeName,
        );
        expect(builtHandle.isComputed).toBe(testCase.isComputed);
        expect(builtHandle.isExternal).toBe(testCase.isExternal);
      },
    );

    it.each(HANDLE_TEST_CASES)(
      'should match bytes32 from computed_handles for $fheTypeName',
      (testCase) => {
        const builtHandle = buildFhevmHandle({
          index: testCase.index,
          chainId: testCase.chainId,
          hash21: testCase.hash21,
          fheTypeId: testCase.fheTypeId,
          version: testCase.version,
        });

        const expectedBytes = computedHandleToBytes(
          testCase.computedHandleBytes,
        );
        expect(builtHandle.bytes32).toEqual(expectedBytes);
      },
    );

    it('should build computed handle when index is undefined', () => {
      const testCase = HANDLE_TEST_CASES[0];

      const computedHandle = buildFhevmHandle({
        index: undefined,
        chainId: testCase.chainId,
        hash21: testCase.hash21,
        fheTypeId: testCase.fheTypeId,
        version: testCase.version,
      });

      expect(computedHandle.index).toBeUndefined();
      expect(computedHandle.isComputed).toBe(true);
      expect(computedHandle.isExternal).toBe(false);
    });

    it('should build computed handle when index is omitted', () => {
      const testCase = HANDLE_TEST_CASES[0];

      const computedHandle = buildFhevmHandle({
        chainId: testCase.chainId,
        hash21: testCase.hash21,
        fheTypeId: testCase.fheTypeId,
        version: testCase.version,
      });

      expect(computedHandle.index).toBeUndefined();
      expect(computedHandle.isComputed).toBe(true);
      expect(computedHandle.isExternal).toBe(false);
    });

    it('should handle bigint chainId correctly', () => {
      const testCase = HANDLE_TEST_CASES[0];

      const builtHandle = buildFhevmHandle({
        index: testCase.index,
        chainId: testCase.chainId, // Already bigint
        hash21: testCase.hash21,
        fheTypeId: testCase.fheTypeId,
        version: testCase.version,
      });

      expect(builtHandle.chainId).toBe(testCase.chainId);
    });

    it('should handle number chainId correctly', () => {
      const testCase = HANDLE_TEST_CASES[0];
      const chainIdAsNumber = Number(testCase.chainId);

      const builtHandle = buildFhevmHandle({
        index: testCase.index,
        chainId: chainIdAsNumber,
        hash21: testCase.hash21,
        fheTypeId: testCase.fheTypeId,
        version: testCase.version,
      });

      expect(builtHandle.chainId).toBe(testCase.chainId);
    });
  });
});
