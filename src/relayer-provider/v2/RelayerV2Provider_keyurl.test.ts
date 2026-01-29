import { SepoliaConfig } from '../../configs';
import { getErrorCause } from '../../relayer/error';
import { createRelayerProvider } from '../createRelayerProvider';
import fetchMock from 'fetch-mock';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerGetKeyUrlInvalidResponseError } from '../../errors/RelayerGetKeyUrlError';
import { RelayerV2Provider } from './RelayerV2Provider';
import { TEST_CONFIG } from '../../test/config';
import { _clearTFHEPkeParamsCache } from '../AbstractRelayerProvider';
import { TFHEPkeParams } from '../../sdk/lowlevel/TFHEPkeParams';
import type { Auth } from '../types/public-api';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_keyurl.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_keyurl.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_keyurl.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts
//
// Curl Testnet:
// =============
//
// curl https://relayer.testnet.zama.org/v2/keyurl
//
////////////////////////////////////////////////////////////////////////////////

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

const relayerV1ResponseGetKeyUrl = {
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

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV2Provider', () => {
  let relayerProvider: RelayerV2Provider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    relayerProvider = createRelayerProvider(
      `${SepoliaConfigeRelayerUrl}/v2`,
      1,
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
    expect(response).toEqual(relayerV1ResponseGetKeyUrl);
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
      new RelayerGetKeyUrlInvalidResponseError({
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
      new RelayerGetKeyUrlInvalidResponseError({
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
      new RelayerGetKeyUrlInvalidResponseError({
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

////////////////////////////////////////////////////////////////////////////////
// Auth on GET requests Tests
////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV2Provider - Auth on GET requests', () => {
  beforeEach(() => {
    fetchMock.removeRoutes();
  });

  it('v2:keyurl: GET request includes BearerToken auth header', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

    const auth: Auth = {
      __type: 'BearerToken',
      token: 'test-bearer-token',
    };

    const provider = new RelayerV2Provider(relayerUrlV2, auth);
    await provider.fetchGetKeyUrl();

    const lastCall = fetchMock.callHistory.lastCall();
    expect(lastCall).toBeDefined();
    // Note: fetch-mock normalizes header keys to lowercase
    const headers = lastCall!.options.headers as Record<string, string>;
    expect(headers['authorization']).toBe('Bearer test-bearer-token');
  });

  it('v2:keyurl: GET request includes ApiKeyHeader auth header', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

    const auth: Auth = {
      __type: 'ApiKeyHeader',
      header: 'x-custom-api-key',
      value: 'my-secret-key',
    };

    const provider = new RelayerV2Provider(relayerUrlV2, auth);
    await provider.fetchGetKeyUrl();

    const lastCall = fetchMock.callHistory.lastCall();
    expect(lastCall).toBeDefined();
    const headers = lastCall!.options.headers as Record<string, string>;
    expect(headers['x-custom-api-key']).toBe('my-secret-key');
  });

  it('v2:keyurl: GET request includes default x-api-key header when no header specified', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

    const auth: Auth = {
      __type: 'ApiKeyHeader',
      value: 'my-secret-key',
    };

    const provider = new RelayerV2Provider(relayerUrlV2, auth);
    await provider.fetchGetKeyUrl();

    const lastCall = fetchMock.callHistory.lastCall();
    expect(lastCall).toBeDefined();
    const headers = lastCall!.options.headers as Record<string, string>;
    expect(headers['x-api-key']).toBe('my-secret-key');
  });

  it('v2:keyurl: GET request without auth has no Authorization header', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

    const provider = new RelayerV2Provider(relayerUrlV2);
    await provider.fetchGetKeyUrl();

    const lastCall = fetchMock.callHistory.lastCall();
    expect(lastCall).toBeDefined();
    // Note: fetch-mock normalizes header keys to lowercase
    const headers = lastCall!.options.headers as Record<string, string>;
    expect(headers['authorization']).toBeUndefined();
    expect(headers['x-api-key']).toBeUndefined();
  });
});

////////////////////////////////////////////////////////////////////////////////
// TFHEPkeParams Caching Tests
////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV2Provider - TFHEPkeParams Caching', () => {
  const testRelayerUrlV1 = TEST_CONFIG.v1.fhevmInstanceConfig.relayerUrl;
  let mockTFHEPkeParamsFetch: jest.SpyInstance;

  beforeEach(() => {
    fetchMock.removeRoutes();
    _clearTFHEPkeParamsCache();

    // Mock TFHEPkeParams.fetch to avoid needing real TFHE serialized data
    mockTFHEPkeParamsFetch = jest
      .spyOn(TFHEPkeParams, 'fetch')
      .mockResolvedValue({} as TFHEPkeParams);
  });

  afterEach(() => {
    _clearTFHEPkeParamsCache();
    mockTFHEPkeParamsFetch.mockRestore();
  });

  it('caches the promise and returns same result for concurrent calls', async () => {
    let fetchCount = 0;

    // Mock the keyurl endpoint
    fetchMock.get(`${testRelayerUrlV1}/keyurl`, () => {
      fetchCount++;
      return relayerV1ResponseGetKeyUrl;
    });

    const provider = createRelayerProvider(
      testRelayerUrlV1,
      1,
    ) as RelayerV2Provider;

    // Make 3 concurrent calls
    const [result1, result2, result3] = await Promise.all([
      provider.fetchTFHEPkeParams(),
      provider.fetchTFHEPkeParams(),
      provider.fetchTFHEPkeParams(),
    ]);

    // All should return the same cached object
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);

    // The keyurl endpoint should only be called once
    expect(fetchCount).toBe(1);

    // TFHEPkeParams.fetch should only be called once
    expect(mockTFHEPkeParamsFetch).toHaveBeenCalledTimes(1);
  });

  it('returns cached result on subsequent calls', async () => {
    let fetchCount = 0;

    fetchMock.get(`${testRelayerUrlV1}/keyurl`, () => {
      fetchCount++;
      return relayerV1ResponseGetKeyUrl;
    });

    const provider = createRelayerProvider(
      testRelayerUrlV1,
      1,
    ) as RelayerV2Provider;

    // First call
    const result1 = await provider.fetchTFHEPkeParams();

    // Second call (should be cached)
    const result2 = await provider.fetchTFHEPkeParams();

    // Third call (should be cached)
    const result3 = await provider.fetchTFHEPkeParams();

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(fetchCount).toBe(1);
    expect(mockTFHEPkeParamsFetch).toHaveBeenCalledTimes(1);
  });

  it('removes cache entry on failure and allows retry', async () => {
    let fetchCount = 0;

    fetchMock.get(`${testRelayerUrlV1}/keyurl`, () => {
      fetchCount++;
      if (fetchCount === 1) {
        return { status: 500 };
      }
      return relayerV1ResponseGetKeyUrl;
    });

    const provider = createRelayerProvider(
      testRelayerUrlV1,
      1,
    ) as RelayerV2Provider;

    // First call should fail
    await expect(provider.fetchTFHEPkeParams()).rejects.toThrow();

    // Second call should retry (cache was cleared on failure)
    const result = await provider.fetchTFHEPkeParams();
    expect(result).toBeDefined();

    // Should have made 2 fetch calls to keyurl
    expect(fetchCount).toBe(2);

    // TFHEPkeParams.fetch should only be called once (on success)
    expect(mockTFHEPkeParamsFetch).toHaveBeenCalledTimes(1);
  });

  it('caches separately for different relayer URLs', async () => {
    const testRelayerUrlV2 = TEST_CONFIG.v2.fhevmInstanceConfig.relayerUrl;
    let fetchCount1 = 0;
    let fetchCount2 = 0;

    fetchMock.get(`${testRelayerUrlV1}/keyurl`, () => {
      fetchCount1++;
      return relayerV1ResponseGetKeyUrl;
    });

    fetchMock.get(`${testRelayerUrlV2}/keyurl`, () => {
      fetchCount2++;
      return relayerV2ResponseGetKeyUrl;
    });

    // Return different objects for different URLs
    mockTFHEPkeParamsFetch.mockImplementation(() =>
      Promise.resolve({} as TFHEPkeParams),
    );

    const provider1 = createRelayerProvider(
      testRelayerUrlV1,
      1,
    ) as RelayerV2Provider;

    const provider2 = createRelayerProvider(
      testRelayerUrlV2,
      1,
    ) as RelayerV2Provider;

    provider1.fetchTFHEPkeParams();
    // Fetch from both providers
    const [result1, result2] = await Promise.all([
      provider1.fetchTFHEPkeParams(),
      provider2.fetchTFHEPkeParams(),
    ]);

    // Results should be different objects (different cache entries)
    expect(result1).not.toBe(result2);

    // Each should have fetched once
    expect(fetchCount1).toBe(1);
    expect(fetchCount2).toBe(1);

    // Subsequent calls should use cache
    await provider1.fetchTFHEPkeParams();
    await provider2.fetchTFHEPkeParams();

    expect(fetchCount1).toBe(1);
    expect(fetchCount2).toBe(1);

    // TFHEPkeParams.fetch should have been called twice (once per URL)
    expect(mockTFHEPkeParamsFetch).toHaveBeenCalledTimes(2);
  });
});
