import type {
  RelayerApiError429Type,
  RelayerInputProofPayload,
  RelayerInputProofProgressArgs,
  RelayerProgressThrottledType,
} from '../types/public-api';
import type { RelayerV2ResponseFailed } from './types';
import fetchMock from 'fetch-mock';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';
import { SepoliaConfig } from '../..';
import { TEST_CONFIG } from '../../test/config';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2AsyncRequest.protocol_overload.test.ts

const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
const requestUrl = `${SepoliaConfigRelayerUrl}/v2/input-proof`;
const contractAddress = '0x8ba1f109551bd432803012645ac136ddd64dba72';
const userAddress = '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80';
const ciphertextWithInputVerification = '0xdeadbeef';
const contractChainId: `0x${string}` = ('0x' +
  (31337).toString(16)) as `0x${string}`;
const payload: RelayerInputProofPayload = {
  contractAddress,
  userAddress,
  ciphertextWithInputVerification,
  contractChainId,
  extraData: '0x00',
};

////////////////////////////////////////////////////////////////////////////////
// Shared Test Constants
////////////////////////////////////////////////////////////////////////////////

const TEST_HANDLE =
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

const PROTOCOL_OVERLOAD_ERROR: RelayerApiError429Type = {
  label: 'protocol_overload',
  message: 'Protocol is overloaded',
};

const PROTOCOL_OVERLOAD_BODY: RelayerV2ResponseFailed = {
  status: 'failed',
  error: PROTOCOL_OVERLOAD_ERROR,
};

const JOB_ID = 'job-overload-456';

function makeQueuedBody(jobId: string, requestId: string) {
  return {
    status: 'queued',
    requestId,
    result: { jobId },
  };
}

function makeSuccessBody(requestId: string) {
  return {
    status: 'succeeded',
    requestId,
    result: {
      accepted: true,
      handles: [TEST_HANDLE],
      signatures: ['0xabcdef'],
      extraData: '0x00',
    },
  };
}

jest.setTimeout(30000);
const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

////////////////////////////////////////////////////////////////////////////////
// Protocol Overload Tests
////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV2AsyncRequest - Protocol Overload (429)', () => {
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

  //////////////////////////////////////////////////////////////////////////////

  it('v2: protocol_overload error triggers onProgress with throttled type', async () => {
    const progressEvents: RelayerProgressThrottledType<'INPUT_PROOF'>[] = [];
    let postFetchCount = 0;

    // POST: First call returns 429, second call returns 202 (queued)
    fetchMock.post(requestUrl, () => {
      postFetchCount++;
      if (postFetchCount === 1) {
        return {
          status: 429,
          headers: { 'Retry-After': '1' },
          body: PROTOCOL_OVERLOAD_BODY,
        };
      }
      return {
        status: 202,
        headers: { 'Retry-After': '1' },
        body: makeQueuedBody(JOB_ID, 'req-queued-456'),
      };
    });

    // GET: Returns success
    fetchMock.get(`${requestUrl}/${JOB_ID}`, {
      status: 200,
      body: makeSuccessBody('req-456'),
    });

    relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      options: {
        onProgress: (args: RelayerInputProofProgressArgs) => {
          trace(`onProgress: type=${args.type}`);
          if (args.type === 'throttled') {
            progressEvents.push(args);
          }
        },
      },
    });

    trace('relayerRequest.run() enter...');
    const result = await relayerRequest.run();
    trace('relayerRequest.run() done.');

    // Verify protocol overload progress event was fired
    expect(progressEvents.length).toBe(1);
    expect(progressEvents[0].type).toBe('throttled');
    expect(progressEvents[0].status).toBe(429);
    expect(progressEvents[0].relayerApiError.label).toBe('protocol_overload');
    expect(progressEvents[0].relayerApiError.message).toBe(
      'Protocol is overloaded',
    );

    // Verify retry happened and succeeded
    expect(postFetchCount).toBe(2);
    expect(result).toBeDefined();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: multiple consecutive protocol_overload errors are retried', async () => {
    let postFetchCount = 0;
    let throttledCount = 0;

    // POST: First 3 calls return 429, fourth returns 202 (queued)
    fetchMock.post(requestUrl, () => {
      postFetchCount++;
      if (postFetchCount <= 3) {
        return {
          status: 429,
          headers: { 'Retry-After': '1' },
          body: PROTOCOL_OVERLOAD_BODY,
        };
      }
      return {
        status: 202,
        headers: { 'Retry-After': '1' },
        body: makeQueuedBody(JOB_ID, 'req-queued-789'),
      };
    });

    // GET: Returns success
    fetchMock.get(`${requestUrl}/${JOB_ID}`, {
      status: 200,
      body: makeSuccessBody('req-789'),
    });

    relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      options: {
        onProgress: (args: RelayerInputProofProgressArgs) => {
          trace(`onProgress: type=${args.type}`);
          if (args.type === 'throttled') {
            throttledCount++;
          }
        },
      },
    });

    trace('relayerRequest.run() enter...');
    const result = await relayerRequest.run();
    trace('relayerRequest.run() done.');

    // Verify all 429 responses triggered throttled events
    expect(throttledCount).toBe(3);
    expect(postFetchCount).toBe(4);
    expect(result).toBeDefined();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: protocol_overload error respects Retry-After header', async () => {
    let postFetchCount = 0;
    let retryAfterMs: number | undefined;

    // POST: First call returns 429, second call returns 202 (queued)
    fetchMock.post(requestUrl, () => {
      postFetchCount++;
      if (postFetchCount === 1) {
        return {
          status: 429,
          headers: { 'Retry-After': '2' },
          body: PROTOCOL_OVERLOAD_BODY,
        };
      }
      return {
        status: 202,
        headers: { 'Retry-After': '1' },
        body: makeQueuedBody(JOB_ID, 'req-queued-retry-after'),
      };
    });

    // GET: Returns success
    fetchMock.get(`${requestUrl}/${JOB_ID}`, {
      status: 200,
      body: makeSuccessBody('req-retry-after'),
    });

    relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      options: {
        onProgress: (args: RelayerInputProofProgressArgs) => {
          trace(`onProgress: type=${args.type}`);
          if (args.type === 'throttled') {
            retryAfterMs = args.retryAfterMs;
          }
        },
      },
    });

    const startTime = Date.now();
    trace('relayerRequest.run() enter...');
    const result = await relayerRequest.run();
    trace('relayerRequest.run() done.');
    const elapsed = Date.now() - startTime;

    // Verify Retry-After was parsed correctly (2 seconds = 2000ms)
    expect(retryAfterMs).toBe(2000);

    // Verify we waited at least the retry-after time (with some tolerance)
    expect(elapsed).toBeGreaterThanOrEqual(1900);

    expect(postFetchCount).toBe(2);
    expect(result).toBeDefined();
  });
});
