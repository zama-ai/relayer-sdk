import type { Bytes32Hex, ChecksummedAddress } from '../base/types/primitives';
import { ACL } from './ACL';
import { FhevmHandle } from './FhevmHandle';
import { ChecksummedAddressError } from '../errors/ChecksummedAddressError';
import { ContractError } from '../errors/ContractErrorBase';
import { FhevmHandleError } from '../errors/FhevmHandleError';
import {
  ACLPublicDecryptionError,
  ACLUserDecryptionError,
} from '../errors/ACLError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/ACL.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/ACL.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/ACL.test.ts --collectCoverageFrom='./src/sdk/ACL.ts'
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Mock ethers Contract
////////////////////////////////////////////////////////////////////////////////

const mockIsAllowedForDecryption = jest.fn();
const mockPersistAllowed = jest.fn();

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    Contract: jest.fn().mockImplementation(() => ({
      isAllowedForDecryption: mockIsAllowedForDecryption,
      persistAllowed: mockPersistAllowed,
    })),
  };
});

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

const VALID_ACL_ADDRESS =
  '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2' as ChecksummedAddress;
const VALID_USER_ADDRESS =
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72' as ChecksummedAddress;
const VALID_CONTRACT_ADDRESS =
  '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC' as ChecksummedAddress;

// Valid handle from test assets (euint64)
const VALID_HANDLE_HEX =
  '0xd5f1dd3e4ea4d4c0dea93dacd96019f4f0bd9cef00aa23232800000000050000' as Bytes32Hex;
const ANOTHER_HANDLE_HEX =
  '0xe6f2ee4f5fb5e5d1efb94ebde07120050f1cedf011bb34343900000000050000' as Bytes32Hex;

function createMockProvider(): any {
  return {};
}

////////////////////////////////////////////////////////////////////////////////

