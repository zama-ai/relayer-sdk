import type { FhevmInstanceConfig } from './index';
import { createInstance } from './index';
import {
  publicKeyId as assetPublicKeyId,
  publicParamsId as assetPublicParamsId,
  tfheCompactPublicKeyBytes,
  tfheCompactPkeCrsBytes,
} from './test';
import {
  removeAllFetchMockRoutes,
  setupAllFetchMockRoutes,
  TEST_CONFIG,
} from './test/config';
import { FhevmConfigError } from './errors/FhevmConfigError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/index.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/index.test.ts --collectCoverageFrom=./src/index.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/index.test.ts --collectCoverageFrom=./src/index.ts
//
// Testnet:
// ========
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/index.test.ts
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/index.test.ts --testNamePattern=xxx
//
// Devnet:
// ========
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/index.test.ts
//
// Mainnet:
// ========
// npx jest --config jest.mainnet.config.cjs --colors --passWithNoTests ./src/index.test.ts
//
////////////////////////////////////////////////////////////////////////////////

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('./test/config');
  return setupEthersJestMock();
});

////////////////////////////////////////////////////////////////////////////////

describe('index', () => {
  let configWithDownloadedKeysV1: FhevmInstanceConfig;
  let configWithDownloadedKeysV2: FhevmInstanceConfig;

  beforeEach(async () => {
    removeAllFetchMockRoutes();
    setupAllFetchMockRoutes({ enableInputProofRoutes: false });

    configWithDownloadedKeysV1 = {
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      publicKey: { data: tfheCompactPublicKeyBytes, id: assetPublicKeyId },
      publicParams: {
        2048: {
          publicParams: tfheCompactPkeCrsBytes,
          publicParamsId: assetPublicParamsId,
        },
      },
    };

    configWithDownloadedKeysV2 = {
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      publicKey: { data: tfheCompactPublicKeyBytes, id: assetPublicKeyId },
      publicParams: {
        2048: {
          publicParams: tfheCompactPkeCrsBytes,
          publicParamsId: assetPublicParamsId,
        },
      },
    };
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: createInstance', async () => {
    const instance = await createInstance(configWithDownloadedKeysV1);
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

  it('v2: createInstance', async () => {
    const instance = await createInstance(configWithDownloadedKeysV2);
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

  it('v1: fails: chainId mismatch', async () => {
    // The mock returns chainId from TEST_CONFIG, so using a different chainId should fail
    const expectedChainId = TEST_CONFIG.fhevmInstanceConfig.chainId;
    configWithDownloadedKeysV1.chainId = 9999;

    await expect(createInstance(configWithDownloadedKeysV1)).rejects.toThrow(
      `Invalid config chainId 9999. Expecting ${expectedChainId}.`,
    );
  });

  it('v2: fails: chainId mismatch', async () => {
    // The mock returns chainId from TEST_CONFIG, so using a different chainId should fail
    const expectedChainId = TEST_CONFIG.fhevmInstanceConfig.chainId;
    configWithDownloadedKeysV2.chainId = 9999;

    await expect(createInstance(configWithDownloadedKeysV2)).rejects.toThrow(
      `Invalid config chainId 9999. Expecting ${expectedChainId}.`,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: publicKey', async () => {
    configWithDownloadedKeysV1.publicKey = {
      data: 43 as any,
      id: assetPublicKeyId,
    };
    await expect(createInstance(configWithDownloadedKeysV1)).rejects.toThrow(
      'Invalid public key (deserialization failed)',
    );
  });

  it('v2: fails: publicKey', async () => {
    configWithDownloadedKeysV2.publicKey = {
      data: 43 as any,
      id: assetPublicKeyId,
    };
    await expect(createInstance(configWithDownloadedKeysV2)).rejects.toThrow(
      'Invalid public key (deserialization failed)',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: aclContractAddress', async () => {
    configWithDownloadedKeysV1.aclContractAddress = '0x12345';
    await expect(createInstance(configWithDownloadedKeysV1)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  it('v2: fails: aclContractAddress', async () => {
    configWithDownloadedKeysV2.aclContractAddress = '0x12345';
    await expect(createInstance(configWithDownloadedKeysV2)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: kmsContractAddress', async () => {
    configWithDownloadedKeysV1.kmsContractAddress = '0x12345';
    await expect(createInstance(configWithDownloadedKeysV1)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  it('v2: fails: kmsContractAddress', async () => {
    configWithDownloadedKeysV2.kmsContractAddress = '0x12345';
    await expect(createInstance(configWithDownloadedKeysV2)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: verifyingContractAddressDecryption', async () => {
    configWithDownloadedKeysV1.verifyingContractAddressDecryption = '0x12345';
    await expect(createInstance(configWithDownloadedKeysV1)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  it('v2: fails: verifyingContractAddressDecryption', async () => {
    configWithDownloadedKeysV2.verifyingContractAddressDecryption = '0x12345';
    await expect(createInstance(configWithDownloadedKeysV2)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: verifyingContractAddressInputVerification', async () => {
    configWithDownloadedKeysV1.verifyingContractAddressInputVerification =
      '0x12345';
    await expect(createInstance(configWithDownloadedKeysV1)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  it('v2: fails: verifyingContractAddressInputVerification', async () => {
    configWithDownloadedKeysV2.verifyingContractAddressInputVerification =
      '0x12345';
    await expect(createInstance(configWithDownloadedKeysV2)).rejects.toThrow(
      FhevmConfigError,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fails: network', async () => {
    configWithDownloadedKeysV1.network = undefined as unknown as string;
    await expect(createInstance(configWithDownloadedKeysV1)).rejects.toThrow(
      'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
    );
  });

  it('v2: fails: network', async () => {
    configWithDownloadedKeysV2.network = undefined as unknown as string;
    await expect(createInstance(configWithDownloadedKeysV2)).rejects.toThrow(
      'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicKey', async () => {
    const instance = await createInstance(configWithDownloadedKeysV1);
    const pub_key = instance.getPublicKey();
    expect(pub_key).not.toBeNull();
    expect(pub_key).not.toBeUndefined();
    expect(pub_key!.publicKeyId).toBe(assetPublicKeyId);
    expect(pub_key!.publicKey).toStrictEqual(tfheCompactPublicKeyBytes);
  });

  it('v2: getPublicKey', async () => {
    const instance = await createInstance(configWithDownloadedKeysV2);
    const pub_key = instance.getPublicKey();
    expect(pub_key).not.toBeNull();
    expect(pub_key).not.toBeUndefined();
    expect(pub_key!.publicKeyId).toBe(assetPublicKeyId);
    expect(pub_key!.publicKey).toStrictEqual(tfheCompactPublicKeyBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams', async () => {
    const instance = await createInstance(configWithDownloadedKeysV1);
    const pub_params = instance.getPublicParams(2048);
    expect(pub_params).not.toBeNull();
    expect(pub_params).not.toBeUndefined();
    expect(pub_params!.publicParamsId).toBe(assetPublicParamsId);
    expect(pub_params!.publicParams).toStrictEqual(tfheCompactPkeCrsBytes);
  });

  it('v2: getPublicParams', async () => {
    const instance = await createInstance(configWithDownloadedKeysV2);
    const pub_params = instance.getPublicParams(2048);
    expect(pub_params).not.toBeNull();
    expect(pub_params).not.toBeUndefined();
    expect(pub_params!.publicParamsId).toBe(assetPublicParamsId);
    expect(pub_params!.publicParams).toStrictEqual(tfheCompactPkeCrsBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: generateKeypair', async () => {
    const instance = await createInstance(configWithDownloadedKeysV1);
    const kp = instance.generateKeypair();
    expect(kp).not.toBeNull();
    expect(kp).not.toBeUndefined();
  });

  it('v2: generateKeypair', async () => {
    const instance = await createInstance(configWithDownloadedKeysV2);
    const kp = instance.generateKeypair();
    expect(kp).not.toBeNull();
    expect(kp).not.toBeUndefined();
  });
});
