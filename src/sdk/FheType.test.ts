import {
  isFheTypeId,
  isFheTypeName,
  isEncryptionBits,
  assertIsEncryptionBits,
  assertIsEncryptionBitsArray,
  fheTypeIdFromEncryptionBits,
  fheTypeIdFromName,
  fheTypeNameFromId,
  solidityPrimitiveTypeNameFromFheTypeId,
  encryptionBitsFromFheTypeId,
  encryptionBitsFromFheTypeName,
} from './FheType';
import { FheTypeError } from '../errors/FheTypeError';
import { InvalidTypeError } from '../errors/InvalidTypeError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/FheType.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/FheType.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/FheType.test.ts --collectCoverageFrom=./src/sdk/FheType.ts
//
// Maximum Code Coverage: 98% because of `_assertMinimumEncryptionBitWidth` private function which is never accessible
// This function is here for defensive purpose in case of potential future change
//
////////////////////////////////////////////////////////////////////////////////

describe('FheType', () => {
  //////////////////////////////////////////////////////////////////////////////
  // isFheTypeId
  //////////////////////////////////////////////////////////////////////////////

  describe('isFheTypeId', () => {
    it('returns true for valid FheTypeIds', () => {
      expect(isFheTypeId(0)).toBe(true); // ebool
      expect(isFheTypeId(2)).toBe(true); // euint8
      expect(isFheTypeId(3)).toBe(true); // euint16
      expect(isFheTypeId(4)).toBe(true); // euint32
      expect(isFheTypeId(5)).toBe(true); // euint64
      expect(isFheTypeId(6)).toBe(true); // euint128
      expect(isFheTypeId(7)).toBe(true); // eaddress
      expect(isFheTypeId(8)).toBe(true); // euint256
    });

    it('returns false for deprecated euint4 (id 1)', () => {
      expect(isFheTypeId(1)).toBe(false);
    });

    it('returns false for invalid ids', () => {
      expect(isFheTypeId(-1)).toBe(false);
      expect(isFheTypeId(9)).toBe(false);
      expect(isFheTypeId(100)).toBe(false);
    });

    it('returns false for non-number values', () => {
      expect(isFheTypeId('0')).toBe(false);
      expect(isFheTypeId(null)).toBe(false);
      expect(isFheTypeId(undefined)).toBe(false);
      expect(isFheTypeId({})).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // isFheTypeName
  //////////////////////////////////////////////////////////////////////////////

  describe('isFheTypeName', () => {
    it('returns true for valid FheTypeNames', () => {
      expect(isFheTypeName('ebool')).toBe(true);
      expect(isFheTypeName('euint8')).toBe(true);
      expect(isFheTypeName('euint16')).toBe(true);
      expect(isFheTypeName('euint32')).toBe(true);
      expect(isFheTypeName('euint64')).toBe(true);
      expect(isFheTypeName('euint128')).toBe(true);
      expect(isFheTypeName('eaddress')).toBe(true);
      expect(isFheTypeName('euint256')).toBe(true);
    });

    it('returns false for deprecated euint4', () => {
      expect(isFheTypeName('euint4')).toBe(false);
    });

    it('returns false for invalid names', () => {
      expect(isFheTypeName('euint512')).toBe(false);
      expect(isFheTypeName('uint8')).toBe(false);
      expect(isFheTypeName('bool')).toBe(false);
      expect(isFheTypeName('')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isFheTypeName(0)).toBe(false);
      expect(isFheTypeName(null)).toBe(false);
      expect(isFheTypeName(undefined)).toBe(false);
      expect(isFheTypeName({})).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // isEncryptionBits
  //////////////////////////////////////////////////////////////////////////////

  describe('isEncryptionBits', () => {
    it('returns true for valid encryption bit widths', () => {
      expect(isEncryptionBits(2)).toBe(true); // ebool
      expect(isEncryptionBits(8)).toBe(true); // euint8
      expect(isEncryptionBits(16)).toBe(true); // euint16
      expect(isEncryptionBits(32)).toBe(true); // euint32
      expect(isEncryptionBits(64)).toBe(true); // euint64
      expect(isEncryptionBits(128)).toBe(true); // euint128
      expect(isEncryptionBits(160)).toBe(true); // eaddress
      expect(isEncryptionBits(256)).toBe(true); // euint256
    });

    it('returns false for deprecated euint4 bitwidth', () => {
      expect(isEncryptionBits(4)).toBe(false);
    });

    it('returns false for invalid bit widths', () => {
      expect(isEncryptionBits(0)).toBe(false);
      expect(isEncryptionBits(1)).toBe(false);
      expect(isEncryptionBits(3)).toBe(false);
      expect(isEncryptionBits(512)).toBe(false);
    });

    it('returns false for non-number values', () => {
      expect(isEncryptionBits('8')).toBe(false);
      expect(isEncryptionBits(null)).toBe(false);
      expect(isEncryptionBits(undefined)).toBe(false);
      expect(isEncryptionBits({})).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // assertIsEncryptionBits
  //////////////////////////////////////////////////////////////////////////////

  describe('assertIsEncryptionBits', () => {
    it('does not throw for valid encryption bits', () => {
      expect(() => assertIsEncryptionBits(2)).not.toThrow();
      expect(() => assertIsEncryptionBits(8)).not.toThrow();
      expect(() => assertIsEncryptionBits(16)).not.toThrow();
      expect(() => assertIsEncryptionBits(32)).not.toThrow();
      expect(() => assertIsEncryptionBits(64)).not.toThrow();
      expect(() => assertIsEncryptionBits(128)).not.toThrow();
      expect(() => assertIsEncryptionBits(160)).not.toThrow();
      expect(() => assertIsEncryptionBits(256)).not.toThrow();
    });

    it('throws InvalidTypeError for invalid encryption bits', () => {
      expect(() => assertIsEncryptionBits(4)).toThrow(InvalidTypeError);
      expect(() => assertIsEncryptionBits(0)).toThrow(InvalidTypeError);
      expect(() => assertIsEncryptionBits(512)).toThrow(InvalidTypeError);
    });

    it('throws InvalidTypeError for non-number values', () => {
      expect(() => assertIsEncryptionBits('8')).toThrow(InvalidTypeError);
      expect(() => assertIsEncryptionBits(null)).toThrow(InvalidTypeError);
      expect(() => assertIsEncryptionBits(undefined)).toThrow(InvalidTypeError);
    });

    it('includes varName in error when provided', () => {
      expect(() => assertIsEncryptionBits(4, 'myVar')).toThrow(/myVar/);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // assertIsEncryptionBitsArray
  //////////////////////////////////////////////////////////////////////////////

  describe('assertIsEncryptionBitsArray', () => {
    it('does not throw for valid encryption bits array', () => {
      expect(() => assertIsEncryptionBitsArray([2, 8, 16])).not.toThrow();
      expect(() =>
        assertIsEncryptionBitsArray([32, 64, 128, 160, 256]),
      ).not.toThrow();
      expect(() => assertIsEncryptionBitsArray([])).not.toThrow();
    });

    it('throws InvalidTypeError for non-array values', () => {
      expect(() => assertIsEncryptionBitsArray('not-an-array')).toThrow(
        InvalidTypeError,
      );
      expect(() => assertIsEncryptionBitsArray(123)).toThrow(InvalidTypeError);
      expect(() => assertIsEncryptionBitsArray(null)).toThrow(InvalidTypeError);
      expect(() => assertIsEncryptionBitsArray(undefined)).toThrow(
        InvalidTypeError,
      );
    });

    it('throws InvalidTypeError for array with invalid encryption bits', () => {
      expect(() => assertIsEncryptionBitsArray([8, 4, 16])).toThrow(
        InvalidTypeError,
      );
      expect(() => assertIsEncryptionBitsArray([8, 'invalid', 16])).toThrow(
        InvalidTypeError,
      );
    });

    it('includes varName with index in error when provided', () => {
      expect(() => assertIsEncryptionBitsArray([8, 4], 'myArray')).toThrow(
        /myArray\[1\]/,
      );
    });

    it('throws without varName when not provided', () => {
      expect(() => assertIsEncryptionBitsArray([4])).toThrow(InvalidTypeError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fheTypeIdFromEncryptionBits
  //////////////////////////////////////////////////////////////////////////////

  describe('fheTypeIdFromEncryptionBits', () => {
    it('returns correct FheTypeId for valid bit widths', () => {
      expect(fheTypeIdFromEncryptionBits(2)).toBe(0); // ebool
      expect(fheTypeIdFromEncryptionBits(8)).toBe(2); // euint8
      expect(fheTypeIdFromEncryptionBits(16)).toBe(3); // euint16
      expect(fheTypeIdFromEncryptionBits(32)).toBe(4); // euint32
      expect(fheTypeIdFromEncryptionBits(64)).toBe(5); // euint64
      expect(fheTypeIdFromEncryptionBits(128)).toBe(6); // euint128
      expect(fheTypeIdFromEncryptionBits(160)).toBe(7); // eaddress
      expect(fheTypeIdFromEncryptionBits(256)).toBe(8); // euint256
    });

    it('throws FheTypeError for invalid bit widths', () => {
      expect(() => fheTypeIdFromEncryptionBits(4 as any)).toThrow(FheTypeError);
      expect(() => fheTypeIdFromEncryptionBits(4 as any)).toThrow(
        'Invalid encryption bits 4',
      );
      expect(() => fheTypeIdFromEncryptionBits(512 as any)).toThrow(
        FheTypeError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fheTypeIdFromName
  //////////////////////////////////////////////////////////////////////////////

  describe('fheTypeIdFromName', () => {
    it('returns correct FheTypeId for valid names', () => {
      expect(fheTypeIdFromName('ebool')).toBe(0);
      expect(fheTypeIdFromName('euint8')).toBe(2);
      expect(fheTypeIdFromName('euint16')).toBe(3);
      expect(fheTypeIdFromName('euint32')).toBe(4);
      expect(fheTypeIdFromName('euint64')).toBe(5);
      expect(fheTypeIdFromName('euint128')).toBe(6);
      expect(fheTypeIdFromName('eaddress')).toBe(7);
      expect(fheTypeIdFromName('euint256')).toBe(8);
    });

    it('throws FheTypeError for invalid names', () => {
      expect(() => fheTypeIdFromName('euint4' as any)).toThrow(FheTypeError);
      expect(() => fheTypeIdFromName('euint4' as any)).toThrow(
        "Invalid FheType name 'euint4'",
      );
      expect(() => fheTypeIdFromName('invalid' as any)).toThrow(FheTypeError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fheTypeNameFromId
  //////////////////////////////////////////////////////////////////////////////

  describe('fheTypeNameFromId', () => {
    it('returns correct FheTypeName for valid ids', () => {
      expect(fheTypeNameFromId(0)).toBe('ebool');
      expect(fheTypeNameFromId(2)).toBe('euint8');
      expect(fheTypeNameFromId(3)).toBe('euint16');
      expect(fheTypeNameFromId(4)).toBe('euint32');
      expect(fheTypeNameFromId(5)).toBe('euint64');
      expect(fheTypeNameFromId(6)).toBe('euint128');
      expect(fheTypeNameFromId(7)).toBe('eaddress');
      expect(fheTypeNameFromId(8)).toBe('euint256');
    });

    it('throws FheTypeError for invalid ids', () => {
      expect(() => fheTypeNameFromId(1 as any)).toThrow(FheTypeError);
      expect(() => fheTypeNameFromId(1 as any)).toThrow(
        "Invalid FheType id '1'",
      );
      expect(() => fheTypeNameFromId(9 as any)).toThrow(FheTypeError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // solidityPrimitiveTypeNameFromFheTypeId
  //////////////////////////////////////////////////////////////////////////////

  describe('solidityPrimitiveTypeNameFromFheTypeId', () => {
    it('returns bool for ebool (id 0)', () => {
      expect(solidityPrimitiveTypeNameFromFheTypeId(0)).toBe('bool');
    });

    it('returns address for eaddress (id 7)', () => {
      expect(solidityPrimitiveTypeNameFromFheTypeId(7)).toBe('address');
    });

    it('returns uint256 for all euint types', () => {
      expect(solidityPrimitiveTypeNameFromFheTypeId(2)).toBe('uint256'); // euint8
      expect(solidityPrimitiveTypeNameFromFheTypeId(3)).toBe('uint256'); // euint16
      expect(solidityPrimitiveTypeNameFromFheTypeId(4)).toBe('uint256'); // euint32
      expect(solidityPrimitiveTypeNameFromFheTypeId(5)).toBe('uint256'); // euint64
      expect(solidityPrimitiveTypeNameFromFheTypeId(6)).toBe('uint256'); // euint128
      expect(solidityPrimitiveTypeNameFromFheTypeId(8)).toBe('uint256'); // euint256
    });

    it('throws FheTypeError for invalid ids', () => {
      expect(() => solidityPrimitiveTypeNameFromFheTypeId(1 as any)).toThrow(
        FheTypeError,
      );
      expect(() => solidityPrimitiveTypeNameFromFheTypeId(1 as any)).toThrow(
        "Invalid FheType id '1'",
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // encryptionBitsFromFheTypeId
  //////////////////////////////////////////////////////////////////////////////

  describe('encryptionBitsFromFheTypeId', () => {
    it('returns correct bit widths for valid ids', () => {
      expect(encryptionBitsFromFheTypeId(0)).toBe(2); // ebool
      expect(encryptionBitsFromFheTypeId(2)).toBe(8); // euint8
      expect(encryptionBitsFromFheTypeId(3)).toBe(16); // euint16
      expect(encryptionBitsFromFheTypeId(4)).toBe(32); // euint32
      expect(encryptionBitsFromFheTypeId(5)).toBe(64); // euint64
      expect(encryptionBitsFromFheTypeId(6)).toBe(128); // euint128
      expect(encryptionBitsFromFheTypeId(7)).toBe(160); // eaddress
      expect(encryptionBitsFromFheTypeId(8)).toBe(256); // euint256
    });

    it('throws FheTypeError for invalid ids', () => {
      expect(() => encryptionBitsFromFheTypeId(1 as any)).toThrow(FheTypeError);
      expect(() => encryptionBitsFromFheTypeId(1 as any)).toThrow(
        "Invalid FheType id '1'",
      );
      expect(() => encryptionBitsFromFheTypeId(9 as any)).toThrow(FheTypeError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // encryptionBitsFromFheTypeName
  //////////////////////////////////////////////////////////////////////////////

  describe('encryptionBitsFromFheTypeName', () => {
    it('returns correct bit widths for valid names', () => {
      expect(encryptionBitsFromFheTypeName('ebool')).toBe(2);
      expect(encryptionBitsFromFheTypeName('euint8')).toBe(8);
      expect(encryptionBitsFromFheTypeName('euint16')).toBe(16);
      expect(encryptionBitsFromFheTypeName('euint32')).toBe(32);
      expect(encryptionBitsFromFheTypeName('euint64')).toBe(64);
      expect(encryptionBitsFromFheTypeName('euint128')).toBe(128);
      expect(encryptionBitsFromFheTypeName('eaddress')).toBe(160);
      expect(encryptionBitsFromFheTypeName('euint256')).toBe(256);
    });

    it('throws FheTypeError for invalid names', () => {
      expect(() => encryptionBitsFromFheTypeName('euint4' as any)).toThrow(
        FheTypeError,
      );
      expect(() => encryptionBitsFromFheTypeName('euint4' as any)).toThrow(
        "Invalid FheType name 'euint4'",
      );
      expect(() => encryptionBitsFromFheTypeName('invalid' as any)).toThrow(
        FheTypeError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Roundtrip tests
  //////////////////////////////////////////////////////////////////////////////

  describe('roundtrip conversions', () => {
    const validTypes = [
      { name: 'ebool', id: 0, bits: 2, solidity: 'bool' },
      { name: 'euint8', id: 2, bits: 8, solidity: 'uint256' },
      { name: 'euint16', id: 3, bits: 16, solidity: 'uint256' },
      { name: 'euint32', id: 4, bits: 32, solidity: 'uint256' },
      { name: 'euint64', id: 5, bits: 64, solidity: 'uint256' },
      { name: 'euint128', id: 6, bits: 128, solidity: 'uint256' },
      { name: 'eaddress', id: 7, bits: 160, solidity: 'address' },
      { name: 'euint256', id: 8, bits: 256, solidity: 'uint256' },
    ] as const;

    it.each(validTypes)(
      'name -> id -> name roundtrip for $name',
      ({ name, id }) => {
        expect(fheTypeIdFromName(name)).toBe(id);
        expect(fheTypeNameFromId(id)).toBe(name);
      },
    );

    it.each(validTypes)(
      'bits -> id -> bits roundtrip for $name',
      ({ bits, id }) => {
        expect(fheTypeIdFromEncryptionBits(bits)).toBe(id);
        expect(encryptionBitsFromFheTypeId(id)).toBe(bits);
      },
    );

    it.each(validTypes)(
      'name -> bits roundtrip for $name',
      ({ name, bits }) => {
        expect(encryptionBitsFromFheTypeName(name)).toBe(bits);
      },
    );
  });
});
