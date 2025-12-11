import { SepoliaConfig } from '../..';
import type { RelayerInputProofPayload } from '../../relayer/fetchRelayer';
import { createRelayerProvider } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import { RelayerV2InvalidPostResponseError } from './errors/RelayerV2InvalidPostResponseError';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerV2Provider } from './RelayerV2Provider';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts

const relayerUrlV2 = `${SepoliaConfig.relayerUrl!}/v2`;

const contractAddress = '0x8ba1f109551bd432803012645ac136ddd64dba72';
const userAddress = '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80';
const ciphertextWithInputVerification = '0xdeadbeef';
const contractChainId: `0x${string}` = ('0x' +
  Number(31337).toString(16)) as `0x${string}`;
const payload: RelayerInputProofPayload = {
  contractAddress,
  userAddress,
  ciphertextWithInputVerification,
  contractChainId,
  extraData: '0x00',
};

function post202(body: any) {
  fetchMock.post(`${relayerUrlV2}/input-proof`, {
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
  let relayerProvider: RelayerV2Provider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const p = createRelayerProvider(`${SepoliaConfigeRelayerUrl}/v2`);
    if (!(p instanceof RelayerV2Provider)) {
      throw new Error(`Unable to create relayer provider`);
    }
    relayerProvider = p;
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v2`);
    expect(relayerProvider.inputProof).toBe(
      `${SepoliaConfigeRelayerUrl}/v2/input-proof`,
    );
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2:input-proof: 202 - malformed json', async () => {
    const malformedBodyJson = '{ "some_key": "incomplete_json"';

    let syntaxError;
    try {
      JSON.stringify(malformedBodyJson);
    } catch (e) {
      syntaxError = e as Error;
    }

    post202(malformedBodyJson);
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(syntaxError);
  });

  it('v2:input-proof: 202 - empty json', async () => {
    post202({});
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/input-proof`,
        operation: 'INPUT_PROOF',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
        }),
      }),
    );
  });

  it('v2:input-proof: 202 - status:failed', async () => {
    post202({ status: 'failed' });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/input-proof`,
        operation: 'INPUT_PROOF',
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

  it('v2:input-proof: 202 - status:succeeded', async () => {
    post202({ status: 'succeeded' });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/input-proof`,
        operation: 'INPUT_PROOF',
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

  it('v2:input-proof: 202 - status:queued', async () => {
    post202({ status: 'queued' });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/input-proof`,
        operation: 'INPUT_PROOF',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'result',
          expectedType: 'non-nullable',
        }),
      }),
    );
  });

  it('v2:input-proof: 202 - status:queued, result empty', async () => {
    post202({ status: 'queued', result: {} });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/input-proof`,
        operation: 'INPUT_PROOF',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body.result',
          property: 'jobId',
          expectedType: 'string',
        }),
      }),
    );
  });

  it('v2:input-proof: 202 - status:queued, result no timestamp', async () => {
    post202({ status: 'queued', result: { jobId: '123' } });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      new RelayerV2InvalidPostResponseError({
        status: 202,
        url: `${relayerUrlV2}/input-proof`,
        operation: 'INPUT_PROOF',
        cause: InvalidPropertyError.missingProperty({
          objName: 'body.result',
          property: 'retryAfterSeconds',
          expectedType: 'Uint',
        }),
      }),
    );
  });

  it('xxx v2:input-proof: 202 - status:queued, result ok', async () => {
    post202({
      status: 'queued',
      result: { jobId: '123', retryAfterSeconds: 3 },
    });

    fetchMock.get(`${relayerUrlV2}/input-proof/123`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'hello',
        result: { accepted: false, extraData: `0x00` },
      },
      headers: { 'Content-Type': 'application/json' },
    });

    await relayerProvider.fetchPostInputProof(payload, undefined, {
      onProgress: (args) => {
        console.log('Hey! ' + args.type);
        console.log('Hey! ' + args.method);
      },
    });
  });
});
