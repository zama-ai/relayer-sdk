import { SepoliaConfig } from '../../configs';
import { createRelayerProvider } from '../createRelayerProvider';
import fetchMock from 'fetch-mock';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { TEST_CONFIG } from '../../test/config';
import {
  relayerV1ResponseGetKeyUrl,
  setupV1RoutesKeyUrl,
} from '../../test/v1/mockRoutes';

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
