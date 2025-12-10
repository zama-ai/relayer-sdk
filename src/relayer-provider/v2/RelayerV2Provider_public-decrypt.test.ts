import { SepoliaConfig } from '../..';
import type { RelayerPublicDecryptPayload } from '../../relayer/fetchRelayer';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { createRelayerProvider } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import { RelayerV2InvalidPostResponseError } from './errors/RelayerV2InvalidPostResponseError';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts

const relayerUrlV2 = `${SepoliaConfig.relayerUrl!}/v2`;

const ciphertextHandles: `0x${string}`[] = [
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
];

const payload: RelayerPublicDecryptPayload = {
  ciphertextHandles,
  extraData: '0x00',
};

function post202(body: any) {
  fetchMock.post(`${relayerUrlV2}/public-decrypt`, {
    status: 202,
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

describe('RelayerV2Provider', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    relayerProvider = createRelayerProvider(`${SepoliaConfigeRelayerUrl}/v2`);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v2`);
    expect(relayerProvider.publicDecrypt).toBe(
      `${SepoliaConfigeRelayerUrl}/v2/public-decrypt`,
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
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/public-decrypt`,
        operation: 'PUBLIC_DECRYPT',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
        }),
      }),
    );
  });

  it('v2:public-decrypt: 202 - status:failed', async () => {
    post202({ status: 'failed' });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/public-decrypt`,
        operation: 'PUBLIC_DECRYPT',
        cause: new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'failed',
        }),
      }),
    );
  });

  it('v2:public-decrypt: 202 - status:succeeded', async () => {
    post202({ status: 'succeeded' });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/public-decrypt`,
        operation: 'PUBLIC_DECRYPT',
        cause: new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'succeeded',
        }),
      }),
    );
  });

  it('v2:public-decrypt: 202 - status:queued', async () => {
    post202({ status: 'queued' });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/public-decrypt`,
        operation: 'PUBLIC_DECRYPT',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'result',
          expectedType: 'non-nullable',
        }),
      }),
    );
  });

  it('v2:public-decrypt: 202 - status:queued, result empty', async () => {
    post202({ status: 'queued', result: {} });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/public-decrypt`,
        operation: 'PUBLIC_DECRYPT',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body.result',
          property: 'jobId',
          expectedType: 'string',
        }),
      }),
    );
  });

  it('v2:public-decrypt: 202 - status:queued, result no retryAfterSeconds', async () => {
    post202({ status: 'queued', result: { jobId: '123' } });
    await expect(() =>
      relayerProvider.fetchPostPublicDecrypt(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/public-decrypt`,
        operation: 'PUBLIC_DECRYPT',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body.result',
          property: 'retryAfterSeconds',
          expectedType: 'Uint',
        }),
      }),
    );
  });

  it('v2:public-decrypt: 202 - status:queued, result ok', async () => {
    post202({
      status: 'queued',
      result: { jobId: '123', retryAfterSeconds: 3 },
    });

    fetchMock.get(`${relayerUrlV2}/public-decrypt/123`, {
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

    await relayerProvider.fetchPostPublicDecrypt(payload);
  });
});
