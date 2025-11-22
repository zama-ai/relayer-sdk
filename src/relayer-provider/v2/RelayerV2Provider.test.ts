import { SepoliaConfig } from '../..';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { createRelayerProvider } from '../createRelayerFhevm';
import fetchMock from '@fetch-mock/core';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts

// curl https://relayer.testnet.zama.org/v2/keyurl
const relayerV2ResponseGetKeyUrl = {
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

describe('RelayerV2Provider', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    relayerProvider = createRelayerProvider(`${SepoliaConfigeRelayerUrl}/v2`);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v2`);
  });

  it('v2: fetchGetKeyUrl', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

    const response = await relayerProvider.fetchGetKeyUrl();
    expect(response).toEqual(relayerV2ResponseGetKeyUrl);
  });

  it("v2: fetchGetKeyUrl - response = { hello: '123' }", async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { hello: '123' });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      'Relayer returned an unexpected JSON response',
    );
  });

  it('v2: fetchGetKeyUrl - response = 123 ', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, 123);

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      "Relayer didn't response correctly. Bad JSON.",
    );
  });

  it('v2: fetchGetKeyUrl - response = { response: undefined }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: undefined });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      'Relayer returned an unexpected JSON response',
    );
  });

  it('v2: fetchGetKeyUrl - response = { response: null }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: null });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      'Relayer returned an unexpected JSON response',
    );
  });

  it('v2: fetchGetKeyUrl - response = { response: {} }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: {} });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      `Unexpected response ${relayerUrlV2}/keyurl. Invalid fetchGetKeyUrl().response.crs`,
    );
  });

  it('v2: fetchGetKeyUrl - response = { response: { crs: {} } }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, { response: { crs: {} } });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      `Unexpected response ${relayerUrlV2}/keyurl. Invalid fetchGetKeyUrl().response.fhe_key_info`,
    );
  });

  it('v2: fetchGetKeyUrl - response = { response: { crs: {}, fhe_key_info: {} } }', async () => {
    fetchMock.get(`${relayerUrlV2}/keyurl`, {
      response: { crs: {}, fhe_key_info: {} },
    });

    await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
      `Unexpected response ${relayerUrlV2}/keyurl. Invalid array fetchGetKeyUrl().response.fhe_key_info`,
    );
  });
});
