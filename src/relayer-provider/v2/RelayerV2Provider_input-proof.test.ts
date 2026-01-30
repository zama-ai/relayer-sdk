import { createRelayerProvider } from '../createRelayerProvider';
import type {
  RelayerInputProofOptionsType,
  RelayerInputProofProgressArgs,
} from '../types/public-api';
import { createInstance } from '../..';
import fetchMock from 'fetch-mock';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerV2Provider } from './RelayerV2Provider';
import {
  mockV2Post202,
  post202InvalidBodyError,
  RUNNING_REQ_STATE,
} from '../../test/v2/mockRoutes';
import { CoprocessorSignersVerifier } from '../../sdk/coprocessor/CoprocessorSignersVerifier';
import {
  DEADBEEF_INPUT_PROOF_PAYLOAD,
  removeAllFetchMockRoutes,
  setupAllFetchMockRoutes,
  TEST_CONFIG,
} from '../../test/config';
import { getProvider } from '../../config';
import { InputProof } from '../../sdk/coprocessor/InputProof';
import { RelayerV2ResponseInputProofRejectedError } from './errors/RelayerV2ResponseInputProofRejectedError';
import { assertIsBytes32Hex, assertIsBytes65Hex } from '../../base/bytes';
import { safeJSONstringify } from '../../base/string';
import type { FhevmInstanceConfig } from '../../types/relayer';
import type { EncryptionBits } from '../../base/types/primitives';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts
//
//
// Devnet:
// =======
//
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --testNamePattern=xxx
//
//
// Testnet:
// ========
//
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('../../test/config');
  return setupEthersJestMock();
});

////////////////////////////////////////////////////////////////////////////////

const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

