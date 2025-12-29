import fetchMock from 'fetch-mock';
import { TEST_CONFIG } from '../test/config';
import { KMSVerifier } from './KMSVerifier';
import { JsonRpcProvider } from 'ethers';
import { ChecksummedAddress } from '../types/primitives';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/KMSVerifier.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/KMSVerifier.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/KMSVerifier.test.ts --collectCoverageFrom=./src/sdk/KMSVerifier.ts
//
//
// Testnet:
// =======
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/sdk/KMSVerifier.test.ts
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
      const { TEST_CONFIG, TEST_KMS, TEST_KMS_VERIFIER } =
        jest.requireActual('../test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return new actual.Contract(...args);
      }
      return {
        eip712Domain: () => Promise.resolve(TEST_KMS_VERIFIER.eip712Domain),
        getKmsSigners: () => Promise.resolve(TEST_KMS.addresses),
        getThreshold: () => Promise.resolve(BigInt(TEST_KMS.addresses.length)),
      };
    }),
  };
});

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('KMSVerifier mock', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
  });

  //////////////////////////////////////////////////////////////////////////////
  // loadFromChain error cases
  //////////////////////////////////////////////////////////////////////////////

  describe('loadFromChain error cases', () => {
    const validEip712Domain = [
      '0x0f', // fields
      'Decryption', // name
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
      getKmsSigners: () => Promise.resolve(overrides.signers ?? validSigners),
    });

    it('throws on invalid threshold (too large)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ threshold: BigInt(256) }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier kms signers threshold.');
    });

    it('throws on invalid threshold (negative)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ threshold: BigInt(-1) }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier kms signers threshold.');
    });

    it('throws on invalid kmsSigners (not array)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ signers: 'not-an-array' }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier kms signers addresses.');
    });

    it('throws on invalid kmsSigners (invalid address)', async () => {
      const { Contract } = jest.requireMock('ethers');
      Contract.mockImplementationOnce(() =>
        createMockContract({ signers: ['not-an-address'] }),
      );

      const provider = new JsonRpcProvider('http://localhost:8545');

      await expect(
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier kms signers addresses.');
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
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier EIP-712 domain.');
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
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier EIP-712 domain.');
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
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier EIP-712 domain.');
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
        KMSVerifier.loadFromChain({
          kmsContractAddress:
            '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
          provider,
        }),
      ).rejects.toThrow('Invalid KMSVerifier EIP-712 domain.');
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('KMSVerifier', () => {
  //////////////////////////////////////////////////////////////////////////////
  // loadFromChain
  //////////////////////////////////////////////////////////////////////////////

  describe('loadFromChain', () => {
    let kmsVerifier: KMSVerifier;

    beforeAll(async () => {
      const provider = new JsonRpcProvider(
        TEST_CONFIG.v2.fhevmInstanceConfig.network,
      );

      kmsVerifier = await KMSVerifier.loadFromChain({
        kmsContractAddress: TEST_CONFIG.fhevmInstanceConfig
          .kmsContractAddress as ChecksummedAddress,
        provider,
      });
    });

    it('returns KMSVerifier instance', () => {
      expect(kmsVerifier).toBeInstanceOf(KMSVerifier);
    });

    it('address getter returns the contract address', () => {
      expect(kmsVerifier.address).toBe(
        TEST_CONFIG.fhevmInstanceConfig.kmsContractAddress,
      );
    });

    it('eip712Domain.chainId equals gatewayChainId', () => {
      expect(Number(kmsVerifier.eip712Domain.chainId)).toBe(
        Number(TEST_CONFIG.fhevmInstanceConfig.gatewayChainId),
      );
    });

    it('eip712Domain.name is Decryption', () => {
      expect(kmsVerifier.eip712Domain.name).toBe('Decryption');
    });

    it('eip712Domain.version is 1', () => {
      expect(kmsVerifier.eip712Domain.version).toBe('1');
    });

    it('eip712Domain.verifyingContract is valid address', () => {
      expect(kmsVerifier.eip712Domain.verifyingContract).toBe(
        TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
      );
    });

    it('gatewayChainId getter returns eip712Domain.chainId', () => {
      expect(kmsVerifier.gatewayChainId).toBe(kmsVerifier.eip712Domain.chainId);
    });

    it('kmsSigners is non-empty array', () => {
      expect(Array.isArray(kmsVerifier.kmsSigners)).toBe(true);
      expect(kmsVerifier.kmsSigners.length).toBeGreaterThan(0);
    });

    it('threshold is a positive number', () => {
      expect(typeof kmsVerifier.threshold).toBe('number');
      expect(kmsVerifier.threshold).toBeGreaterThan(0);
    });

    it('threshold is less than or equal to kmsSigners length', () => {
      expect(kmsVerifier.threshold).toBeLessThanOrEqual(
        kmsVerifier.kmsSigners.length,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    let kmsVerifier: KMSVerifier;

    beforeAll(async () => {
      const provider = new JsonRpcProvider(
        TEST_CONFIG.v2.fhevmInstanceConfig.network,
      );

      kmsVerifier = await KMSVerifier.loadFromChain({
        kmsContractAddress: TEST_CONFIG.fhevmInstanceConfig
          .kmsContractAddress as ChecksummedAddress,
        provider,
      });
    });

    it('eip712Domain is frozen', () => {
      expect(Object.isFrozen(kmsVerifier.eip712Domain)).toBe(true);
    });

    it('eip712Domain cannot be modified', () => {
      const eip712Domain = kmsVerifier.eip712Domain;

      expect(() => {
        (eip712Domain as any).name = 'Modified';
      }).toThrow(TypeError);

      expect(() => {
        (eip712Domain as any).newProperty = 'test';
      }).toThrow(TypeError);

      expect(kmsVerifier.eip712Domain.name).toBe('Decryption');
    });

    it('kmsSigners is frozen', () => {
      expect(Object.isFrozen(kmsVerifier.kmsSigners)).toBe(true);
    });

    it('kmsSigners array cannot be modified', () => {
      const signers = kmsVerifier.kmsSigners;

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
      const threshold = kmsVerifier.threshold;
      expect(typeof threshold).toBe('number');

      // Primitives are immutable by nature
      // Attempting to modify via getter returns a copy
      const originalThreshold = kmsVerifier.threshold;
      expect(kmsVerifier.threshold).toBe(originalThreshold);
    });

    it('getter returns same frozen object reference', () => {
      const eip712Domain1 = kmsVerifier.eip712Domain;
      const eip712Domain2 = kmsVerifier.eip712Domain;
      expect(eip712Domain1).toBe(eip712Domain2);

      const signers1 = kmsVerifier.kmsSigners;
      const signers2 = kmsVerifier.kmsSigners;
      expect(signers1).toBe(signers2);
    });
  });
});
