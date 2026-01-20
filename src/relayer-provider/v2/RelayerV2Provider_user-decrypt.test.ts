import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { createRelayerProvider } from '../createRelayerProvider';
import fetchMock from 'fetch-mock';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerV2ResponseInvalidBodyError } from './errors/RelayerV2ResponseInvalidBodyError';
import { RUNNING_REQ_STATE } from '../../test/v2/mockRoutes';
import {
  fheTestGet,
  getTestProvider,
  removeAllFetchMockRoutes,
  setupAllFetchMockRoutes,
  TEST_CONFIG,
  timestampNow,
} from '../../test/config';
import { createInstance, UserDecryptResults } from '../..';
import { KmsSigner } from '../../test/fhevm-mock/KmsSigner';
import { KmsEIP712 } from '../../sdk/kms/KmsEIP712';
import { assertIsBytes65Hex, assertIsBytesHexNo0x } from '../../base/bytes';
import { ensure0x, safeJSONstringify } from '../../base/string';
import type { ethers as EthersT } from 'ethers';
import type {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '../../base/types/primitives';
import type { RelayerUserDecryptPayload } from '../types/public-api';
import type { FhevmInstanceConfig } from '../../types/relayer';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts
//
// Testnet:
// ========
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts --testNamePattern=xxx
//
// Devnet:
// =======
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts --testNamePattern=xxx
//
// Testnet:
// =======
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_user-decrypt.test.ts
//
////////////////////////////////////////////////////////////////////////////////

jest.setTimeout(360000);

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('../../test/config');
  return setupEthersJestMock();
});

const payload: RelayerUserDecryptPayload = {
  handleContractPairs: [
    {
      handle: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      contractAddress: TEST_CONFIG.testContracts.FHETestAddress,
    },
  ],
  requestValidity: {
    startTimestamp: '123',
    durationDays: '456',
  },
  contractsChainId: '1234',
  contractAddresses: [TEST_CONFIG.testContracts.FHETestAddress],
  userAddress: TEST_CONFIG.signerAddress,
  signature: 'deadbeef',
  publicKey: 'deadbeef',
  extraData: '0x00',
};

function invalidBodyError(params: {
  cause: InvalidPropertyError;
  bodyJson: string;
}) {
  return new RelayerV2ResponseInvalidBodyError({
    fetchMethod: 'POST',
    status: 202,
    url: TEST_CONFIG.v2.urls.userDecrypt,
    elapsed: 0,
    retryCount: 0,
    operation: 'USER_DECRYPT',
    state: RUNNING_REQ_STATE,
    ...params,
  });
}

