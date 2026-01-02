import type { FhevmInstanceConfig } from './index';
import fetchMock from 'fetch-mock';
import { createInstance } from './index';
import {
  publicKeyId as assetPublicKeyId,
  publicParamsId as assetPublicParamsId,
  tfheCompactPublicKeyBytes,
  tfheCompactPkeCrsBytes,
} from './test';
import { setupV1RoutesKeyUrl } from './test/v1/mockRoutes';
import { TEST_CONFIG } from './test/config';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/index.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/index.test.ts --collectCoverageFrom=./src/index.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/index.test.ts --collectCoverageFrom=./src/index.ts
//
////////////////////////////////////////////////////////////////////////////////

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');

  return {
    ...actual,
    JsonRpcProvider: jest.fn((...args: any[]) => {
      // Lazy evaluation: check condition when constructor is called
      const { TEST_CONFIG } = jest.requireActual('./test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return new actual.JsonRpcProvider(...args);
      }
      return {};
    }),
    isAddress: (...args: any[]) => {
      const { TEST_CONFIG } = jest.requireActual('./test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return actual.isAddress(...args);
      }
      return true;
    },
    getAddress: (address: string) => {
      const { TEST_CONFIG } = jest.requireActual('./test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return actual.getAddress(address);
      }
      return address;
    },
    Contract: jest.fn((...args: any[]) => {
      const { TEST_CONFIG, TEST_COPROCESSORS, TEST_KMS } =
        jest.requireActual('./test/config');
      if (TEST_CONFIG.type !== 'fetch-mock') {
        return new actual.Contract(...args);
      }
      return {
        getKmsSigners: () => Promise.resolve(TEST_KMS.addresses),
        getCoprocessorSigners: () =>
          Promise.resolve(TEST_COPROCESSORS.addresses),
        getThreshold: () => Promise.resolve(BigInt(TEST_KMS.addresses.length)), // === TEST_COPROCESSORS.addresses.length
      };
    }),
  };
});

////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('index', () => {
  let config: FhevmInstanceConfig;

  beforeEach(async () => {
    fetchMock.removeRoutes();
    setupV1RoutesKeyUrl();

    config = {
      gatewayChainId: 54321,
      aclContractAddress: '0x4c102C7cA99d3079fEFF08114d3bad888b9794d9',
      kmsContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      inputVerifierContractAddress:
        '0xd11aA685427f93f8010Ba3815f0B8c41c8a6222d',
      verifyingContractAddressDecryption:
        '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      verifyingContractAddressInputVerification:
        '0x2D55fF18668c6b5CB37B4c7687B46acf312A835c',
      chainId: 1234,
      publicKey: { data: tfheCompactPublicKeyBytes, id: assetPublicKeyId },
      publicParams: {
        2048: {
          publicParams: tfheCompactPkeCrsBytes,
          publicParamsId: assetPublicParamsId,
        },
      },
      network: 'https://network.com/',
      relayerUrl: 'https://relayer.com/',
    };
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: createInstance', async () => {
    const instance = await createInstance(config);
    expect(instance.createEIP712).toBeDefined();
    expect(instance.generateKeypair).toBeDefined();
    expect(instance.createEncryptedInput).toBeDefined();
    expect(instance.getPublicKey()).toStrictEqual({
      publicKey: tfheCompactPublicKeyBytes,
      publicKeyId: assetPublicKeyId,
    });
    expect(instance.getPublicParams(2048)?.publicParamsId).toBe(
      assetPublicParamsId,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: chainId', async () => {
    config.chainId = BigInt(1234) as any;

    await expect(createInstance(config)).rejects.toThrow(
      'chainId must be a number',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: publicKey', async () => {
    config.publicKey = { data: 43 as any, id: assetPublicKeyId };
    await expect(createInstance(config)).rejects.toThrow(
      'publicKey must be a Uint8Array',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: aclContractAddress', async () => {
    config.aclContractAddress = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'ACL contract address is not valid or empty',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: kmsContractAddress', async () => {
    config.kmsContractAddress = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'KMS contract address is not valid or empty',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: verifyingContractAddressDecryption', async () => {
    config.verifyingContractAddressDecryption = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'Verifying contract for Decryption address is not valid or empty',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: verifyingContractAddressInputVerification', async () => {
    config.verifyingContractAddressInputVerification = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'Verifying contract for InputVerification address is not valid or empty',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: network', async () => {
    config.network = undefined as unknown as string;
    await expect(createInstance(config)).rejects.toThrow(
      'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicKey', async () => {
    const instance = await createInstance(config);
    const pub_key = instance.getPublicKey();
    expect(pub_key).not.toBeNull();
    expect(pub_key).not.toBeUndefined();
    expect(pub_key!.publicKeyId).toBe(assetPublicKeyId);
    expect(pub_key!.publicKey).toStrictEqual(tfheCompactPublicKeyBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams', async () => {
    const instance = await createInstance(config);
    const pub_params = instance.getPublicParams(2048);
    expect(pub_params).not.toBeNull();
    expect(pub_params).not.toBeUndefined();
    expect(pub_params!.publicParamsId).toBe(assetPublicParamsId);
    expect(pub_params!.publicParams).toStrictEqual(tfheCompactPkeCrsBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: generateKeypair', async () => {
    const instance = await createInstance(config);
    const kp = instance.generateKeypair();
    expect(kp).not.toBeNull();
    expect(kp).not.toBeUndefined();
  });
});
