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
import type { RelayerDelegatedUserDecryptPayload } from '../types/public-api';
import type { FhevmInstanceConfig } from '../../types/relayer';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_delegated-user-decrypt.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_delegated-user-decrypt.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_delegated-user-decrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts
//
// Devnet:
// =======
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_delegated-user-decrypt.test.ts
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_delegated-user-decrypt.test.ts --testNamePattern=xxx
//
// Testnet:
// =======
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_delegated-user-decrypt.test.ts
//
////////////////////////////////////////////////////////////////////////////////

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('../../test/config');
  return setupEthersJestMock();
});

const DELEGATED_USER_DECRYPT_URL =
  TEST_CONFIG.v2.urls.base + '/delegated-user-decrypt';

const payload: RelayerDelegatedUserDecryptPayload = {
  handleContractPairs: [
    {
      handle: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      contractAddress: TEST_CONFIG.testContracts.FHETestAddress,
    },
  ],
  startTimestamp: '123',
  durationDays: '456',
  contractsChainId: '1234',
  contractAddresses: [TEST_CONFIG.testContracts.FHETestAddress],
  delegateAddress: TEST_CONFIG.signerAddress,
  delegatorAddress: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
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
    url: DELEGATED_USER_DECRYPT_URL,
    elapsed: 0,
    retryCount: 0,
    operation: 'DELEGATED_USER_DECRYPT',
    state: RUNNING_REQ_STATE,
    ...params,
  });
}

