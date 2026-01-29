import type {
  Auth,
  RelayerApiError500Type,
  RelayerInputProofPayload,
} from '../types/public-api';
import type { RelayerV2ResponseFailed } from './types';
import fetchMock from 'fetch-mock';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';
import { SepoliaConfig } from '../../configs';
import { TEST_CONFIG } from '../../test/config';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2AsyncRequest.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2AsyncRequest.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2AsyncRequest.test.ts --testNamePattern=xxx --detectOpenHandles
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2AsyncRequest.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2AsyncRequest.ts

const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
const requestUrl = `${SepoliaConfigeRelayerUrl}/v2/input-proof`;
//https://relayer.testnet.zama.org/v2/input-proof
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

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

jest.setTimeout(300000);
const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('RelayerV2Request', () => {
  let relayerRequest: RelayerV2AsyncRequest;
  let start: number;

  function trace(message: string) {
    console.log(`[🚚 Jest - ${Date.now() - start}ms] ${message}`);
  }

  beforeEach(() => {
    fetchMock.removeRoutes();
    start = Date.now();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2: cancel before run', async () => {
    relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      options: {
        onProgress: () => {
          trace('onProgress()');
        },
      },
    });

    relayerRequest.cancel();

    trace(`relayerRequest.run() enter...`);
    await expect(() => relayerRequest.run()).rejects.toThrow(
      'Relayer.run() failed. Request already terminated.',
    );
    trace(`relayerRequest.run() done.`);
  });

  it('v2: cancel before first fetch completed', async () => {
    const error: RelayerApiError500Type = {
      label: 'internal_server_error',
      message: 'foo',
    };
    const body: RelayerV2ResponseFailed = {
      status: 'failed',
      error,
    };

    let fetchCount = 0;
    fetchMock.post(
      requestUrl,
      () => {
        fetchCount++;
        return {
          status: 500,
          body,
        };
      },
      {
        // User must wait 2s before receiving fetch reply
        delay: 2000,
      },
    );

    relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      options: {
        onProgress: () => {
          trace('onProgress()');
        },
      },
    });

    trace(`relayerRequest.run() enter...`);
    expect(relayerRequest.running).toBe(false);
    const p = relayerRequest.run();
    expect(relayerRequest.running).toBe(true);
    trace(`relayerRequest.run() done.`);

    let runThen = false;
    let runCatch = false;
    let runCatchReason = undefined;
    trace('p.then().catch() enter...');
    p.then(() => {
      trace('   -> in p.then()');
      runThen = true;
    }).catch((reason) => {
      trace('   -> in p.catch()');
      runCatch = true;
      runCatchReason = reason;
    });
    trace('p.then().catch() done.');

    await sleep(500);

    expect(runCatchReason).toBe(undefined);
    expect(runCatch).toBe(false);
    expect(runThen).toBe(false);

    trace('relayerRequest.cancel() enter...');
    relayerRequest.cancel();
    trace('relayerRequest.cancel() done.');

    expect(relayerRequest.state).toEqual({
      aborted: true,
      canceled: true,
      failed: false,
      fetching: true,
      running: true,
      succeeded: false,
      terminated: true,
      timeout: false,
    });

    trace(`wait for end of test...`);
    while (!(runCatch || runThen)) {
      await sleep(200);
    }

    expect(fetchCount).toBe(0);
    expect(runCatch).toBe(true);
    expect(runThen).toBe(false);
    expect((runCatchReason as any).name).toBe('AbortError');

    expect(relayerRequest.state).toEqual({
      aborted: true,
      canceled: true,
      failed: true,
      fetching: false,
      running: true,
      succeeded: false,
      terminated: true,
      timeout: false,
    });

    trace('test ended.');

    await fetchMock.callHistory.flush(true);

    // Important node!
    // ===============
    // Wait for fetchMock delay to expire.
    // Otherwise, jest will detect an unreleased timer handle coming
    // from fetch-mock (the timer used internaly to simulate fetch delay)
    await sleep(2000);
  });
});