describe('ACL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //////////////////////////////////////////////////////////////////////////////
  // Constructor
  //////////////////////////////////////////////////////////////////////////////

  describe('constructor', () => {
    it('creates ACL instance with valid address and provider', () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      expect(acl).toBeInstanceOf(ACL);
    });

    it('throws ChecksummedAddressError for invalid address', () => {
      expect(
        () =>
          new ACL({
            aclContractAddress: '0xinvalid' as ChecksummedAddress,
            provider: createMockProvider(),
          }),
      ).toThrow(ChecksummedAddressError);
    });

    it('throws ChecksummedAddressError for non-checksummed address', () => {
      // lowercase address (not checksummed)
      expect(
        () =>
          new ACL({
            aclContractAddress:
              '0x339ece85b9e11a3a3aa557582784a15d7f82aaf2' as ChecksummedAddress,
            provider: createMockProvider(),
          }),
      ).toThrow(ChecksummedAddressError);
    });

    it('throws ContractError for undefined provider', () => {
      expect(
        () =>
          new ACL({
            aclContractAddress: VALID_ACL_ADDRESS,
            provider: undefined as any,
          }),
      ).toThrow(ContractError);
    });

    it('throws ContractError for null provider', () => {
      expect(
        () =>
          new ACL({
            aclContractAddress: VALID_ACL_ADDRESS,
            provider: null as any,
          }),
      ).toThrow(ContractError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // isAllowedForDecryption
  //////////////////////////////////////////////////////////////////////////////

  describe('isAllowedForDecryption', () => {
    it('returns true for single allowed handle', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.isAllowedForDecryption(VALID_HANDLE_HEX);

      expect(result).toBe(true);
      expect(mockIsAllowedForDecryption).toHaveBeenCalledWith(VALID_HANDLE_HEX);
    });

    it('returns false for single disallowed handle', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.isAllowedForDecryption(VALID_HANDLE_HEX);

      expect(result).toBe(false);
    });

    it('returns array of booleans for multiple handles', async () => {
      mockIsAllowedForDecryption
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.isAllowedForDecryption([
        VALID_HANDLE_HEX,
        ANOTHER_HANDLE_HEX,
      ]);

      expect(result).toEqual([true, false]);
      expect(mockIsAllowedForDecryption).toHaveBeenCalledTimes(2);
    });

    it('accepts FhevmHandle instance', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(true);

      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.isAllowedForDecryption(handle);

      expect(result).toBe(true);
      expect(mockIsAllowedForDecryption).toHaveBeenCalledWith(VALID_HANDLE_HEX);
    });

    it('accepts array with FhevmHandle instances', async () => {
      mockIsAllowedForDecryption
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const handle1 = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.isAllowedForDecryption([
        handle1,
        ANOTHER_HANDLE_HEX,
      ]);

      expect(result).toEqual([true, false]);
    });

    it('throws FhevmHandleError for invalid handle when checkArguments is true', async () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.isAllowedForDecryption('0xinvalid' as Bytes32Hex),
      ).rejects.toThrow(FhevmHandleError);
    });

    it('skips validation when checkArguments is false', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      // This would normally throw, but validation is skipped
      const result = await acl.isAllowedForDecryption(VALID_HANDLE_HEX, {
        checkArguments: false,
      });

      expect(result).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // checkAllowedForDecryption
  //////////////////////////////////////////////////////////////////////////////

  describe('checkAllowedForDecryption', () => {
    it('does not throw when handle is allowed', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkAllowedForDecryption(VALID_HANDLE_HEX),
      ).resolves.toBeUndefined();
    });

    it('throws ACLPublicDecryptionError when handle is not allowed', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkAllowedForDecryption(VALID_HANDLE_HEX),
      ).rejects.toThrow(ACLPublicDecryptionError);
    });

    it('throws ACLPublicDecryptionError with failed handles when some are not allowed', async () => {
      mockIsAllowedForDecryption
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkAllowedForDecryption([VALID_HANDLE_HEX, ANOTHER_HANDLE_HEX]),
      ).rejects.toThrow(ACLPublicDecryptionError);
    });

    it('does not throw when all handles are allowed', async () => {
      mockIsAllowedForDecryption
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkAllowedForDecryption([VALID_HANDLE_HEX, ANOTHER_HANDLE_HEX]),
      ).resolves.toBeUndefined();
    });

    it('accepts FhevmHandle instance', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(true);

      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkAllowedForDecryption(handle),
      ).resolves.toBeUndefined();
    });

    it('converts FhevmHandle to Bytes32Hex in error', async () => {
      mockIsAllowedForDecryption.mockResolvedValueOnce(false);

      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      try {
        await acl.checkAllowedForDecryption(handle);
        fail('Expected ACLPublicDecryptionError');
      } catch (e) {
        expect(e).toBeInstanceOf(ACLPublicDecryptionError);
        expect((e as ACLPublicDecryptionError).message).toContain(
          VALID_HANDLE_HEX,
        );
      }
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // persistAllowed
  //////////////////////////////////////////////////////////////////////////////

  describe('persistAllowed', () => {
    it('returns true for allowed address/handle pair', async () => {
      mockPersistAllowed.mockResolvedValueOnce(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.persistAllowed({
        handle: VALID_HANDLE_HEX,
        address: VALID_USER_ADDRESS,
      });

      expect(result).toBe(true);
      expect(mockPersistAllowed).toHaveBeenCalledWith(
        VALID_HANDLE_HEX,
        VALID_USER_ADDRESS,
      );
    });

    it('returns false for disallowed address/handle pair', async () => {
      mockPersistAllowed.mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.persistAllowed({
        handle: VALID_HANDLE_HEX,
        address: VALID_USER_ADDRESS,
      });

      expect(result).toBe(false);
    });

    it('returns array of booleans for multiple pairs', async () => {
      mockPersistAllowed
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.persistAllowed([
        { handle: VALID_HANDLE_HEX, address: VALID_USER_ADDRESS },
        { handle: ANOTHER_HANDLE_HEX, address: VALID_CONTRACT_ADDRESS },
      ]);

      expect(result).toEqual([true, false]);
      expect(mockPersistAllowed).toHaveBeenCalledTimes(2);
    });

    it('accepts FhevmHandle instance', async () => {
      mockPersistAllowed.mockResolvedValueOnce(true);

      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.persistAllowed({
        handle,
        address: VALID_USER_ADDRESS,
      });

      expect(result).toBe(true);
      expect(mockPersistAllowed).toHaveBeenCalledWith(
        VALID_HANDLE_HEX,
        VALID_USER_ADDRESS,
      );
    });

    it('throws FhevmHandleError for invalid handle when checkArguments is true', async () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.persistAllowed({
          handle: '0xinvalid' as Bytes32Hex,
          address: VALID_USER_ADDRESS,
        }),
      ).rejects.toThrow(FhevmHandleError);
    });

    it('throws ChecksummedAddressError for invalid address when checkArguments is true', async () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.persistAllowed({
          handle: VALID_HANDLE_HEX,
          address: '0xinvalid' as ChecksummedAddress,
        }),
      ).rejects.toThrow(ChecksummedAddressError);
    });

    it('skips validation when checkArguments is false', async () => {
      mockPersistAllowed.mockResolvedValueOnce(false);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      const result = await acl.persistAllowed(
        { handle: VALID_HANDLE_HEX, address: VALID_USER_ADDRESS },
        { checkArguments: false },
      );

      expect(result).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // checkUserAllowedForDecryption
  //////////////////////////////////////////////////////////////////////////////

  describe('checkUserAllowedForDecryption', () => {
    it('does not throw when user and contract are both allowed', async () => {
      mockPersistAllowed.mockResolvedValue(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: {
            handle: VALID_HANDLE_HEX,
            contractAddress: VALID_CONTRACT_ADDRESS,
          },
        }),
      ).resolves.toBeUndefined();
    });

    it('throws ACLUserDecryptionError when user is not allowed', async () => {
      // User not allowed, contract allowed
      mockPersistAllowed
        .mockResolvedValueOnce(false) // user
        .mockResolvedValueOnce(true); // contract

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: {
            handle: VALID_HANDLE_HEX,
            contractAddress: VALID_CONTRACT_ADDRESS,
          },
        }),
      ).rejects.toThrow(ACLUserDecryptionError);
    });

    it('throws ACLUserDecryptionError when contract is not allowed', async () => {
      // User allowed, contract not allowed
      mockPersistAllowed
        .mockResolvedValueOnce(true) // user
        .mockResolvedValueOnce(false); // contract

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: {
            handle: VALID_HANDLE_HEX,
            contractAddress: VALID_CONTRACT_ADDRESS,
          },
        }),
      ).rejects.toThrow(ACLUserDecryptionError);
    });

    it('throws ACLUserDecryptionError when userAddress equals contractAddress', async () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: {
            handle: VALID_HANDLE_HEX,
            contractAddress: VALID_USER_ADDRESS, // Same as userAddress
          },
        }),
      ).rejects.toThrow(ACLUserDecryptionError);
    });

    it('handles multiple handle/contract pairs', async () => {
      mockPersistAllowed.mockResolvedValue(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: [
            {
              handle: VALID_HANDLE_HEX,
              contractAddress: VALID_CONTRACT_ADDRESS,
            },
            {
              handle: ANOTHER_HANDLE_HEX,
              contractAddress: VALID_CONTRACT_ADDRESS,
            },
          ],
        }),
      ).resolves.toBeUndefined();
    });

    it('deduplicates RPC calls for same address/handle pairs', async () => {
      mockPersistAllowed.mockResolvedValue(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await acl.checkUserAllowedForDecryption({
        userAddress: VALID_USER_ADDRESS,
        handleContractPairs: [
          { handle: VALID_HANDLE_HEX, contractAddress: VALID_CONTRACT_ADDRESS },
          { handle: VALID_HANDLE_HEX, contractAddress: VALID_CONTRACT_ADDRESS }, // Duplicate
        ],
      });

      // Should only make 2 calls (user + contract), not 4
      expect(mockPersistAllowed).toHaveBeenCalledTimes(2);
    });

    it('accepts FhevmHandle instances in handleContractPairs', async () => {
      mockPersistAllowed.mockResolvedValue(true);

      const handle = FhevmHandle.fromBytes32Hex(VALID_HANDLE_HEX);
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: {
            handle,
            contractAddress: VALID_CONTRACT_ADDRESS,
          },
        }),
      ).resolves.toBeUndefined();
    });

    it('throws FhevmHandleError for invalid handle when checkArguments is true', async () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: {
            handle: '0xinvalid' as Bytes32Hex,
            contractAddress: VALID_CONTRACT_ADDRESS,
          },
        }),
      ).rejects.toThrow(FhevmHandleError);
    });

    it('throws ChecksummedAddressError for invalid userAddress when checkArguments is true', async () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: '0xinvalid' as ChecksummedAddress,
          handleContractPairs: {
            handle: VALID_HANDLE_HEX,
            contractAddress: VALID_CONTRACT_ADDRESS,
          },
        }),
      ).rejects.toThrow(ChecksummedAddressError);
    });

    it('throws ChecksummedAddressError for invalid contractAddress when checkArguments is true', async () => {
      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption({
          userAddress: VALID_USER_ADDRESS,
          handleContractPairs: {
            handle: VALID_HANDLE_HEX,
            contractAddress: '0xinvalid' as ChecksummedAddress,
          },
        }),
      ).rejects.toThrow(ChecksummedAddressError);
    });

    it('skips validation when checkArguments is false', async () => {
      mockPersistAllowed.mockResolvedValue(true);

      const acl = new ACL({
        aclContractAddress: VALID_ACL_ADDRESS,
        provider: createMockProvider(),
      });

      await expect(
        acl.checkUserAllowedForDecryption(
          {
            userAddress: VALID_USER_ADDRESS,
            handleContractPairs: {
              handle: VALID_HANDLE_HEX,
              contractAddress: VALID_CONTRACT_ADDRESS,
            },
          },
          { checkArguments: false },
        ),
      ).resolves.toBeUndefined();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Error classes
  //////////////////////////////////////////////////////////////////////////////

  describe('ACLPublicDecryptionError', () => {
    it('can be constructed with contract address and handles', () => {
      const error = new ACLPublicDecryptionError({
        contractAddress: VALID_ACL_ADDRESS,
        handles: [VALID_HANDLE_HEX],
      });

      expect(error).toBeInstanceOf(ACLPublicDecryptionError);
      expect(error.message).toContain(VALID_HANDLE_HEX);
    });

    it('includes multiple handles in message', () => {
      const error = new ACLPublicDecryptionError({
        contractAddress: VALID_ACL_ADDRESS,
        handles: [VALID_HANDLE_HEX, ANOTHER_HANDLE_HEX],
      });

      expect(error.message).toContain(VALID_HANDLE_HEX);
      expect(error.message).toContain(ANOTHER_HANDLE_HEX);
    });
  });

  describe('ACLUserDecryptionError', () => {
    it('can be constructed with contract address and message', () => {
      const error = new ACLUserDecryptionError({
        contractAddress: VALID_ACL_ADDRESS,
        message: 'User not authorized',
      });

      expect(error).toBeInstanceOf(ACLUserDecryptionError);
      expect(error.message).toContain('User not authorized');
    });
  });
});
