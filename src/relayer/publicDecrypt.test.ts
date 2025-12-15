import { publicDecryptRequest } from './publicDecrypt';
import fetchMock from 'fetch-mock';
import { ethers } from 'ethers';
import {
  fetchRelayerJsonRpcPost,
  RelayerPublicDecryptPayload,
} from './fetchRelayer';
import { getErrorCause, getErrorCauseErrorMessage } from './error';
import { createRelayerProvider } from '../relayer-provider/createRelayerFhevm';
import { TEST_CONFIG } from '../test/config';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage ./src/relayer/publicDecrypt.test.ts --collectCoverageFrom=./src/relayer/publicDecrypt.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer/publicDecrypt.test.ts --collectCoverageFrom=./src/relayer/publicDecrypt.ts

const defaultRelayerVersion = 1;
const relayerProvider = createRelayerProvider(
  'https://test-fhevm-relayer',
  defaultRelayerVersion,
);
const RELAYER_PUBLIC_DECRYPT_URL = relayerProvider.publicDecrypt;

const dummyRelayerUserDecryptPayload: RelayerPublicDecryptPayload = {
  ciphertextHandles: ['0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'],
  extraData: '0x00',
};

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('publicDecrypt', () => {
  beforeEach(() => {
    fetchMock.removeRoutes();
  });

  it('relayerProvider', async () => {
    expect(relayerProvider.version).toStrictEqual(1);
    expect(relayerProvider.url).toStrictEqual('https://test-fhevm-relayer/v1');
    expect(RELAYER_PUBLIC_DECRYPT_URL).toStrictEqual(
      'https://test-fhevm-relayer/v1/public-decrypt',
    );
  });

  it('get public decryption for handle', async () => {
    fetchMock.post(RELAYER_PUBLIC_DECRYPT_URL, {
      status: 'success',
      response: {},
    });

    publicDecryptRequest(
      [],
      1,
      54321,
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      relayerProvider,
      new ethers.JsonRpcProvider('https://devnet.zama.ai'),
    );
  });
});

describeIfFetchMock('fetchRelayerPublicDecrypt', () => {
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

    fetchMock.postOnce(RELAYER_PUBLIC_DECRYPT_URL, response);

    try {
      await fetchRelayerJsonRpcPost(
        'PUBLIC_DECRYPT',
        RELAYER_PUBLIC_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        'Error: Public decrypt failed: relayer respond with HTTP code 403',
      );
      const cause = getErrorCause(e);

      const c = cause as any;
      expect(c).toEqual(
        expect.objectContaining({
          code: 'RELAYER_FETCH_ERROR',
          operation: 'PUBLIC_DECRYPT',
          status: 403,
          statusText: 'Forbidden',
          url: RELAYER_PUBLIC_DECRYPT_URL,
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

    fetchMock.postOnce(RELAYER_PUBLIC_DECRYPT_URL, response);

    try {
      await fetchRelayerJsonRpcPost(
        'PUBLIC_DECRYPT',
        RELAYER_PUBLIC_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        'Error: Relayer rate limit exceeded: Please wait and try again later.',
      );
      const cause = getErrorCause(e);

      const c = cause as any;
      expect(c).toEqual(
        expect.objectContaining({
          code: 'RELAYER_FETCH_ERROR',
          operation: 'PUBLIC_DECRYPT',
          status: 429,
          statusText: 'Rate Limit',
          url: RELAYER_PUBLIC_DECRYPT_URL,
          responseJson: '',
        }),
      );
      // For some reason, `expect.objectContaining` does not work in this specific situation.
      expect(c.response.status).toEqual(429);
      expect(c.response.statusText).toEqual('Rate Limit');
      expect(c.response.ok).toEqual(false);
      expect(c.response.url).toEqual(RELAYER_PUBLIC_DECRYPT_URL);
    }
  });

  it('error: fetch throws an error', async () => {
    const errorToThrow = new Error();
    fetchMock.post('https://test-fhevm-relayer/v1/public-decrypt', {
      throws: errorToThrow,
    });

    try {
      await fetchRelayerJsonRpcPost(
        'PUBLIC_DECRYPT',
        'https://test-fhevm-relayer/v1/public-decrypt',
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        "Error: Public decrypt failed: Relayer didn't respond",
      );
      const cause = getErrorCause(e);
      expect(cause).toEqual({
        code: 'RELAYER_UNKNOWN_ERROR',
        operation: 'PUBLIC_DECRYPT',
        error: errorToThrow,
      });
    }
  });

  it('error: no json', async () => {
    fetchMock.postOnce(RELAYER_PUBLIC_DECRYPT_URL, () => {
      return 'DeadBeef';
    });

    try {
      await fetchRelayerJsonRpcPost(
        'PUBLIC_DECRYPT',
        RELAYER_PUBLIC_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        "Error: Public decrypt failed: Relayer didn't return a JSON",
      );
      const cause = getErrorCause(e);
      const c = cause as any;

      expect(c.code).toEqual('RELAYER_NO_JSON_ERROR');
      expect(c.operation).toEqual('PUBLIC_DECRYPT');

      const msg = 'Unexpected token \'D\', "DeadBeef" is not valid JSON';

      expect(c.error.message).toEqual(msg);
      expect(String(getErrorCauseErrorMessage(e))).toBe(msg);
    }
  });

  it('error: unexpected json', async () => {
    fetchMock.postOnce(RELAYER_PUBLIC_DECRYPT_URL, {
      status: 'failure',
      dummy: 'This is a dummy error',
    });

    try {
      await fetchRelayerJsonRpcPost(
        'PUBLIC_DECRYPT',
        RELAYER_PUBLIC_DECRYPT_URL,
        dummyRelayerUserDecryptPayload,
      );
    } catch (e) {
      expect(String(e)).toBe(
        'Error: Public decrypt failed: Relayer returned an unexpected JSON response',
      );
      const cause = getErrorCause(e);

      const c = cause as any;

      expect(c.code).toEqual('RELAYER_UNEXPECTED_JSON_ERROR');
      expect(c.operation).toEqual('PUBLIC_DECRYPT');

      const msg =
        "Unexpected response JSON format: missing 'response' property.";

      expect(c.error.message).toEqual(msg);
      expect(String(getErrorCauseErrorMessage(e))).toBe(msg);
    }
  });

  it('succeeded', async () => {
    fetchMock.postOnce(RELAYER_PUBLIC_DECRYPT_URL, {
      response: {},
    });
    await fetchRelayerJsonRpcPost(
      'PUBLIC_DECRYPT',
      RELAYER_PUBLIC_DECRYPT_URL,
      dummyRelayerUserDecryptPayload,
    );
  });
});