////////////////////////////////////////////////////////////////////////////////
// Auth on GET requests Tests
////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV2AsyncRequest - Auth on GET requests', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
    fetchMock.callHistory.clear();
  });

  afterAll(async () => {
    await fetchMock.callHistory.flush(true);
  });

  it('v2: GET request includes BearerToken auth header', async () => {
    const jobId = 'test-job-123';

    // Mock POST (initial request)
    fetchMock.post(requestUrl, {
      status: 202,
      headers: { 'Retry-After': '1' },
      body: {
        status: 'queued',
        requestId: 'req-123',
        result: { jobId },
      },
    });

    // Mock GET (polling request)
    fetchMock.get(`${requestUrl}/${jobId}`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'req-123',
        result: {
          accepted: true,
          handles: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
          signatures: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef00',
          ],
          extraData: '0x00',
        },
      },
    });

    const auth: Auth = {
      __type: 'BearerToken',
      token: 'test-bearer-token',
    };

    const relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      options: { auth },
    });

    await relayerRequest.run();

    // Get all calls and check headers
    const calls = fetchMock.callHistory.calls();
    expect(calls.length).toBeGreaterThanOrEqual(2);

    // Check POST request has auth
    // Note: fetch-mock normalizes header keys and method to lowercase
    const postCall = calls.find((c) => c.options.method === 'post');
    expect(postCall).toBeDefined();
    const postHeaders = postCall!.options.headers as Record<string, string>;
    expect(postHeaders['authorization']).toBe('Bearer test-bearer-token');

    // Check GET request has auth
    const getCall = calls.find((c) => c.options.method === 'get');
    expect(getCall).toBeDefined();
    const getHeaders = getCall!.options.headers as Record<string, string>;
    expect(getHeaders['authorization']).toBe('Bearer test-bearer-token');
  });

  it('v2: GET request includes ApiKeyHeader auth header', async () => {
    const jobId = 'test-job-456';

    // Mock POST (initial request)
    fetchMock.post(requestUrl, {
      status: 202,
      headers: { 'Retry-After': '1' },
      body: {
        status: 'queued',
        requestId: 'req-123',
        result: { jobId },
      },
    });

    // Mock GET (polling request)
    fetchMock.get(`${requestUrl}/${jobId}`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'req-123',
        result: {
          accepted: true,
          handles: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
          signatures: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef00',
          ],
          extraData: '0x00',
        },
      },
    });

    const auth: Auth = {
      __type: 'ApiKeyHeader',
      header: 'x-custom-api-key',
      value: 'my-secret-key',
    };

    const relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      options: { auth },
    });

    await relayerRequest.run();

    // Check GET request has auth
    // Note: fetch-mock normalizes header keys and method to lowercase
    const calls = fetchMock.callHistory.calls();
    const getCall = calls.find((c) => c.options.method === 'get');
    expect(getCall).toBeDefined();
    const getHeaders = getCall!.options.headers as Record<string, string>;
    expect(getHeaders['x-custom-api-key']).toBe('my-secret-key');
  });

  it('v2: GET request without auth has no Authorization header', async () => {
    const jobId = 'test-job-789';

    // Mock POST (initial request)
    fetchMock.post(requestUrl, {
      status: 202,
      headers: { 'Retry-After': '1' },
      body: {
        status: 'queued',
        requestId: 'req-123',
        result: { jobId },
      },
    });

    // Mock GET (polling request)
    fetchMock.get(`${requestUrl}/${jobId}`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'req-123',
        result: {
          accepted: true,
          handles: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
          signatures: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef00',
          ],
          extraData: '0x00',
        },
      },
    });

    const relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
    });

    await relayerRequest.run();

    // Check GET request has no auth
    // Note: fetch-mock normalizes header keys and method to lowercase
    const calls = fetchMock.callHistory.calls();
    const getCall = calls.find((c) => c.options.method === 'get');
    expect(getCall).toBeDefined();
    const getHeaders = getCall!.options.headers as Record<string, string>;
    expect(getHeaders['authorization']).toBeUndefined();
    expect(getHeaders['x-api-key']).toBeUndefined();
  });
});