const [itIfFetchMock, itIfFetch] =
  TEST_CONFIG.type === 'fetch-mock' ? [it, it.skip] : [it.skip, it];

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV2Provider', () => {
  let relayerProvider: RelayerV2Provider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    expect(TEST_CONFIG.type).toBe('fetch-mock');

    const p = createRelayerProvider(TEST_CONFIG.v2.urls.base, 1);
    if (!(p instanceof RelayerV2Provider)) {
      throw new Error(`Unable to create relayer provider`);
    }
    relayerProvider = p;
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(TEST_CONFIG.v2.urls.base);
    expect(relayerProvider.inputProofUrl).toBe(TEST_CONFIG.v2.urls.inputProof);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - malformed json', async () => {
    const malformedBodyJson = '{ "some_key": "incomplete_json"';

    let syntaxError;
    try {
      JSON.stringify(malformedBodyJson);
    } catch (e) {
      syntaxError = e as Error;
    }

    mockV2Post202('input-proof', malformedBodyJson);
    await expect(() =>
      relayerProvider.fetchPostInputProof(DEADBEEF_INPUT_PROOF_PAYLOAD),
    ).rejects.toThrow(syntaxError);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - empty json', async () => {
    const body = {};
    mockV2Post202('input-proof', body);
    await expect(() =>
      relayerProvider.fetchPostInputProof(DEADBEEF_INPUT_PROOF_PAYLOAD),
    ).rejects.toThrow(
      post202InvalidBodyError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
        }),
        bodyJson: JSON.stringify(body),
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - status:failed', async () => {
    const body = { status: 'failed' };
    mockV2Post202('input-proof', body);
    await expect(() =>
      relayerProvider.fetchPostInputProof(DEADBEEF_INPUT_PROOF_PAYLOAD),
    ).rejects.toThrow(
      post202InvalidBodyError({
        cause: new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'failed',
        }),
        bodyJson: JSON.stringify(body),
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - status:succeeded', async () => {
    const body = { status: 'succeeded' };
    mockV2Post202('input-proof', body);
    await expect(() =>
      relayerProvider.fetchPostInputProof(DEADBEEF_INPUT_PROOF_PAYLOAD),
    ).rejects.toThrow(
      post202InvalidBodyError({
        cause: new InvalidPropertyError({
          objName: 'body',
          property: 'status',
          expectedType: 'string',
          expectedValue: 'queued',
          type: 'string',
          value: 'succeeded',
        }),
        bodyJson: JSON.stringify(body),
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - status:queued', async () => {
    const bodyJson = { status: 'queued' };
    mockV2Post202('input-proof', bodyJson);
    await expect(() =>
      relayerProvider.fetchPostInputProof(DEADBEEF_INPUT_PROOF_PAYLOAD),
    ).rejects.toThrow(
      post202InvalidBodyError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'body',
          property: 'requestId',
          expectedType: 'string',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - status:queued, result empty', async () => {
    const bodyJson = { status: 'queued', requestId: 'hello', result: {} };
    mockV2Post202('input-proof', bodyJson);
    await expect(() =>
      relayerProvider.fetchPostInputProof(DEADBEEF_INPUT_PROOF_PAYLOAD),
    ).rejects.toThrow(
      post202InvalidBodyError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'body.result',
          property: 'jobId',
          expectedType: 'string',
        }),
        bodyJson: safeJSONstringify(bodyJson),
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - status:queued, rejected', async () => {
    const bodyJson = {
      status: 'queued',
      requestId: 'hello',
      result: { jobId: '123' },
    };
    mockV2Post202('input-proof', bodyJson);

    fetchMock.get(`${TEST_CONFIG.v2.urls.inputProof}/123`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'hello',
        result: { accepted: false, extraData: `0x00` },
      },
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(() =>
      relayerProvider.fetchPostInputProof(DEADBEEF_INPUT_PROOF_PAYLOAD),
    ).rejects.toThrow(
      new RelayerV2ResponseInputProofRejectedError({
        fetchMethod: 'GET',
        status: 200,
        url: `${TEST_CONFIG.v2.urls.inputProof}`,
        jobId: '123',
        operation: 'INPUT_PROOF',
        elapsed: 0,
        retryCount: 1,
        state: RUNNING_REQ_STATE,
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2:input-proof: 202 - status:queued, rejected', async () => {
    const bodyJson = {
      status: 'queued',
      requestId: 'hello',
      result: { jobId: '123' },
    };
    mockV2Post202('input-proof', bodyJson);

    const handle =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const sig =
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef00';
    assertIsBytes32Hex(handle);
    assertIsBytes65Hex(sig);

    fetchMock.get(`${TEST_CONFIG.v2.urls.inputProof}/123`, {
      status: 200,
      body: {
        status: 'succeeded',
        requestId: 'hello',
        result: {
          accepted: true,
          handles: [handle],
          signatures: [sig],
          extraData: `0x00`,
        },
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await relayerProvider.fetchPostInputProof(
      DEADBEEF_INPUT_PROOF_PAYLOAD,
      {
        onProgress: (args: RelayerInputProofProgressArgs) => {
          console.log('onProgress: ' + JSON.stringify(args));
        },
      } as RelayerInputProofOptionsType,
    );

    expect(res.handles.length).toBe(1);
    expect(res.handles[0]).toBe(handle);
    expect(res.signatures.length).toBe(1);
    expect(res.signatures[0]).toBe(sig);
  });
});

////////////////////////////////////////////////////////////////////////////////
// Test createEncryptedInput
////////////////////////////////////////////////////////////////////////////////

describe('createEncryptedInput', () => {
  beforeEach(() => {
    removeAllFetchMockRoutes();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  //////////////////////////////////////////////////////////////////////////////
  // prepareTest
  //////////////////////////////////////////////////////////////////////////////

  async function prepareTest(params: {
    config: FhevmInstanceConfig;
    test: {
      retry?: number;
    };
  }) {
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
      retry: params.test.retry,
    });

    const config = params.config;
    const provider = getProvider(config.network);
    const verifier = await CoprocessorSignersVerifier.fromProvider({
      provider,
      gatewayChainId: BigInt(config.gatewayChainId),
      inputVerifierContractAddress:
        config.inputVerifierContractAddress as `0x${string}`,
      verifyingContractAddressInputVerification:
        config.verifyingContractAddressInputVerification as `0x${string}`,
    });

    return verifier;
  }

  //////////////////////////////////////////////////////////////////////////////
  // testCreateInstance
  //////////////////////////////////////////////////////////////////////////////

  async function testCreateInstance(params: {
    config: FhevmInstanceConfig;
    test: {
      values: number[];
      bitWidths: EncryptionBits[];
      retry?: number;
    };
  }) {
    const verifier: CoprocessorSignersVerifier = await prepareTest(params);

    const config = params.config;
    const test = params.test;
    const numHandles = test.values.length;

    const instance = await createInstance(config);

    const builder = instance.createEncryptedInput(
      TEST_CONFIG.testContracts.FHETestAddress,
      TEST_CONFIG.signerAddress,
    );

    for (let i = 0; i < numHandles; ++i) {
      expect(test.bitWidths[i]).toBe(32);
      builder.add32(test.values[i]);
    }

    const enc = await builder.encrypt();

    expect(Array.isArray(enc.handles)).toBe(true);
    expect(enc.handles.length).toBe(numHandles);
    for (let i = 0; i < numHandles; ++i) {
      expect(enc.handles[i] instanceof Uint8Array).toBe(true);
      expect(enc.handles[i].length).toBe(test.bitWidths[i]);
    }

    expect(enc.inputProof instanceof Uint8Array).toBe(true);
    expect(enc.inputProof.length).toBeGreaterThanOrEqual(
      1 + 1 + numHandles * 32 + 65 * verifier.count,
    );

    const inputProof = InputProof.fromProofBytes(enc.inputProof);
    expect(inputProof.handles.length).toBe(numHandles);
    expect(inputProof.signatures.length).toBe(verifier.count);
  }

  //////////////////////////////////////////////////////////////////////////////

  it('v1: succeeded', async () => {
    await testCreateInstance({
      config: TEST_CONFIG.v1.fhevmInstanceConfig,
      test: {
        values: [123],
        bitWidths: [32],
      },
    });
  }, 600000);

  //////////////////////////////////////////////////////////////////////////////

  itIfFetch(
    'v2: succeeded',
    async () => {
      await testCreateInstance({
        config: TEST_CONFIG.v2.fhevmInstanceConfig,
        test: {
          values: [123],
          bitWidths: [32],
        },
      });
    },
    600000,
  );

  //////////////////////////////////////////////////////////////////////////////

  itIfFetchMock(
    'v2: succeeded no retry',
    async () => {
      await testCreateInstance({
        config: TEST_CONFIG.v2.fhevmInstanceConfig,
        test: {
          values: [123],
          bitWidths: [32],
          retry: 0,
        },
      });
    },
    600000,
  );

  //////////////////////////////////////////////////////////////////////////////

  itIfFetchMock(
    'v2: succeeded 1 retry',
    async () => {
      await testCreateInstance({
        config: TEST_CONFIG.v2.fhevmInstanceConfig,
        test: {
          values: [123],
          bitWidths: [32],
          retry: 1,
        },
      });
    },
    600000,
  );
});
