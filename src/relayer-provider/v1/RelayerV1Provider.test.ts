import { SepoliaConfig } from '../../configs';
import { createRelayerProvider } from '../createRelayerProvider';
import fetchMock from 'fetch-mock';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { TEST_CONFIG } from '../../test/config';
import {
  relayerV1ResponseGetKeyUrl,
  setupV1RoutesKeyUrl,
} from '../../test/v1/mockRoutes';
import { RelayerV1Provider } from './RelayerV1Provider';
import type { Auth } from '../types/public-api';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer-provider/v1/RelayerV1Provider.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Provider.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Provider.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Provider.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Provider.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('RelayerV1Provider', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    setupV1RoutesKeyUrl();

    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    relayerProvider = createRelayerProvider(`${SepoliaConfigeRelayerUrl}`, 1);
    expect(relayerProvider.version).toBe(1);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v1`);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fetchGetKeyUrl', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerProvider = createRelayerProvider(SepoliaConfigeRelayerUrl, 1);
    expect(relayerProvider.version).toBe(1);
    const response = await relayerProvider.fetchGetKeyUrl();
    expect(response).toEqual(relayerV1ResponseGetKeyUrl);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: fetchGetKeyUrl', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerProvider = createRelayerProvider(SepoliaConfigeRelayerUrl, 1);
    expect(relayerProvider.version).toBe(1);
    const response = await relayerProvider.fetchGetKeyUrl();
    expect(response).toEqual(relayerV1ResponseGetKeyUrl);
  });
});

////////////////////////////////////////////////////////////////////////////////
// Auth on GET requests Tests
////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV1Provider - Auth on GET requests', () => {
  const relayerUrlV1 = `${SepoliaConfig.relayerUrl!}/v1`;

  beforeEach(() => {
    fetchMock.removeRoutes();
  });

  it('v1:keyurl: GET request includes BearerToken auth header', async () => {
    fetchMock.get(`${relayerUrlV1}/keyurl`, relayerV1ResponseGetKeyUrl);

    const auth: Auth = {
      __type: 'BearerToken',
      token: 'test-bearer-token',
    };

    const provider = new RelayerV1Provider({ relayerUrl: relayerUrlV1, auth });
    await provider.fetchGetKeyUrl();

    const lastCall = fetchMock.callHistory.lastCall();
    expect(lastCall).toBeDefined();
    // Note: fetch-mock normalizes header keys to lowercase
    const headers = lastCall!.options.headers as Record<string, string>;
    expect(headers['authorization']).toBe('Bearer test-bearer-token');
  });

  it('v1:keyurl: GET request includes ApiKeyHeader auth header', async () => {
    fetchMock.get(`${relayerUrlV1}/keyurl`, relayerV1ResponseGetKeyUrl);

    const auth: Auth = {
      __type: 'ApiKeyHeader',
      header: 'x-custom-api-key',
      value: 'my-secret-key',
    };

    const provider = new RelayerV1Provider({ relayerUrl: relayerUrlV1, auth });
    await provider.fetchGetKeyUrl();

    const lastCall = fetchMock.callHistory.lastCall();
    expect(lastCall).toBeDefined();
    const headers = lastCall!.options.headers as Record<string, string>;
    expect(headers['x-custom-api-key']).toBe('my-secret-key');
  });

  it('v1:keyurl: GET request without auth has no Authorization header', async () => {
    fetchMock.get(`${relayerUrlV1}/keyurl`, relayerV1ResponseGetKeyUrl);

    const provider = new RelayerV1Provider({ relayerUrl: relayerUrlV1 });
    await provider.fetchGetKeyUrl();

    const lastCall = fetchMock.callHistory.lastCall();
    expect(lastCall).toBeDefined();
    // Note: fetch-mock normalizes header keys to lowercase
    const headers = lastCall!.options.headers as Record<string, string>;
    expect(headers['authorization']).toBeUndefined();
    expect(headers['x-api-key']).toBeUndefined();
  });
});
