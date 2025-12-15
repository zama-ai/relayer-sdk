import fetchMock from 'fetch-mock';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';
import { SepoliaConfig } from '../..';
import { RelayerInputProofPayload } from '../../relayer/fetchRelayer';
import {
  RelayerV2ResponseApiError500,
  RelayerV2ResponseFailed,
} from './types/types';
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
      onProgress: () => {
        trace('onProgress()');
      },
    });

    relayerRequest.cancel();

    trace(`relayerRequest.run() enter...`);
    await expect(() => relayerRequest.run()).rejects.toThrow(
      'Relayer request already terminated',
    );
    trace(`relayerRequest.run() done.`);
  });

  it('v2: cancel before first fetch completed', async () => {
    const error: RelayerV2ResponseApiError500 = {
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
      onProgress: () => {
        trace('onProgress()');
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
      running: true,
      canceled: true,
      terminated: true,
      succeeded: false,
      aborted: true,
      failed: false,
      fetching: true,
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
      running: true,
      canceled: true,
      terminated: true,
      succeeded: false,
      aborted: true,
      failed: true,
      fetching: false,
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
