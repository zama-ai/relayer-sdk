import type { FhevmInstanceConfig } from '../types/relayer';
import fetchMock from 'fetch-mock';
import {
  createMockEip1193Provider,
  TEST_CONFIG,
  TEST_COPROCESSORS,
} from '../test/config';
import { FhevmHostChainConfig, FhevmHostChain } from './fhevmHostChain';
import { FhevmConfigError } from '../errors/FhevmConfigError';
import { MainnetConfig, SepoliaConfig } from '../configs';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/fhevmHostChain.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/sdk/fhevmHostChain.test.ts --collectCoverageFrom='./src/sdk/fhevmHostChain.ts'
//
// Testnet:
// ========
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/sdk/fhevmHostChain.test.ts
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/sdk/fhevmHostChain.test.ts --testNamePattern=xxx
//
// Devnet:
// ========
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/sdk/fhevmHostChain.test.ts
//
// Mainnet:
// ========
// npx jest --config jest.mainnet.config.cjs --colors --passWithNoTests ./src/sdk/fhevmHostChain.test.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe.skip : describe;

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('../test/config');
  return setupEthersJestMock();
});

////////////////////////////////////////////////////////////////////////////////

describe('FhevmHostChainConfig validation (mock)', () => {
  beforeEach(() => {
    fetchMock.removeRoutes();
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - invalid ACL contract address
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid ACL contract address', () => {
    it('throws for missing ACL contract address', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        aclContractAddress: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for empty ACL contract address', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        aclContractAddress: '',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid ACL contract address', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        aclContractAddress: '0xinvalid',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    // Note: Non-checksummed address validation can't be tested in fetch-mock mode
    // because isAddress is mocked to return true. This is tested in real network mode.
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - invalid KMS contract address
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid KMS contract address', () => {
    it('throws for missing KMS contract address', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        kmsContractAddress: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid KMS contract address', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        kmsContractAddress: 'not-an-address',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - invalid InputVerifier contract address
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid InputVerifier contract address', () => {
    it('throws for missing InputVerifier contract address', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        inputVerifierContractAddress: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid InputVerifier contract address', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        inputVerifierContractAddress: '12345',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - invalid verifying contract addresses
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid verifying contract addresses', () => {
    it('throws for missing verifyingContractAddressDecryption', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        verifyingContractAddressDecryption: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for missing verifyingContractAddressInputVerification', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        verifyingContractAddressInputVerification: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid verifyingContractAddressDecryption', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        verifyingContractAddressDecryption: 'invalid',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid verifyingContractAddressInputVerification', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        verifyingContractAddressInputVerification: null,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - invalid chainId
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid chainId', () => {
    it('throws for missing chainId', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        chainId: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for negative chainId', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        chainId: -1,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for chainId exceeding uint64 max', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        chainId: BigInt('18446744073709551616'), // 2^64
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - invalid gatewayChainId
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid gatewayChainId', () => {
    it('throws for missing gatewayChainId', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        gatewayChainId: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid gatewayChainId', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        gatewayChainId: 'not-a-number',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - invalid network
  //////////////////////////////////////////////////////////////////////////////

  describe('invalid network', () => {
    it('throws for missing network', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        network: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid URL string', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        network: 'not-a-valid-url',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for invalid network type (not string or EIP-1193)', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        network: 12345,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for object without request method', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        network: { someProperty: 'value' },
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });

    it('throws for object with non-function request property', () => {
      const config = {
        ...TEST_CONFIG.fhevmInstanceConfig,
        network: { request: 'not-a-function' },
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(FhevmConfigError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - publicKey and publicParams validation
  //////////////////////////////////////////////////////////////////////////////

  describe('publicKey and publicParams validation', () => {
    it('accepts config with both publicKey and publicParams', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        publicKey: { data: new Uint8Array([1, 2, 3]), id: 'key-id' },
        publicParams: {
          2048: {
            publicParams: new Uint8Array([4, 5, 6]),
            publicParamsId: 'params-id',
          },
        },
      };

      const result = FhevmHostChainConfig.fromUserConfig(config);

      expect(result).toBeInstanceOf(FhevmHostChainConfig);
    });

    it('accepts config with neither publicKey nor publicParams', () => {
      const config = TEST_CONFIG.v2.fhevmInstanceConfig;

      const result = FhevmHostChainConfig.fromUserConfig(config);

      expect(result).toBeInstanceOf(FhevmHostChainConfig);
    });

    it('throws for publicKey without publicParams', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        publicKey: { data: new Uint8Array([1, 2, 3]), id: 'key-id' },
      };

      expect(() => FhevmHostChainConfig.fromUserConfig(config)).toThrow(
        FhevmConfigError,
      );
    });

    it('throws for publicParams without publicKey', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        publicParams: {
          2048: {
            publicParams: new Uint8Array([4, 5, 6]),
            publicParamsId: 'params-id',
          },
        },
      };

      expect(() => FhevmHostChainConfig.fromUserConfig(config)).toThrow(
        FhevmConfigError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - error messages
  //////////////////////////////////////////////////////////////////////////////

  describe('error messages', () => {
    it('error message includes "ACL contract" for invalid ACL address', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        aclContractAddress: 'invalid',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(/ACL contract/);
    });

    it('error message includes "KMS contract" for invalid KMS address', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        kmsContractAddress: 'invalid',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(/KMS contract/);
    });

    it('error message includes "InputVerifier contract" for invalid InputVerifier address', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        inputVerifierContractAddress: 'invalid',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(/InputVerifier contract/);
    });

    it('error message includes "host chain ID" for invalid chainId', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        chainId: -1,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(/host chain ID/);
    });

    it('error message includes "gateway chain ID" for invalid gatewayChainId', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        gatewayChainId: -1,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(/gateway chain ID/);
    });

    it('MainnetConfig: error message for missing network', () => {
      const config = {
        ...MainnetConfig,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(
        'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
      );
    });

    it('SepliaConfig: error message for missing network', () => {
      const config = {
        ...SepoliaConfig,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(
        'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
      );
    });

    it('MainnetConfig with network', () => {
      const config = {
        ...MainnetConfig,
        network: 'https://my-rpc.com',
      };

      const cfg = FhevmHostChainConfig.fromUserConfig(
        config as unknown as FhevmInstanceConfig,
      );
      expect(cfg.network).toBe('https://my-rpc.com');
    });

    it('SepoliaConfig with network', () => {
      const config = {
        ...SepoliaConfig,
        network: 'https://my-rpc.com',
      };

      const cfg = FhevmHostChainConfig.fromUserConfig(
        config as unknown as FhevmInstanceConfig,
      );
      expect(cfg.network).toBe('https://my-rpc.com');
    });

    it('error message for missing network', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        network: undefined,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(
        'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
      );
    });

    it('error message for invalid network URL', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        network: 'not-a-valid-url',
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow('Invalid network URL: not-a-valid-url');
    });

    it('error message for invalid network type', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        network: 12345,
      };

      expect(() =>
        FhevmHostChainConfig.fromUserConfig(
          config as unknown as FhevmInstanceConfig,
        ),
      ).toThrow(
        'Invalid FhevmInstanceConfig.network property, expecting an RPC URL string or an Eip1193Provider',
      );
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('FhevmHostChainConfig', () => {
  //////////////////////////////////////////////////////////////////////////////
  // fromUserConfig - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('fromUserConfig - valid inputs', () => {
    it('creates config with valid RPC URL network', () => {
      const config = TEST_CONFIG.v2.fhevmInstanceConfig;

      const result = FhevmHostChainConfig.fromUserConfig(config);

      expect(result).toBeInstanceOf(FhevmHostChainConfig);
      expect(result.aclContractAddress).toBe(config.aclContractAddress);
      expect(result.inputVerifierContractAddress).toBe(
        config.inputVerifierContractAddress,
      );
      expect(result.kmsContractAddress).toBe(config.kmsContractAddress);
      expect(result.chainId).toBe(BigInt(config.chainId));
      expect(result.gatewayChainId).toBe(BigInt(config.gatewayChainId));
      expect(result.verifyingContractAddressDecryption).toBe(
        config.verifyingContractAddressDecryption,
      );
      expect(result.verifyingContractAddressInputVerification).toBe(
        config.verifyingContractAddressInputVerification,
      );
      expect(result.network).toBe(config.network);
    });

    it('creates config with EIP-1193 provider network', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        network: createMockEip1193Provider(),
      };

      const result = FhevmHostChainConfig.fromUserConfig(config);

      expect(result).toBeInstanceOf(FhevmHostChainConfig);
    });

    it('accepts chainId as bigint', () => {
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId),
      };

      const result = FhevmHostChainConfig.fromUserConfig(
        config as unknown as FhevmInstanceConfig,
      );

      expect(result.chainId).toBe(
        BigInt(TEST_CONFIG.v2.fhevmInstanceConfig.chainId),
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let hostChainConfig: FhevmHostChainConfig;

    beforeAll(() => {
      hostChainConfig = FhevmHostChainConfig.fromUserConfig(
        TEST_CONFIG.v2.fhevmInstanceConfig,
      );
    });

    it('chainId returns bigint', () => {
      expect(hostChainConfig.chainId).toBe(
        BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId),
      );
    });

    it('aclContractAddress returns correct address', () => {
      expect(hostChainConfig.aclContractAddress).toBe(
        TEST_CONFIG.fhevmInstanceConfig.aclContractAddress,
      );
    });

    it('kmsContractAddress returns correct address', () => {
      expect(hostChainConfig.kmsContractAddress).toBe(
        TEST_CONFIG.fhevmInstanceConfig.kmsContractAddress,
      );
    });

    it('inputVerifierContractAddress returns correct address', () => {
      expect(hostChainConfig.inputVerifierContractAddress).toBe(
        TEST_CONFIG.fhevmInstanceConfig.inputVerifierContractAddress,
      );
    });

    it('verifyingContractAddressDecryption returns correct address', () => {
      expect(hostChainConfig.verifyingContractAddressDecryption).toBe(
        TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
      );
    });

    it('verifyingContractAddressInputVerification returns correct address', () => {
      expect(hostChainConfig.verifyingContractAddressInputVerification).toBe(
        TEST_CONFIG.fhevmInstanceConfig
          .verifyingContractAddressInputVerification,
      );
    });

    it('gatewayChainId returns bigint', () => {
      expect(hostChainConfig.gatewayChainId).toBe(
        BigInt(TEST_CONFIG.fhevmInstanceConfig.gatewayChainId!),
      );
    });

    it('network returns RPC URL for string network', () => {
      expect(hostChainConfig.network).toBe(
        TEST_CONFIG.v2.fhevmInstanceConfig.network,
      );
    });

    it('network returns provider for EIP-1193 network', () => {
      const provider = createMockEip1193Provider();
      const config = {
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        network: provider,
      };

      const result = FhevmHostChainConfig.fromUserConfig(config);

      expect(result.network).toBe(provider);
    });

    it('ethersProvider returns provider instance', () => {
      expect(hostChainConfig.ethersProvider).toBeDefined();
    });
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('FhevmHostChain', () => {
  //////////////////////////////////////////////////////////////////////////////
  // loadFromChain
  //////////////////////////////////////////////////////////////////////////////

  describe('loadFromChain', () => {
    let hostChainConfig: FhevmHostChainConfig;
    let hostChain: FhevmHostChain;

    beforeAll(async () => {
      hostChainConfig = FhevmHostChainConfig.fromUserConfig(
        TEST_CONFIG.v2.fhevmInstanceConfig,
      );
      hostChain = await hostChainConfig.loadFromChain();
    });

    it('returns FhevmHostChain instance', () => {
      expect(hostChain).toBeInstanceOf(FhevmHostChain);
      expect(hostChain.gatewayChainId).toBe(
        BigInt(TEST_CONFIG.v2.fhevmInstanceConfig.gatewayChainId),
      );
    });

    it('coprocessorSigners is non-empty array', () => {
      expect(Array.isArray(hostChain.coprocessorSigners)).toBe(true);
      expect(hostChain.coprocessorSigners.length).toBeGreaterThan(0);
    });

    it('coprocessorSignerThreshold is a positive number', () => {
      expect(typeof hostChain.coprocessorSignerThreshold).toBe('number');
      expect(hostChain.coprocessorSignerThreshold).toBeGreaterThan(0);
    });

    it('coprocessorSignerThreshold is less than or equal to coprocessorSigners length', () => {
      expect(hostChain.coprocessorSignerThreshold).toBeLessThanOrEqual(
        hostChain.coprocessorSigners.length,
      );
    });

    it('kmsSigners is non-empty array', () => {
      expect(Array.isArray(hostChain.kmsSigners)).toBe(true);
      expect(hostChain.kmsSigners.length).toBeGreaterThan(0);
    });

    it('kmsSignerThreshold is a positive number', () => {
      expect(typeof hostChain.kmsSignerThreshold).toBe('number');
      expect(hostChain.kmsSignerThreshold).toBeGreaterThan(0);
    });

    it('kmsSignerThreshold is less than or equal to kmsSigners length', () => {
      expect(hostChain.kmsSignerThreshold).toBeLessThanOrEqual(
        hostChain.kmsSigners.length,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // static loadFromChain
  //////////////////////////////////////////////////////////////////////////////

  describe('static loadFromChain', () => {
    it('returns FhevmHostChain instance via static method', async () => {
      const hostChainConfig = FhevmHostChainConfig.fromUserConfig(
        TEST_CONFIG.v2.fhevmInstanceConfig,
      );
      const hostChain = await FhevmHostChain.loadFromChain(hostChainConfig);

      expect(hostChain).toBeInstanceOf(FhevmHostChain);
    });

    it('throws for mismatched gatewayChainId', async () => {
      const hostChainConfig = FhevmHostChainConfig.fromUserConfig({
        ...TEST_CONFIG.v2.fhevmInstanceConfig,
        gatewayChainId: 13,
      });

      await expect(
        FhevmHostChain.loadFromChain(hostChainConfig),
      ).rejects.toThrow(FhevmConfigError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Coprocessor Signers
  //////////////////////////////////////////////////////////////////////////////

  describeIfMock('coprocessorSigners', () => {
    let hostChain: FhevmHostChain;

    beforeAll(async () => {
      const hostChainConfig = FhevmHostChainConfig.fromUserConfig(
        TEST_CONFIG.v2.fhevmInstanceConfig,
      );
      hostChain = await hostChainConfig.loadFromChain();
    });

    it('Actual coprocessorSigners should differ from mock coprocessorSigners', () => {
      expect(hostChain.coprocessorSigners).not.toStrictEqual(
        TEST_COPROCESSORS.addresses,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    let hostChain: FhevmHostChain;

    beforeAll(async () => {
      const hostChainConfig = FhevmHostChainConfig.fromUserConfig(
        TEST_CONFIG.v2.fhevmInstanceConfig,
      );
      hostChain = await hostChainConfig.loadFromChain();
    });

    it('coprocessorSigners is frozen', () => {
      expect(Object.isFrozen(hostChain.coprocessorSigners)).toBe(true);
    });

    it('coprocessorSigners array cannot be modified', () => {
      const signers = hostChain.coprocessorSigners;

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

    it('kmsSigners is frozen', () => {
      expect(Object.isFrozen(hostChain.kmsSigners)).toBe(true);
    });

    it('kmsSigners array cannot be modified', () => {
      const signers = hostChain.kmsSigners;

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

    it('getter returns same frozen object reference for coprocessorSigners', () => {
      const signers1 = hostChain.coprocessorSigners;
      const signers2 = hostChain.coprocessorSigners;
      expect(signers1).toBe(signers2);
    });

    it('getter returns same frozen object reference for kmsSigners', () => {
      const signers1 = hostChain.kmsSigners;
      const signers2 = hostChain.kmsSigners;
      expect(signers1).toBe(signers2);
    });
  });
});
