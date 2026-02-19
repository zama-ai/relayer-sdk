import fetchMock from 'fetch-mock';
import { TEST_CONFIG } from '../../test/config';
import { JsonRpcProvider } from 'ethers';
import type { ChecksummedAddress } from '@base/types/primitives';
import { fetchInputVerifierContractData } from './InputVerifierContractData';
import { createFhevmLibs } from '@fhevm-ethers/index';
import {
  FhevmChainClient,
  FhevmLibs,
  NativeClient,
} from '@fhevm-base-types/public-api';
import { InputVerifierContractData } from '../types/public-api';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/fhevm-base/InputVerifier.test.ts
// npx jest --colors --passWithNoTests ./src/fhevm-base/InputVerifier.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/fhevm-base/InputVerifier.test.ts --collectCoverageFrom=./src/fhevm-base/InputVerifier.ts
//
//
// Testnet:
// =======
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/fhevm-base/InputVerifier.test.ts
//
// Devnet:
// =======
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/fhevm-base/InputVerifier.test.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('../test/config');
  return setupEthersJestMock();
});

function createClient(
  libs: FhevmLibs,
  nativeClient: NativeClient,
  inputVerifierContractAddress: string,
): FhevmChainClient & {
  config: {
    hostChainConfig: { inputVerifierContractAddress: ChecksummedAddress };
  };
} {
  return {
    libs,
    nativeClient,
    config: {
      hostChainConfig: {
        inputVerifierContractAddress:
          inputVerifierContractAddress as ChecksummedAddress,
      },
    },
  };
}

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('InputVerifier mock', () => {
  let fhevmLibs: FhevmLibs;

  beforeAll(async () => {
    fhevmLibs = await createFhevmLibs();
  });

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

    function createMockFhevmLibs(overrides: {
      eip712Domain?: any[];
      threshold?: any;
      signers?: any;
    }): FhevmLibs {
      return {
        ...fhevmLibs,
        inputVerifierContractLib: {
          eip712Domain: () =>
            Promise.resolve(overrides.eip712Domain ?? validEip712Domain),
          getThreshold: () => Promise.resolve(overrides.threshold ?? BigInt(1)),
          getCoprocessorSigners: () =>
            Promise.resolve(overrides.signers ?? validSigners),
        },
      };
    }

    it('throws on invalid threshold (too large)', async () => {
      const mockLibs = createMockFhevmLibs({ threshold: BigInt(256) });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier Coprocessor signers threshold.',
      );
    });

    it('throws on invalid threshold (negative)', async () => {
      const mockLibs = createMockFhevmLibs({ threshold: BigInt(-1) });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier Coprocessor signers threshold.',
      );
    });

    it('throws on invalid coprocessorSigners (not array)', async () => {
      const mockLibs = createMockFhevmLibs({ signers: 'not-an-array' });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier Coprocessor signers addresses.',
      );
    });

    it('throws on invalid coprocessorSigners (invalid address)', async () => {
      const mockLibs = createMockFhevmLibs({ signers: ['not-an-address'] });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier Coprocessor signers addresses.',
      );
    });

    it('throws on invalid eip712Domain name', async () => {
      const invalidDomain = [...validEip712Domain];
      invalidDomain[1] = 'WrongName';
      const mockLibs = createMockFhevmLibs({ eip712Domain: invalidDomain });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier EIP-712 domain.',
      );
    });

    it('throws on invalid eip712Domain version', async () => {
      const invalidDomain = [...validEip712Domain];
      invalidDomain[2] = '2';
      const mockLibs = createMockFhevmLibs({ eip712Domain: invalidDomain });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier EIP-712 domain.',
      );
    });

    it('throws on invalid eip712Domain chainId (not uint256)', async () => {
      const invalidDomain = [...validEip712Domain];
      invalidDomain[3] = 'not-a-number';
      const mockLibs = createMockFhevmLibs({ eip712Domain: invalidDomain });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier EIP-712 domain chainId.',
      );
    });

    it('throws on invalid eip712Domain verifyingContract (not address)', async () => {
      const invalidDomain = [...validEip712Domain];
      invalidDomain[4] = 'not-an-address';
      const mockLibs = createMockFhevmLibs({ eip712Domain: invalidDomain });

      const client = createClient(
        mockLibs,
        new JsonRpcProvider('http://localhost:8545'),
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      );

      await expect(fetchInputVerifierContractData(client)).rejects.toThrow(
        'Invalid InputVerifier EIP-712 domain.',
      );
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('InputVerfier', () => {
  //////////////////////////////////////////////////////////////////////////////
  // loadFromChain
  //////////////////////////////////////////////////////////////////////////////

  describe('loadFromChain', () => {
    let inputVerifier: InputVerifierContractData;
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
      const client = createClient(
        fhevmLibs,
        new JsonRpcProvider(
          TEST_CONFIG.v2.fhevmInstanceConfig.network as string,
        ),
        TEST_CONFIG.fhevmInstanceConfig.inputVerifierContractAddress,
      );

      inputVerifier = await fetchInputVerifierContractData(client);
    });

    it('address getter returns the contract address', () => {
      expect(inputVerifier.address).toBe(
        TEST_CONFIG.fhevmInstanceConfig.inputVerifierContractAddress,
      );
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
      expect(typeof inputVerifier.coprocessorSignerThreshold).toBe('number');
      expect(inputVerifier.coprocessorSignerThreshold).toBeGreaterThan(0);
    });

    it('threshold is less than or equal to coprocessorSigners length', () => {
      expect(inputVerifier.coprocessorSignerThreshold).toBeLessThanOrEqual(
        inputVerifier.coprocessorSigners.length,
      );
    });

    it('inputVerifier.verifyingContractAddressInputVerification is valid address', () => {
      expect(inputVerifier.verifyingContractAddressInputVerification).toBe(
        TEST_CONFIG.fhevmInstanceConfig
          .verifyingContractAddressInputVerification,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    let inputVerifier: InputVerifierContractData;
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
      const client = createClient(
        fhevmLibs,
        new JsonRpcProvider(
          TEST_CONFIG.v2.fhevmInstanceConfig.network as string,
        ),
        TEST_CONFIG.fhevmInstanceConfig.inputVerifierContractAddress,
      );

      inputVerifier = await fetchInputVerifierContractData(client);
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
      const threshold = inputVerifier.coprocessorSignerThreshold;
      expect(typeof threshold).toBe('number');

      // Primitives are immutable by nature
      // Attempting to modify via getter returns a copy
      const originalThreshold = inputVerifier.coprocessorSignerThreshold;
      expect(inputVerifier.coprocessorSignerThreshold).toBe(originalThreshold);
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
