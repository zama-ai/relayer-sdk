import fetchMock from 'fetch-mock';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';
import { SepoliaConfig } from '../..';
import { RelayerInputProofPayload } from '../../relayer/fetchRelayer';
import { RelayerV2ApiError500, RelayerV2ResponseFailed } from './types/types';

// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2AsyncRequest.test.ts --testNamePattern=BBB

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

describe('RelayerV2Request', () => {
  let relayerRequest: RelayerV2AsyncRequest;

  beforeEach(() => {
    fetchMock.removeRoutes();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2: BBB long post + cancel', async () => {
    const error: RelayerV2ApiError500 = {
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
        delay: 20000,
      },
    );

    relayerRequest = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: requestUrl,
      payload,
      onProgress: () => {
        console.log('[🚚 Jest] onProgress()');
      },
    });

    console.log('[🚚 Jest] relayerRequest.run() enter...');
    const p = relayerRequest.run();
    console.log('[🚚 Jest] relayerRequest.run() done.');

    let runThen = false;
    let runCatch = false;
    let runCatchReason = undefined;
    console.log('[🚚 Jest] p.then().catch() enter...');
    p.then(() => {
      console.log('[🚚 Jest]   -> in p.then()');
      runThen = true;
    }).catch((reason) => {
      console.log('[🚚 Jest]   -> in p.catch()');
      runCatch = true;
      runCatchReason = reason;
    });
    console.log('[🚚 Jest] p.then().catch() done.');

    await sleep(500);

    expect(runCatchReason).toBe(undefined);
    expect(runCatch).toBe(false);
    expect(runThen).toBe(false);

    console.log('[🚚 Jest] relayerRequest.cancel() enter...');
    relayerRequest.cancel();
    console.log('[🚚 Jest] relayerRequest.cancel() done.');

    expect(relayerRequest.fetching).toBe(true);
    expect(relayerRequest.canceled).toBe(true);
    expect(relayerRequest.terminated).toBe(true);

    console.log('[🚚 Jest] wait for end of test...');
    while (!(runCatch || runThen)) {
      await sleep(200);
    }

    expect(fetchCount).toBe(0);
    expect(runCatch).toBe(true);
    expect(runThen).toBe(false);
    expect((runCatchReason as any).name).toBe('AbortError');

    console.log('[🚚 Jest] test ended.');
  });
});
