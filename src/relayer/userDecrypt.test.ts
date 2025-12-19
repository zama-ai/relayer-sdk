import { userDecryptRequest } from './userDecrypt';
import fetchMock from 'fetch-mock';
import { ethers } from 'ethers';
import { getErrorCause, getErrorCauseErrorMessage } from './error';
import { createRelayerProvider } from '../relayer-provider/createRelayerFhevm';
import { TEST_CONFIG } from '../test/config';
import { RelayerUserDecryptPayload } from '../types/relayer';
import { fetchRelayerV1Post } from '../relayer-provider/v1/fetchRelayerV1';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage ./src/relayer/userDecrypt.test.ts --collectCoverageFrom=./src/relayer/userDecrypt.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer/userDecrypt.test.ts --collectCoverageFrom=./src/relayer/userDecrypt.ts

const defaultRelayerVersion = 1;
const relayerProvider = createRelayerProvider(
  'https://test-fhevm-relayer',
  defaultRelayerVersion,
);
const RELAYER_USER_DECRYPT_URL = relayerProvider.userDecrypt;

const dummyRelayerUserDecryptPayload: RelayerUserDecryptPayload = {
  handleContractPairs: [
    {
      handle:
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      contractAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    },
  ],
  requestValidity: {
    startTimestamp: '1234',
    durationDays: '7',
  },
  contractsChainId: '31337',
  contractAddresses: ['0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'],
  userAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  signature: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  publicKey: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  extraData: '0x00',
};

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('userDecrypt', () => {
  beforeEach(() => {
    fetchMock.removeRoutes();
  });

  it('get user decryption for handle', async () => {
    fetchMock.post(RELAYER_USER_DECRYPT_URL, {
      status: 'success',
    });

    userDecryptRequest(
      [],
      54321,
      9000,
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      relayerProvider,
      new ethers.JsonRpcProvider('https://devnet.zama.ai'),
    );
  });
});

describeIfFetchMock('fetchRelayerUserDecrypt', () => {
  beforeEach(() => {
    fetchMock.removeRoutes();
  });

  it('error: response.ok === false', async () => {
    const response = new Response('Forbidden', {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    fetchMock.postOnce(RELAYER_USER_DECRYPT_URL, response);

    try {
      await fetchRelayerV1Post(
        'USER_DECRYPT',
        RELAYER_USER_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        'Error: User decrypt failed: relayer respond with HTTP code 403',
      );
      const cause = getErrorCause(e);
      expect(cause).not.toBe(null);
      expect(typeof cause).toBe('object');

      const c = cause as any;
      expect(c).toEqual(
        expect.objectContaining({
          code: 'RELAYER_FETCH_ERROR',
          operation: 'USER_DECRYPT',
          status: 403,
          statusText: 'Forbidden',
          url: RELAYER_USER_DECRYPT_URL,
          responseJson: '',
        }),
      );
      expect(c.response).toEqual(
        expect.objectContaining({
          status: 403,
          statusText: 'Forbidden',
          ok: false,
        }),
      );
    }
  });

  it('error: response.status === 429', async () => {
    const response = new Response('Rate Limit', {
      status: 429,
      statusText: 'Rate Limit',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    expect(RELAYER_USER_DECRYPT_URL).toBe(
      'https://test-fhevm-relayer/v1/user-decrypt',
    );

    fetchMock.postOnce(RELAYER_USER_DECRYPT_URL, response);

    try {
      await fetchRelayerV1Post(
        'USER_DECRYPT',
        RELAYER_USER_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        'Error: Relayer rate limit exceeded: Please wait and try again later.',
      );
      const cause = getErrorCause(e);
      expect(cause).not.toBe(null);
      expect(typeof cause).toBe('object');

      const c = cause as any;
      expect(c).toEqual(
        expect.objectContaining({
          code: 'RELAYER_FETCH_ERROR',
          operation: 'USER_DECRYPT',
          status: 429,
          statusText: 'Rate Limit',
          url: RELAYER_USER_DECRYPT_URL,
          responseJson: '',
        }),
      );
      expect(c.response).toEqual(
        expect.objectContaining({
          status: 429,
          statusText: 'Rate Limit',
          ok: false,
        }),
      );
    }
  });

  it('error: fetch throws an error', async () => {
    const errorToThrow = new Error();
    fetchMock.post(RELAYER_USER_DECRYPT_URL, {
      throws: errorToThrow,
    });

    try {
      await fetchRelayerV1Post(
        'USER_DECRYPT',
        RELAYER_USER_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        "Error: User decrypt failed: Relayer didn't respond",
      );

      const cause = getErrorCause(e);
      expect(cause).not.toBe(null);
      expect(typeof cause).toBe('object');

      expect(cause).toEqual({
        code: 'RELAYER_UNKNOWN_ERROR',
        operation: 'USER_DECRYPT',
        error: errorToThrow,
      });
    }
  });

  it('error: no json', async () => {
    fetchMock.postOnce(RELAYER_USER_DECRYPT_URL, () => {
      return 'DeadBeef';
    });

    try {
      await fetchRelayerV1Post(
        'USER_DECRYPT',
        RELAYER_USER_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        "Error: User decrypt failed: Relayer didn't return a JSON",
      );
      const cause = getErrorCause(e);
      expect(cause).not.toBe(null);
      expect(typeof cause).toBe('object');

      const c = cause as any;
      expect(c).toEqual(
        expect.objectContaining({
          code: 'RELAYER_NO_JSON_ERROR',
          operation: 'USER_DECRYPT',
          error: new Error(),
        }),
      );
      expect(String(getErrorCauseErrorMessage(e))).toBe(
        'Unexpected token \'D\', "DeadBeef" is not valid JSON',
      );
    }
  });

  it('error: unexpected json', async () => {
    fetchMock.postOnce(RELAYER_USER_DECRYPT_URL, {
      status: 'failure',
      dummy: 'This is a dummy error',
    });

    try {
      await fetchRelayerV1Post(
        'USER_DECRYPT',
        RELAYER_USER_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        'Error: User decrypt failed: Relayer returned an unexpected JSON response',
      );
      const cause = getErrorCause(e);
      expect(cause).not.toBe(null);
      expect(typeof cause).toBe('object');

      expect(cause).toEqual({
        code: 'RELAYER_UNEXPECTED_JSON_ERROR',
        operation: 'USER_DECRYPT',
        error: new Error(
          "Unexpected response JSON format: missing 'response' property.",
        ),
      });
    }
  });

  it('succeeded', async () => {
    fetchMock.postOnce(RELAYER_USER_DECRYPT_URL, {
      response: {},
    });
    await fetchRelayerV1Post(
      'USER_DECRYPT',
      RELAYER_USER_DECRYPT_URL,
      dummyRelayerUserDecryptPayload,
    );
  });
});