function post202(body: any) {
  fetchMock.post(TEST_CONFIG.v2.urls.userDecrypt, {
    status: 202,
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;
const describeIfFetch =
  TEST_CONFIG.type === 'fetch-mock' ? describe.skip : describe;

const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

describeIfFetchMock('RelayerV2Provider', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    relayerProvider = createRelayerProvider(TEST_CONFIG.v2.urls.base, 1);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(TEST_CONFIG.v2.urls.base);
    expect(relayerProvider.userDecryptUrl).toBe(
      TEST_CONFIG.v2.urls.userDecrypt,
    );
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2:user-decrypt: 202 - malformed json', async () => {
    const malformedBodyJson = '{ "some_key": "incomplete_json"';

    let syntaxError;
    try {
      JSON.stringify(malformedBodyJson);
    } catch (e) {
      syntaxError = e as Error;
    }

    post202(malformedBodyJson);
    await expect(() =>
      relayerProvider.fetchPostUserDecrypt(payload),
    ).rejects.toThrow(syntaxError);
  });

  it('v2:user-decrypt: 202 - empty json', async () => {
    const bodyJson = {};
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostUserDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  it('v2:user-decrypt: 202 - status:failed', async () => {
    const bodyJson = { status: 'failed' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostUserDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError({
        cause: new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'failed',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  it('v2:user-decrypt: 202 - status:succeeded', async () => {
    const bodyJson = { status: 'succeeded' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostUserDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError({
        cause: new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'succeeded',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  it('v2:user-decrypt: 202 - status:queued', async () => {
    const bodyJson = { status: 'queued' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostUserDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'requestId',
          expectedType: 'string',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  it('v2:user-decrypt: 202 - status:queued, result empty', async () => {
    const bodyJson = { status: 'queued', result: {} };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostUserDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'requestId',
          expectedType: 'string',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  it('v2:user-decrypt: 202 - status:queued, result ok', async () => {
    const bodyJson = {
      status: 'queued',
      requestId: 'hello',
      result: { jobId: '123' },
    };
    post202(bodyJson);

    fetchMock.get(`${TEST_CONFIG.v2.urls.userDecrypt}/123`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'hello',
        result: {
          result: [
            {
              payload: 'deadbeef',
              signature: 'deadbeef',
              //extraData: '0x00',
            },
          ],
        },
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await relayerProvider.fetchPostUserDecrypt(payload);
    console.log(JSON.stringify(result, null, 2));
  });
});

////////////////////////////////////////////////////////////////////////////////

describeIfFetch('FhevmInstance.userDecrypt:sepolia:', () => {
  let provider: EthersT.Provider;
  let fromAddress: ChecksummedAddress;

  beforeEach(() => {
    removeAllFetchMockRoutes();
    provider = getTestProvider(TEST_CONFIG.fhevmInstanceConfig.network);
    fromAddress = TEST_CONFIG.signerAddress;
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  async function testUserDecrypt(version: 1 | 2, config: FhevmInstanceConfig) {
    const mnemonic = TEST_CONFIG.mnemonic;
    if (typeof mnemonic !== 'string' || mnemonic.length === 0) {
      throw new Error(`Missing MNEMONIC env variable in .env file!`);
    }

    // For conveniance: use KmsSigner feature to create the signer.
    // Should use an agnostic method instead
    const userSigner = KmsSigner.fromMnemonic({ mnemonic });

    const eCount = await fheTestGet(
      'euint32',
      TEST_CONFIG.testContracts.FHETestAddress,
      provider,
      fromAddress,
    );

    const startTimestamp = timestampNow();
    const durationDays = 365;
    const extraData = '0x00';
    const contractAddress = TEST_CONFIG.testContracts.FHETestAddress;
    const contractAddresses = [contractAddress];
    const userAddress = userSigner.address;

    const instance = await createInstance(config);
    const keypairNo0x = instance.generateKeypair();

    assertIsBytesHexNo0x(keypairNo0x.publicKey);
    assertIsBytesHexNo0x(keypairNo0x.privateKey);

    const publicKey: BytesHex = ensure0x(keypairNo0x.publicKey);
    const privateKey: BytesHex = ensure0x(keypairNo0x.privateKey);

    console.log(`[v${version} user-decrypt]: Create EIP712`);
    const eip = instance.createEIP712(
      publicKey,
      contractAddresses,
      startTimestamp,
      durationDays,
    );

    const kmsEIP712 = new KmsEIP712({
      chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId!),
      verifyingContractAddressDecryption:
        TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
    });

    const new_eip = kmsEIP712.createUserDecryptEIP712({
      publicKey,
      contractAddresses,
      durationDays,
      startTimestamp,
      extraData,
    });

    expect(new_eip.domain).toStrictEqual(eip.domain);
    expect(new_eip.primaryType).toStrictEqual(eip.primaryType);
    expect(new_eip.types).toStrictEqual(eip.types);
    expect(new_eip.message).toStrictEqual(eip.message);

    console.log(`[v${version} user-decrypt]: sign EIP712`);
    const signature: Bytes65Hex = await userSigner.sign(new_eip);
    assertIsBytes65Hex(signature);

    console.log(
      `[v${version} user-decrypt]: instance.userDecrypt(handle: ${eCount})...`,
    );
    const res: UserDecryptResults = await instance.userDecrypt(
      [
        {
          contractAddress,
          handle: eCount,
        },
      ],
      privateKey,
      publicKey,
      signature,
      contractAddresses,
      userAddress,
      startTimestamp,
      durationDays,
    );

    expect(eCount in res).toBe(true);
    expect(res[eCount]).toBeDefined();

    const t = typeof res[eCount];
    expect(t === 'bigint' || t === 'number' || t === 'string').toBe(true);

    expect(res[eCount]).toBeGreaterThan(0);

    console.log(`[v${version} user-decrypt]: done!`);
  }

  it('v2: FhevmInstance.userDecrypt succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testUserDecrypt(2, TEST_CONFIG.v2.fhevmInstanceConfig);
  });

  it('v1: FhevmInstance.userDecrypt succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testUserDecrypt(1, TEST_CONFIG.v1.fhevmInstanceConfig);
  });
});

////////////////////////////////////////////////////////////////////////////////

describe('FhevmInstance.createEIP712', () => {
  beforeEach(() => {
    removeAllFetchMockRoutes();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  async function testCreateEIP712(config: FhevmInstanceConfig) {
    const mnemonic = TEST_CONFIG.mnemonic;
    if (typeof mnemonic !== 'string' || mnemonic.length === 0) {
      throw new Error(`Missing MNEMONIC env variable in .env file!`);
    }

    if (
      config.verifyingContractAddressDecryption !==
      TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption
    ) {
      throw new Error('verifyingContractAddressDecryption missmatch');
    }

    const userSigner = KmsSigner.fromMnemonic({ mnemonic });

    const startTimestamp = timestampNow();
    const durationDays = 365;
    const extraData = '0x00';
    const contractAddress = TEST_CONFIG.testContracts.FHETestAddress;
    const contractAddresses = [contractAddress];

    const instance = await createInstance(config);

    if (
      instance.config.verifyingContractAddressDecryption !==
      TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption
    ) {
      throw new Error('verifyingContractAddressDecryption missmatch');
    }

    const keypairNo0x = instance.generateKeypair();

    assertIsBytesHexNo0x(keypairNo0x.publicKey);
    assertIsBytesHexNo0x(keypairNo0x.privateKey);

    const publicKey: BytesHex = ensure0x(keypairNo0x.publicKey);

    const eip = instance.createEIP712(
      publicKey,
      contractAddresses,
      startTimestamp,
      durationDays,
    );

    const kmsEIP712 = new KmsEIP712({
      chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId!),
      verifyingContractAddressDecryption:
        TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
    });

    const new_eip = kmsEIP712.createUserDecryptEIP712({
      publicKey,
      contractAddresses,
      durationDays,
      startTimestamp,
      extraData,
    });

    expect(new_eip.domain).toStrictEqual(eip.domain);
    expect(new_eip.primaryType).toStrictEqual(eip.primaryType);
    expect(new_eip.types).toStrictEqual(eip.types);
    expect(new_eip.message).toStrictEqual(eip.message);

    const signature: Bytes65Hex = await userSigner.sign(new_eip);
    assertIsBytes65Hex(signature);

    const recoveredAddresses = kmsEIP712.verifyUserDecrypt([signature], {
      contractAddresses,
      durationDays,
      startTimestamp,
      extraData,
      publicKey,
    });

    expect(recoveredAddresses.length).toBe(1);
    expect(recoveredAddresses[0]).toBe(userSigner.address);
  }

  async function testDelegateCreateEIP712(config: FhevmInstanceConfig) {
    const mnemonic = TEST_CONFIG.mnemonic;
    if (typeof mnemonic !== 'string' || mnemonic.length === 0) {
      throw new Error(`Missing MNEMONIC env variable in .env file!`);
    }

    const userSigner = KmsSigner.fromMnemonic({ mnemonic });

    const startTimestamp = timestampNow();
    const durationDays = 365;
    const extraData = '0x00';
    const contractAddress = TEST_CONFIG.testContracts.FHETestAddress;
    const contractAddresses = [contractAddress];
    const delegatedAccount = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';

    const instance = await createInstance(config);
    const keypairNo0x = instance.generateKeypair();

    assertIsBytesHexNo0x(keypairNo0x.publicKey);
    assertIsBytesHexNo0x(keypairNo0x.privateKey);

    const publicKey: BytesHex = ensure0x(keypairNo0x.publicKey);
    const kmsEIP712 = new KmsEIP712({
      chainId: BigInt(config.chainId!),
      verifyingContractAddressDecryption:
        config.verifyingContractAddressDecryption,
    });

    const eip = kmsEIP712.createDelegateUserDecryptEIP712({
      publicKey,
      contractAddresses,
      startTimestamp,
      durationDays,
      delegatedAccount,
      extraData: '0x00',
    });

    const newKmsEIP712 = new KmsEIP712({
      chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId!),
      verifyingContractAddressDecryption:
        TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
    });

    const new_eip = newKmsEIP712.createDelegateUserDecryptEIP712({
      publicKey,
      contractAddresses,
      durationDays,
      startTimestamp,
      extraData,
      delegatedAccount,
    });

    expect(new_eip.domain).toStrictEqual(eip.domain);
    expect(new_eip.primaryType).toStrictEqual(eip.primaryType);
    expect(new_eip.types).toStrictEqual(eip.types);
    expect(new_eip.message).toStrictEqual(eip.message);

    const signature: Bytes65Hex = await userSigner.sign(new_eip);
    assertIsBytes65Hex(signature);

    const recoveredAddresses = kmsEIP712.verifyDelegateUserDecrypt(
      [signature],
      {
        contractAddresses,
        durationDays,
        startTimestamp,
        extraData,
        publicKey,
        delegatedAccount,
      },
    );

    expect(recoveredAddresses.length).toBe(1);
    expect(recoveredAddresses[0]).toBe(userSigner.address);
  }

  it('v1: createEIP712 succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testCreateEIP712(TEST_CONFIG.v1.fhevmInstanceConfig);
  });

  it('v2: createEIP712 succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testCreateEIP712(TEST_CONFIG.v2.fhevmInstanceConfig);
  });

  it('v1: createEIP712 delegate succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testDelegateCreateEIP712(TEST_CONFIG.v2.fhevmInstanceConfig);
  });

  it('v2: createEIP712 delegate succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testDelegateCreateEIP712(TEST_CONFIG.v2.fhevmInstanceConfig);
  });
});
