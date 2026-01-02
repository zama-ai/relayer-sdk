import type { ethers as EthersT } from 'ethers';
import type { ChecksummedAddress } from '../../base/types/primitives';
import { createInstance } from '../..';
import type { RelayerPublicDecryptPayload } from '../../relayer-provider/types/public-api';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { createRelayerProvider } from '../createRelayerProvider';
import fetchMock from 'fetch-mock';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerV2ResponseInvalidBodyError } from './errors/RelayerV2ResponseInvalidBodyError';
import {
  fheTestGet,
  getTestProvider,
  removeAllFetchMockRoutes,
  setupAllFetchMockRoutes,
  TEST_CONFIG,
} from '../../test/config';
import { RUNNING_REQ_STATE } from '../../test/v2/mockRoutes';
import { safeJSONstringify } from '../../base/string';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts
//
//
// Devnet:
// =======
//
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --testNamePattern=xxx
//
//
// Curl Devnet:
// ============
//
// curl https://relayer.dev.zama.cloud/v2/public-decrypt/<jobId>
//
////////////////////////////////////////////////////////////////////////////////

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

function invalidBodyError(params: {
  cause: InvalidPropertyError;
  bodyJson: string;
}) {
  return new RelayerV2ResponseInvalidBodyError({
    fetchMethod: 'POST',
    status: 202,
    url: TEST_CONFIG.v2.urls.publicDecrypt,
    elapsed: 0,
    retryCount: 0,
    operation: 'PUBLIC_DECRYPT',
    state: RUNNING_REQ_STATE,
    ...params,
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
    relayerProvider = createRelayerProvider(TEST_CONFIG.v2.urls.base, 1);
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
    const bodyJson = {};
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
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

  it('v2:public-decrypt: 202 - status:failed', async () => {
    const bodyJson = { status: 'failed' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
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

  it('v2:public-decrypt: 202 - status:succeeded', async () => {
    const bodyJson = { status: 'succeeded' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
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

  it('v2:public-decrypt: 202 - status:queued', async () => {
    const bodyJson = { status: 'queued' };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
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

  it('v2:public-decrypt: 202 - status:queued, result empty', async () => {
    const bodyJson = { status: 'queued', requestId: 'foo', result: {} };
    post202(bodyJson);
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      invalidBodyError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'body.result',
          property: 'jobId',
          expectedType: 'string',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  it('v2:public-decrypt: 202 - status:queued, result ok', async () => {
    post202({
      status: 'queued',
      requestId: 'hello',
      result: { jobId: '123' },
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
  let fromAddress: ChecksummedAddress;

  beforeEach(() => {
    removeAllFetchMockRoutes();
    provider = getTestProvider(TEST_CONFIG.fhevmInstanceConfig.network);
    fromAddress = TEST_CONFIG.signerAddress;
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2: succeeded', async () => {
    setupAllFetchMockRoutes({});

    const config = TEST_CONFIG.v2.fhevmInstanceConfig;
    const handle = await fheTestGet(
      'euint32',
      TEST_CONFIG.testContracts.FHETestAddress,
      provider,
      fromAddress,
    );

    const instance = await createInstance(config);
    await instance.publicDecrypt([handle]);
  }, 60000);

  it('v1: succeeded', async () => {
    setupAllFetchMockRoutes({});

    const config = TEST_CONFIG.v1.fhevmInstanceConfig;
    const handle = await fheTestGet(
      'euint32',
      TEST_CONFIG.testContracts.FHETestAddress,
      provider,
      fromAddress,
    );

    const instance = await createInstance(config);
    await instance.publicDecrypt([handle]);
  }, 60000);
});
