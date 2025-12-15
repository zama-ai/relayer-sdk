import { SepoliaConfig } from '../..';
import { getErrorCause } from '../../relayer/error';
import { createRelayerProvider } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import { RelayerV2GetKeyUrlInvalidResponseError } from './errors/RelayerV2GetKeyUrlError';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerV2Provider } from './RelayerV2Provider';
import { TEST_CONFIG } from '../../test/config';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_keyurl.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_keyurl.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_keyurl.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts

// curl https://relayer.testnet.zama.org/v2/keyurl
const relayerV2ResponseGetKeyUrl = {
  response: {
    fheKeyInfo: [
      {
        fhePublicKey: {
          dataId: 'fhe-public-key-data-id',
          urls: [
            'https://zama-mpc-testnet-public-efd88e2b.s3.eu-west-1.amazonaws.com/PUB-p1/PublicKey/0400000000000000000000000000000000000000000000000000000000000003',
          ],
        },
      },
    ],
    crs: {
      '2048': {
        dataId: 'crs-data-id',
        urls: [
          'https://zama-mpc-testnet-public-efd88e2b.s3.eu-west-1.amazonaws.com/PUB-p1/CRS/0500000000000000000000000000000000000000000000000000000000000004',
        ],
      },
    },
  },
};

const fetchGetKeyUrlReturn = {
  response: {
    fhe_key_info: [
      {
        fhe_public_key: {
          data_id: 'fhe-public-key-data-id',
          urls: [
            'https://zama-mpc-testnet-public-efd88e2b.s3.eu-west-1.amazonaws.com/PUB-p1/PublicKey/0400000000000000000000000000000000000000000000000000000000000003',
          ],
        },
      },
    ],
    crs: {
      '2048': {
        data_id: 'crs-data-id',
        urls: [
          'https://zama-mpc-testnet-public-efd88e2b.s3.eu-west-1.amazonaws.com/PUB-p1/CRS/0500000000000000000000000000000000000000000000000000000000000004',
        ],
      },
    },
  },
};

const relayerUrlV2 = `${SepoliaConfig.relayerUrl!}/v2`;

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('RelayerV2Provider', () => {
  let relayerProvider: RelayerV2Provider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    relayerProvider = createRelayerProvider(
      `${SepoliaConfigeRelayerUrl}/v2`,
    ) as RelayerV2Provider;
    expect(relayerProvider instanceof RelayerV2Provider).toBe(true);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v2`);
    expect(relayerProvider.keyUrl).toBe(
      `${SepoliaConfigeRelayerUrl}/v2/keyurl`,
    );
  });

  it('v2:keyurl: RelayerV2Provider', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

    const response = await relayerProvider.fetchGetKeyUrl();
    expect(response).toEqual(fetchGetKeyUrlReturn);
  });

  it("v2:keyurl: fetchGetKeyUrl - response = { hello: '123' }", async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { hello: '123' });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      'Relayer returned an unexpected JSON response',
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - response = 123 ', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, 123);

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      "Relayer didn't response correctly. Bad JSON.",
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - response = { response: undefined }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: undefined });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      'Relayer returned an unexpected JSON response',
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - response = { response: null }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: null });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      'Relayer returned an unexpected JSON response',
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - response = { response: {} }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: {} });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      new RelayerV2GetKeyUrlInvalidResponseError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'fetchGetKeyUrl().response',
          property: 'crs',
          expectedType: 'non-nullable',
        }),
      }),
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - response = { response: { crs: {} } }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: { crs: {} } });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      new RelayerV2GetKeyUrlInvalidResponseError({
        cause: InvalidPropertyError.missingProperty({
          objName: 'fetchGetKeyUrl().response',
          property: 'fheKeyInfo',
          expectedType: 'Array',
        }),
      }),
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - response = { response: { crs: {}, fheKeyInfo: {} } }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, {
      response: { crs: {}, fheKeyInfo: {} },
    });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      new RelayerV2GetKeyUrlInvalidResponseError({
        cause: new InvalidPropertyError({
          objName: 'fetchGetKeyUrl().response',
          property: 'fheKeyInfo',
          expectedType: 'Array',
          type: 'object',
        }),
      }),
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - 404', async () => {
    fetchMock.getOnce(`${relayerUrlV2}/keyurl`, { status: 404 });
    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      'HTTP error! status: 404',
    );
  });

  it('v2:keyurl: fetchGetKeyUrl - 404 - cause', async () => {
    fetchMock.getOnce(`${relayerUrlV2}/keyurl`, { status: 404 });

    try {
      await relayerProvider.fetchGetKeyUrl();
      fail('Expected fetchGetKeyUrl to throw an error, but it did not.');
    } catch (e) {
      expect(String(e)).toStrictEqual('Error: HTTP error! status: 404');
      const cause = getErrorCause(e) as any;
      expect(cause.code).toStrictEqual('RELAYER_FETCH_ERROR');
      expect(cause.operation).toStrictEqual('KEY_URL');
      expect(cause.status).toStrictEqual(404);
      expect(cause.statusText).toStrictEqual('Not Found');
      expect(cause.url).toStrictEqual(relayerProvider.keyUrl);
    }
  });

  it('v2:keyurl: fetchGetKeyUrl - 404+headers - cause', async () => {
    const bodyObj = {
      message: 'no Route matched with those values',
      requestId: 'e4d9e74d3cf53270ecdee649b55d1666',
    };
    const body = JSON.stringify(bodyObj, null, 2);
    fetchMock.getOnce(`${relayerUrlV2}/keyurl`, {
      status: 404,
      headers: {
        date: 'Sun, 23 Nov 2025 05:38:07 GMT',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '103',
        'x-kong-response-latency': '0',
        server: 'cloudflare',
        'x-kong-request-id': 'b15b96748385cb3a3346c86cee85032b',
        'cf-cache-status': 'DYNAMIC',
        'cf-ray': '9a2e518d8aa5647a-CDG',
      },
      body,
    });

    try {
      await relayerProvider.fetchGetKeyUrl();
      fail('Expected fetchGetKeyUrl to throw an error, but it did not.');
    } catch (e) {
      // Error message
      expect(String(e)).toStrictEqual('Error: HTTP error! status: 404');

      // Error cause
      const cause = getErrorCause(e) as any;
      expect(cause.code).toStrictEqual('RELAYER_FETCH_ERROR');
      expect(cause.operation).toStrictEqual('KEY_URL');
      expect(cause.status).toStrictEqual(404);
      expect(cause.statusText).toStrictEqual('Not Found');
      expect(cause.url).toStrictEqual(relayerProvider.keyUrl);
      expect(JSON.stringify(cause.responseJson)).toEqual(
        JSON.stringify(bodyObj),
      );
    }
  });
});