function post202(body: any) {
  fetchMock.post(DELEGATED_USER_DECRYPT_URL, {
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

describeIfFetchMock('RelayerV2Provider - Delegated User Decrypt', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    relayerProvider = createRelayerProvider(TEST_CONFIG.v2.urls.base, 1);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(TEST_CONFIG.v2.urls.base);
    expect(relayerProvider.delegatedUserDecryptUrl).toBe(
      DELEGATED_USER_DECRYPT_URL,
    );
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2:delegated-user-decrypt: 202 - malformed json', async () => {
    const malformedBodyJson = '{ "some_key": "incomplete_json"';

    let syntaxError;
    try {
      JSON.stringify(malformedBodyJson);
    } catch (e) {
      syntaxError = e as Error;
    }

    post202(malformedBodyJson);
    await expect(() =>
      relayerProvider.fetchPostDelegatedUserDecrypt(payload),
    ).rejects.toThrow(syntaxError);
  });

  it('v2:delegated-user-decrypt: 202 - empty json', async () => {
    const bodyJson = {};
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostDelegatedUserDecrypt(payload),
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

  it('v2:delegated-user-decrypt: 202 - status:failed', async () => {
    const bodyJson = { status: 'failed' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostDelegatedUserDecrypt(payload),
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

  it('v2:delegated-user-decrypt: 202 - status:succeeded', async () => {
    const bodyJson = { status: 'succeeded' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostDelegatedUserDecrypt(payload),
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

  it('v2:delegated-user-decrypt: 202 - status:queued', async () => {
    const bodyJson = { status: 'queued' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostDelegatedUserDecrypt(payload),
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

  it('v2:delegated-user-decrypt: 202 - status:queued, result empty', async () => {
    const bodyJson = { status: 'queued', result: {} };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostDelegatedUserDecrypt(payload),
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

  it('v2:delegated-user-decrypt: 202 - status:queued, result ok', async () => {
    const bodyJson = {
      status: 'queued',
      requestId: 'hello',
      result: { jobId: '123' },
    };
    post202(bodyJson);

    fetchMock.get(`${DELEGATED_USER_DECRYPT_URL}/123`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'hello',
        result: {
          result: [
            {
              payload: 'deadbeef',
              signature: 'deadbeef',
            },
          ],
        },
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await relayerProvider.fetchPostDelegatedUserDecrypt(payload);
    console.log(JSON.stringify(result, null, 2));
  });
});

////////////////////////////////////////////////////////////////////////////////

describeIfFetch('FhevmInstance.delegatedUserDecrypt:sepolia:', () => {
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

  async function testDelegatedUserDecrypt(config: FhevmInstanceConfig) {
    const mnemonic = TEST_CONFIG.mnemonic;
    if (typeof mnemonic !== 'string' || mnemonic.length === 0) {
      throw new Error(`Missing MNEMONIC env variable in .env file!`);
    }

    const delegateSigner = KmsSigner.fromMnemonic({ mnemonic });

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
    const delegatorAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';
    const delegateAddress = delegateSigner.address;

    const instance = await createInstance(config);
    const keypairNo0x = instance.generateKeypair();

    assertIsBytesHexNo0x(keypairNo0x.publicKey);
    assertIsBytesHexNo0x(keypairNo0x.privateKey);

    const publicKey: BytesHex = ensure0x(keypairNo0x.publicKey);
    const privateKey: BytesHex = ensure0x(keypairNo0x.privateKey);

    const eip = instance.createDelegatedUserDecryptEIP712(
      publicKey,
      contractAddresses,
      delegatorAddress,
      startTimestamp,
      durationDays,
    );

    const kmsEIP712 = new KmsEIP712({
      chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId!),
      verifyingContractAddressDecryption:
        TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
    });

    const new_eip = kmsEIP712.createDelegatedUserDecryptEIP712({
      publicKey,
      contractAddresses,
      delegatorAddress,
      durationDays,
      startTimestamp,
      extraData,
    });

    expect(new_eip.domain).toStrictEqual(eip.domain);
    expect(new_eip.primaryType).toStrictEqual(eip.primaryType);
    expect(new_eip.types).toStrictEqual(eip.types);
    expect(new_eip.message).toStrictEqual(eip.message);

    const signature: Bytes65Hex = await delegateSigner.sign(new_eip);
    assertIsBytes65Hex(signature);

    const res: UserDecryptResults = await instance.delegatedUserDecrypt(
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
      delegateAddress,
      delegatorAddress,
      startTimestamp,
      durationDays,
    );

    expect(eCount in res).toBe(true);
    expect(res[eCount]).toBeDefined();

    const t = typeof res[eCount];
    expect(t === 'bigint' || t === 'number' || t === 'string').toBe(true);

    expect(res[eCount]).toBeGreaterThan(0);
  }

  it('v2: FhevmInstance.delegatedUserDecrypt succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testDelegatedUserDecrypt(TEST_CONFIG.v2.fhevmInstanceConfig);
  }, 60000);

  it('v1: FhevmInstance.delegatedUserDecrypt succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testDelegatedUserDecrypt(TEST_CONFIG.v1.fhevmInstanceConfig);
  }, 60000);
});

////////////////////////////////////////////////////////////////////////////////

describe('FhevmInstance.createDelegatedUserDecryptEIP712', () => {
  beforeEach(() => {
    removeAllFetchMockRoutes();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  async function testDelegateCreateEIP712(config: FhevmInstanceConfig) {
    const mnemonic = TEST_CONFIG.mnemonic;
    if (typeof mnemonic !== 'string' || mnemonic.length === 0) {
      throw new Error(`Missing MNEMONIC env variable in .env file!`);
    }

    if (
      config.verifyingContractAddressDecryption !==
      TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption
    ) {
      throw new Error('verifyingContractAddressDecryption mismatch');
    }

    const delegateSigner = KmsSigner.fromMnemonic({ mnemonic });

    const startTimestamp = timestampNow();
    const durationDays = 365;
    const extraData = '0x00';
    const contractAddress = TEST_CONFIG.testContracts.FHETestAddress;
    const contractAddresses = [contractAddress];
    const delegatorAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF';

    const instance = await createInstance(config);

    if (
      instance.config.verifyingContractAddressDecryption !==
      TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption
    ) {
      throw new Error('verifyingContractAddressDecryption mismatch');
    }

    const keypairNo0x = instance.generateKeypair();

    assertIsBytesHexNo0x(keypairNo0x.publicKey);
    assertIsBytesHexNo0x(keypairNo0x.privateKey);

    const publicKey: BytesHex = ensure0x(keypairNo0x.publicKey);

    const instanceEIP712 = instance.createDelegatedUserDecryptEIP712(
      publicKey,
      contractAddresses,
      delegatorAddress,
      startTimestamp,
      durationDays,
    );

    const kmsEIP712 = new KmsEIP712({
      chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId),
      verifyingContractAddressDecryption:
        TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
    });

    const delegatedUserDecryptEIP712 =
      kmsEIP712.createDelegatedUserDecryptEIP712({
        publicKey,
        contractAddresses,
        delegatorAddress,
        startTimestamp,
        durationDays,
        extraData,
      });

    expect(delegatedUserDecryptEIP712.domain).toStrictEqual(
      instanceEIP712.domain,
    );
    expect(delegatedUserDecryptEIP712.primaryType).toStrictEqual(
      instanceEIP712.primaryType,
    );
    expect(delegatedUserDecryptEIP712.types).toStrictEqual(
      instanceEIP712.types,
    );
    expect(delegatedUserDecryptEIP712.message).toStrictEqual(
      instanceEIP712.message,
    );

    const signature: Bytes65Hex = await delegateSigner.sign(
      delegatedUserDecryptEIP712,
    );
    assertIsBytes65Hex(signature);

    const recoveredAddresses = kmsEIP712.verifyDelegatedUserDecrypt(
      [signature],
      {
        publicKey,
        contractAddresses,
        delegatorAddress,
        startTimestamp,
        durationDays,
        extraData,
      },
    );

    expect(recoveredAddresses.length).toBe(1);
    expect(recoveredAddresses[0]).toBe(delegateSigner.address);
  }

  it('v1: createDelegatedUserDecryptEIP712 succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testDelegateCreateEIP712(TEST_CONFIG.v1.fhevmInstanceConfig);
  }, 60000);

  it('v2: createDelegatedUserDecryptEIP712 succeeded', async () => {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: false,
    });
    await testDelegateCreateEIP712(TEST_CONFIG.v2.fhevmInstanceConfig);
  }, 60000);
});
