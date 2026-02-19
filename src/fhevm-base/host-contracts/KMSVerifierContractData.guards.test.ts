import type { ChecksummedAddress } from '@base/types/primitives';
import { assertIsKmsEIP712Domain } from './KMSVerifierContractData';
import { InvalidPropertyError } from '@base/errors/InvalidPropertyError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/fhevm-base/KMSVerifier.guards.test.ts
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Test Constants
////////////////////////////////////////////////////////////////////////////////

const VALID_CHECKSUMMED_ADDRESS =
  '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D' as ChecksummedAddress;

function createValidDomain() {
  return {
    name: 'Decryption' as const,
    version: '1' as const,
    chainId: 11155111n,
    verifyingContract: VALID_CHECKSUMMED_ADDRESS,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('assertIsKmsEIP712Domain', () => {
  //////////////////////////////////////////////////////////////////////////////
  // Valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('valid inputs', () => {
    it('accepts valid domain object', () => {
      const domain = createValidDomain();

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).not.toThrow();
    });

    it('accepts chainId as bigint', () => {
      const domain = {
        ...createValidDomain(),
        chainId: 11155111n,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).not.toThrow();
    });

    it('accepts chainId as 0', () => {
      const domain = {
        ...createValidDomain(),
        chainId: 0n,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).not.toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Invalid name property
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid name property', () => {
    it('throws for missing name property', () => {
      const domain = {
        version: '1' as const,
        chainId: 11155111n,
        verifyingContract: VALID_CHECKSUMMED_ADDRESS,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for wrong name value', () => {
      const domain = {
        ...createValidDomain(),
        name: 'WrongName',
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for non-string name', () => {
      const domain = {
        ...createValidDomain(),
        name: 123,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for null name', () => {
      const domain = {
        ...createValidDomain(),
        name: null,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Invalid version property
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid version property', () => {
    it('throws for missing version property', () => {
      const domain = {
        name: 'Decryption' as const,
        chainId: 11155111n,
        verifyingContract: VALID_CHECKSUMMED_ADDRESS,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for wrong version value', () => {
      const domain = {
        ...createValidDomain(),
        version: '2',
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for non-string version', () => {
      const domain = {
        ...createValidDomain(),
        version: 1,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Invalid chainId property
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid chainId property', () => {
    it('throws for missing chainId property', () => {
      const domain = {
        name: 'Decryption' as const,
        version: '1' as const,
        verifyingContract: VALID_CHECKSUMMED_ADDRESS,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for negative chainId', () => {
      const domain = {
        ...createValidDomain(),
        chainId: -1n,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for number chainId', () => {
      const domain = {
        ...createValidDomain(),
        chainId: 1,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for string chainId', () => {
      const domain = {
        ...createValidDomain(),
        chainId: '11155111',
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for null chainId', () => {
      const domain = {
        ...createValidDomain(),
        chainId: null,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Invalid verifyingContract property
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid verifyingContract property', () => {
    it('throws for missing verifyingContract property', () => {
      const domain = {
        name: 'Decryption' as const,
        version: '1' as const,
        chainId: 11155111,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for invalid address format', () => {
      const domain = {
        ...createValidDomain(),
        verifyingContract: '0xinvalid',
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for lowercase address (not checksummed)', () => {
      const domain = {
        ...createValidDomain(),
        verifyingContract: '0xf0ffdc93b7e186bc2f8cb3daa75d86d1930a433d',
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });

    it('throws for non-string verifyingContract', () => {
      const domain = {
        ...createValidDomain(),
        verifyingContract: 12345,
      };

      expect(() => assertIsKmsEIP712Domain(domain, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Edge cases
  //////////////////////////////////////////////////////////////////////////////

  describe('edge cases', () => {
    const invalidInputs: [string, unknown][] = [
      ['null', null],
      ['undefined', undefined],
      ['empty object', {}],
      ['array', []],
      ['string', 'invalid'],
      ['number', 123],
    ];

    it.each(invalidInputs)('throws for %s input', (_name, input) => {
      expect(() => assertIsKmsEIP712Domain(input, 'domain', {})).toThrow(
        InvalidPropertyError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Error message includes object name
  //////////////////////////////////////////////////////////////////////////////

  describe('error messages', () => {
    it('error includes the provided object name', () => {
      const domain = {
        ...createValidDomain(),
        name: 'WrongName',
      };

      expect(() =>
        assertIsKmsEIP712Domain(domain, 'myCustomDomain', {}),
      ).toThrow(/myCustomDomain/);
    });
  });
});
