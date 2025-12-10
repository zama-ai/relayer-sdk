import type { FhevmInstanceConfig } from '../../config';
import { createRelayerProvider } from '../createRelayerFhevm';
import { uintToHex } from '../../utils/uint';
import { RelayerV2Provider } from './RelayerV2Provider';

// Jest Command line
// =================
// npx jest --config jest.local.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test-local.ts --testNamePattern=xxx
// npx jest --config jest.local.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test-local.ts

// curl http://localhost:8545 -X POST -H "Content-Type: application/json" --data '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}'

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SepoliaConfigLocal: FhevmInstanceConfig = (global as any)
  .TEST_FHEVM_CONFIG;
// const SepoliaConfigLocalV1: FhevmInstanceConfig = {
//   ...SepoliaConfigLocal,
//   relayerUrl: SepoliaConfigLocal.relayerUrl + '/v1',
// };
const SepoliaConfigLocalV2: FhevmInstanceConfig = {
  ...SepoliaConfigLocal,
  relayerUrl: SepoliaConfigLocal.relayerUrl + '/v2',
};

const relayerUrlV2 = `${SepoliaConfigLocalV2.relayerUrl!}`;

// const contractAddress = '0x8ba1f109551bd432803012645ac136ddd64dba72';
// const userAddress = '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80';
// const ciphertextWithInputVerification = '0xdeadbeef';
// const contractChainId: `0x${string}` = ('0x' +
//   Number(31337).toString(16)) as `0x${string}`;
// const payload: RelayerInputProofPayload = {
//   contractAddress,
//   userAddress,
//   ciphertextWithInputVerification,
//   contractChainId,
//   extraData: '0x00',
// };

const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

describe('RelayerV2Provider', () => {
  let relayerProvider: RelayerV2Provider;

  beforeEach(() => {
    relayerProvider = createRelayerProvider(relayerUrlV2);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(relayerUrlV2);
    expect(relayerProvider.inputProof).toBe(`${relayerUrlV2}/input-proof`);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('xxx v2:input-proof:local: ok', async () => {
    try {
      /* const res = */ await relayerProvider.fetchPostInputProof(
        {
          userAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
          contractAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
          contractChainId: uintToHex(SepoliaConfigLocalV2.chainId!),
          ciphertextWithInputVerification: 'dead',
          extraData: '0x00',
        },
        undefined,
        {
          onProgress: (args) => {
            console.log(
              `type:${args.type} status:${args.status} message:${args.method}`,
            );
          },
        },
      );
    } catch (e) {
      console.log(e);
    }
    await sleep(1000);
  });

  // it('v2:input-proof: 202 - empty json', async () => {
  //   post202({});
  //   await expect(() =>
  //     relayerProvider.fetchPostInputProof(payload),
  //   ).rejects.toThrow(
  //     new RelayerV2InvalidPostResponseError({
  //       status: 202,
  //       url: `${relayerUrlV2}/input-proof`,
  //       operation: 'INPUT_PROOF',
  //       cause: InvalidPropertyError.missingProperty({
  //         objName: 'body',
  //         property: 'status',
  //         expectedType: 'string',
  //         expectedValue: 'queued',
  //       }),
  //     }),
  //   );
  // });

  // it('v2:input-proof: 202 - status:failed', async () => {
  //   post202({ status: 'failed' });
  //   await expect(() =>
  //     relayerProvider.fetchPostInputProof(payload),
  //   ).rejects.toThrow(
  //     new RelayerV2InvalidPostResponseError({
  //       status: 202,
  //       url: `${relayerUrlV2}/input-proof`,
  //       operation: 'INPUT_PROOF',
  //       cause: new InvalidPropertyError({
  //         objName: 'body',
  //         property: 'status',
  //         expectedType: 'string',
  //         expectedValue: 'queued',
  //         type: 'string',
  //         value: 'failed',
  //       }),
  //     }),
  //   );
  // });

  // it('v2:input-proof: 202 - status:succeeded', async () => {
  //   post202({ status: 'succeeded' });
  //   await expect(() =>
  //     relayerProvider.fetchPostInputProof(payload),
  //   ).rejects.toThrow(
  //     new RelayerV2InvalidPostResponseError({
  //       status: 202,
  //       url: `${relayerUrlV2}/input-proof`,
  //       operation: 'INPUT_PROOF',
  //       cause: new InvalidPropertyError({
  //         objName: 'body',
  //         property: 'status',
  //         expectedType: 'string',
  //         expectedValue: 'queued',
  //         type: 'string',
  //         value: 'succeeded',
  //       }),
  //     }),
  //   );
  // });

  // it('v2:input-proof: 202 - status:queued', async () => {
  //   post202({ status: 'queued' });
  //   await expect(() =>
  //     relayerProvider.fetchPostInputProof(payload),
  //   ).rejects.toThrow(
  //     new RelayerV2InvalidPostResponseError({
  //       status: 202,
  //       url: `${relayerUrlV2}/input-proof`,
  //       operation: 'INPUT_PROOF',
  //       cause: InvalidPropertyError.missingProperty({
  //         objName: 'body',
  //         property: 'result',
  //         expectedType: 'non-nullable',
  //       }),
  //     }),
  //   );
  // });

  // it('v2:input-proof: 202 - status:queued, result empty', async () => {
  //   post202({ status: 'queued', result: {} });
  //   await expect(() =>
  //     relayerProvider.fetchPostInputProof(payload),
  //   ).rejects.toThrow(
  //     new RelayerV2InvalidPostResponseError({
  //       status: 202,
  //       url: `${relayerUrlV2}/input-proof`,
  //       operation: 'INPUT_PROOF',
  //       cause: InvalidPropertyError.missingProperty({
  //         objName: 'body.result',
  //         property: 'job_id',
  //         expectedType: 'string',
  //       }),
  //     }),
  //   );
  // });

  // it('v2:input-proof: 202 - status:queued, result no timestamp', async () => {
  //   post202({ status: 'queued', result: { job_id: '123' } });
  //   await expect(() =>
  //     relayerProvider.fetchPostInputProof(payload),
  //   ).rejects.toThrow(
  //     new RelayerV2InvalidPostResponseError({
  //       status: 202,
  //       url: `${relayerUrlV2}/input-proof`,
  //       operation: 'INPUT_PROOF',
  //       cause: InvalidPropertyError.missingProperty({
  //         objName: 'body.result',
  //         property: 'retry_after_seconds',
  //         expectedType: 'Uint',
  //       }),
  //     }),
  //   );
  // });

  // it('v2:input-proof: 202 - status:queued, result ok', async () => {
  //   post202({
  //     status: 'queued',
  //     result: { job_id: '123', retry_after_seconds: 3 },
  //   });

  //   fetchMock.get(`${relayerUrlV2}/input-proof/123`, {
  //     status: 200,
  //     body: {
  //       status: 'succeeded',
  //       request_id: 'hello',
  //       result: { accepted: false, extra_data: `0x00` },
  //     },
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  //   await relayerProvider.fetchPostInputProof(payload);
  // });
});
