import type { ethers as EthersT } from 'ethers';
import { createInstance } from '../..';
import type { RelayerPublicDecryptPayload } from '../../relayer/fetchRelayer';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { createRelayerProvider } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerV2ResponseInvalidBodyError } from './errors/RelayerV2ResponseInvalidBodyError';
import {
  fheCounterGeCount,
  getTestProvider,
  removeAllFetchMockRoutes,
  setupAllFetchMockRoutes,
  TEST_CONFIG,
} from '../../test/utils';
import { RUNNING_REQ_STATE } from '../../test/v2/mockRoutes';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts
//
// Devnet:
// =======
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --testNamePattern=xxx
//

const ciphertextHandles: `0x${string}`[] = [
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
];

const payload: RelayerPublicDecryptPayload = {
  ciphertextHandles,
  extraData: '0x00',
};

function post202(body: any) {
  fetchMock.post(TEST_CONFIG.v2.urls.publicDecrypt, {
    status: 202,
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

function invalidBodyError(cause: InvalidPropertyError) {
  return new RelayerV2ResponseInvalidBodyError({
    fetchMethod: 'POST',
    status: 202,
    url: TEST_CONFIG.v2.urls.publicDecrypt,
    elapsed: 0,
    retryCount: 0,
    operation: 'PUBLIC_DECRYPT',
    state: RUNNING_REQ_STATE,
    cause,
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

describeIfFetchMock('RelayerV2Provider:public-decrypt:mock:', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    removeAllFetchMockRoutes();
    relayerProvider = createRelayerProvider(TEST_CONFIG.v2.urls.base);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(TEST_CONFIG.v2.urls.base);
    expect(relayerProvider.publicDecrypt).toBe(
      TEST_CONFIG.v2.urls.publicDecrypt,
    );
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2:public-decrypt: 202 - malformed json', async () => {
    const malformedBodyJson = '{ "some_key": "incomplete_json"';

    let syntaxError;
    try {
      JSON.stringify(malformedBodyJson);
    } catch (e) {
      syntaxError = e as Error;
    }

    post202(malformedBodyJson);
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(syntaxError);
  });

  it('v2:public-decrypt: 202 - empty json', async () => {
    post202({});
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError(
        InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
        }),
      ),
    );
  });

  it('v2:public-decrypt: 202 - status:failed', async () => {
    post202({ status: 'failed' });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError(
        new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'failed',
        }),
      ),
    );
  });

  it('v2:public-decrypt: 202 - status:succeeded', async () => {
    post202({ status: 'succeeded' });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError(
        new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'succeeded',
        }),
      ),
    );
  });

  it('v2:public-decrypt: 202 - status:queued', async () => {
    post202({ status: 'queued' });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError(
        InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'result',
          expectedType: 'non-nullable',
        }),
      ),
    );
  });

  it('v2:public-decrypt: 202 - status:queued, result empty', async () => {
    post202({ status: 'queued', result: {} });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError(
        InvalidPropertyError.missingProperty({
          objName: 'body.result',
          property: 'jobId',
          expectedType: 'string',
        }),
      ),
    );
  });

  it('xxx v2:public-decrypt: 202 - status:queued, result ok', async () => {
    post202({
      status: 'queued',
      result: { jobId: '123', retryAfterSeconds: 3 },
    });

    fetchMock.get(`${TEST_CONFIG.v2.urls.publicDecrypt}/123`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'hello',
        result: {
          decryptedValue: 'deadbeef',
          signatures: ['deadbeef'],
          extraData: '0x00',
        },
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await relayerProvider.fetchPostPublicDecrypt(payload);
    expect(res.decryptedValue).toBe('deadbeef');
    expect(res.extraData).toBe('0x00');
    expect(res.signatures).toStrictEqual(['deadbeef']);
  });

  it('v2:public-decrypt: 202 - status:queued - Retry-After, result ok', async () => {
    console.log('MISSING TEST: test Retry-After header!!');
  });
});

describeIfFetch('RelayerV2Provider:public-decrypt:sepolia:', () => {
  let provider: EthersT.Provider;

  beforeEach(() => {
    removeAllFetchMockRoutes();
    provider = getTestProvider(TEST_CONFIG.fhevmInstanceConfig.network);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2: succeeded', async () => {
    setupAllFetchMockRoutes({});

    const config = TEST_CONFIG.v2.fhevmInstanceConfig;
    const eCount = await fheCounterGeCount(
      TEST_CONFIG.testContracts.FHECounterPublicDecryptAddress,
      provider,
    );

    const instance = await createInstance(config);
    await instance.publicDecrypt([eCount]);
  }, 60000);

  it('xxx v1: succeeded', async () => {
    setupAllFetchMockRoutes({});

    const config = TEST_CONFIG.v1.fhevmInstanceConfig;
    const eCount = await fheCounterGeCount(
      TEST_CONFIG.testContracts.FHECounterPublicDecryptAddress,
      provider,
    );

    const instance = await createInstance(config);
    await instance.publicDecrypt([eCount]);
  }, 60000);
});
