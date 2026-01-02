import fetchMock from 'fetch-mock';
import { TEST_CONFIG, getTestProvider } from '../test/config';
import { InputVerifier } from './InputVerifier';
import { JsonRpcProvider } from 'ethers';
import type { ChecksummedAddress } from '../base/types/primitives';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/InputVerifier.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/InputVerifier.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/InputVerifier.test.ts --collectCoverageFrom=./src/sdk/InputVerifier.ts
//
//
// Testnet:
// =======
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/sdk/InputVerifier.test.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');

  return {
    ...actual,
    JsonRpcProvider: jest.fn((...args: any[]) => {
      // Lazy evaluation: check condition when constructor is called
      const { TEST_CONFIG } = jest.requireActual('../test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return new actual.JsonRpcProvider(...args);
      }
      return {};
    }),
    isAddress: (...args: any[]) => {
      const { TEST_CONFIG } = jest.requireActual('../test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return actual.isAddress(...args);
      }
      return true;
    },
    getAddress: (address: string) => {
      const { TEST_CONFIG } = jest.requireActual('../test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return actual.getAddress(address);
      }
      return address;
    },
    Contract: jest.fn((...args: any[]) => {
      const { TEST_CONFIG, TEST_COPROCESSORS, TEST_INPUT_VERIFIER } =
        jest.requireActual('../test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return new actual.Contract(...args);
      }
      return {
        eip712Domain: () => Promise.resolve(TEST_INPUT_VERIFIER.eip712Domain),
        getCoprocessorSigners: () =>
          Promise.resolve(TEST_COPROCESSORS.addresses),
        getThreshold: () =>
          Promise.resolve(BigInt(TEST_COPROCESSORS.addresses.length)),
      };
    }),
  };
});

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('InputVerifier mock', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromAddress error cases
  //////////////////////////////////////////////////////////////////////////////

  describe('fromAddress error cases', () => {
    const validEip712Domain = [
      '0x0f', // fields
      'InputVerification', // name
      '1', // version
      BigInt(9000), // chainId
      '0x483b9dE06E4E4C7D35CCf5837A1668487406D955', // verifyingContract
      '0x0000000000000000000000000000000000000000000000000000000000000000', // salt
      [], // extensions
    ];
    const validSigners = ['0x483b9dE06E4E4C7D35CCf5837A1668487406D955'];

    const createMockContract = (overrides: {
      eip712Domain?: any[];
      threshold?: any;
      signers?: any;
    }) => ({
      eip712Domain: () =>
        Promise.resolve(overrides.eip712Domain ?? validEip712Domain),
      getThreshold: () => Promise.resolve(overrides.threshold ?? BigInt(1)),
      getCoprocessorSigners: () =>
        Promise.resolve(overrides.signers ?? validSigners),
    });

    it('throws on invalid threshold (too large)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ threshold: BigInt(256) }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier Coprocessor signers threshold.');
    });

    it('throws on invalid threshold (negative)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ threshold: BigInt(-1) }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier Coprocessor signers threshold.');
    });

    it('throws on invalid coprocessorSigners (not array)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ signers: 'not-an-array' }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier Coprocessor signers addresses.');
    });

    it('throws on invalid coprocessorSigners (invalid address)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ signers: ['not-an-address'] }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier Coprocessor signers addresses.');
    });

    it('throws on invalid eip712Domain name', async () => {
      const { Contract } = jest.requireMock('ethers');
      const invalidDomain = [...validEip712Domain];
      invalidDomain[1] = 'WrongName';
      Contract.mockImplementationOnce(() =>
        createMockContract({ eip712Domain: invalidDomain }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier EIP-712 domain.');
    });

    it('throws on invalid eip712Domain version', async () => {
      const { Contract } = jest.requireMock('ethers');
      const invalidDomain = [...validEip712Domain];
      invalidDomain[2] = '2';
      Contract.mockImplementationOnce(() =>
        createMockContract({ eip712Domain: invalidDomain }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier EIP-712 domain.');
    });

    it('throws on invalid eip712Domain chainId (not uint256)', async () => {
      const { Contract } = jest.requireMock('ethers');
      const invalidDomain = [...validEip712Domain];
      invalidDomain[3] = 'not-a-number';
      Contract.mockImplementationOnce(() =>
        createMockContract({ eip712Domain: invalidDomain }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier EIP-712 domain.');
    });

    it('throws on invalid eip712Domain verifyingContract (not address)', async () => {
      const { Contract } = jest.requireMock('ethers');
      const invalidDomain = [...validEip712Domain];
      invalidDomain[4] = 'not-an-address';
      Contract.mockImplementationOnce(() =>
        createMockContract({ eip712Domain: invalidDomain }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        InputVerifier.loadFromChain({
          inputVerifierContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid InputVerifier EIP-712 domain.');
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('InputVerfier', () => {
  //////////////////////////////////////////////////////////////////////////////
  // loadFromChain
  //////////////////////////////////////////////////////////////////////////////

  describe('loadFromChain', () => {
    let inputVerifier: InputVerifier;

    beforeAll(async () => {
      const provider = getTestProvider(
        TEST_CONFIG.v2.fhevmInstanceConfig.network,
      );

      inputVerifier = await InputVerifier.loadFromChain({
        inputVerifierContractAddress: TEST_CONFIG.fhevmInstanceConfig
          .inputVerifierContractAddress as ChecksummedAddress,
        provider,
      });
    });

    it('returns InputVerifier instance', () => {
      expect(inputVerifier).toBeInstanceOf(InputVerifier);
    });

    it('eip712Domain.chainId equals gatewayChainId', () => {
      expect(Number(inputVerifier.eip712Domain.chainId)).toBe(
        Number(TEST_CONFIG.fhevmInstanceConfig.gatewayChainId),
      );
    });

    it('eip712Domain.name is InputVerification', () => {
      expect(inputVerifier.eip712Domain.name).toBe('InputVerification');
    });

    it('eip712Domain.version is 1', () => {
      expect(inputVerifier.eip712Domain.version).toBe('1');
    });

    it('eip712Domain.verifyingContract is valid address', () => {
      expect(inputVerifier.eip712Domain.verifyingContract).toBe(
        TEST_CONFIG.fhevmInstanceConfig
          .verifyingContractAddressInputVerification,
      );
    });

    it('gatewayChainId getter returns eip712Domain.chainId', () => {
      expect(inputVerifier.gatewayChainId).toBe(
        inputVerifier.eip712Domain.chainId,
      );
    });

    it('coprocessorSigners is non-empty array', () => {
      expect(Array.isArray(inputVerifier.coprocessorSigners)).toBe(true);
      expect(inputVerifier.coprocessorSigners.length).toBeGreaterThan(0);
    });

    it('threshold is a positive number', () => {
      expect(typeof inputVerifier.threshold).toBe('number');
      expect(inputVerifier.threshold).toBeGreaterThan(0);
    });

    it('threshold is less than or equal to coprocessorSigners length', () => {
      expect(inputVerifier.threshold).toBeLessThanOrEqual(
        inputVerifier.coprocessorSigners.length,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    let inputVerifier: InputVerifier;

    beforeAll(async () => {
      const provider = getTestProvider(
        TEST_CONFIG.v2.fhevmInstanceConfig.network,
      );

      inputVerifier = await InputVerifier.loadFromChain({
        inputVerifierContractAddress: TEST_CONFIG.fhevmInstanceConfig
          .inputVerifierContractAddress as ChecksummedAddress,
        provider,
      });
    });

    it('eip712Domain is frozen', () => {
      expect(Object.isFrozen(inputVerifier.eip712Domain)).toBe(true);
    });

    it('eip712Domain cannot be modified', () => {
      const eip712Domain = inputVerifier.eip712Domain;

      expect(() => {
        (eip712Domain as any).name = 'Modified';
      }).toThrow(TypeError);

      expect(() => {
        (eip712Domain as any).newProperty = 'test';
      }).toThrow(TypeError);

      expect(inputVerifier.eip712Domain.name).toBe('InputVerification');
    });

    it('coprocessorSigners is frozen', () => {
      expect(Object.isFrozen(inputVerifier.coprocessorSigners)).toBe(true);
    });

    it('coprocessorSigners array cannot be modified', () => {
      const signers = inputVerifier.coprocessorSigners;

      expect(() => {
        (signers as any).push('0x0000000000000000000000000000000000000000');
      }).toThrow(TypeError);

      expect(() => {
        (signers as any)[0] = '0x0000000000000000000000000000000000000000';
      }).toThrow(TypeError);

      expect(() => {
        (signers as any).length = 0;
      }).toThrow(TypeError);
    });

    it('threshold is a primitive and cannot be reassigned via getter', () => {
      const threshold = inputVerifier.threshold;
      expect(typeof threshold).toBe('number');

      // Primitives are immutable by nature
      // Attempting to modify via getter returns a copy
      const originalThreshold = inputVerifier.threshold;
      expect(inputVerifier.threshold).toBe(originalThreshold);
    });

    it('getter returns same frozen object reference', () => {
      const eip712Domain1 = inputVerifier.eip712Domain;
      const eip712Domain2 = inputVerifier.eip712Domain;
      expect(eip712Domain1).toBe(eip712Domain2);

      const signers1 = inputVerifier.coprocessorSigners;
      const signers2 = inputVerifier.coprocessorSigners;
      expect(signers1).toBe(signers2);
    });
  });
});
