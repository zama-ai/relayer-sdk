import { SepoliaConfig } from '../..';
import { createRelayerProvider } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import {
  publicKey as assetPublicKey,
  publicParams as assetPublicParams,
} from '../../test';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from '../../utils';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v1/RelayerV1Provider.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Provider.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Provider.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Provider.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Provider.ts

// curl https://relayer.testnet.zama.org/v1/keyurl
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

const relayerUrlV1 = `${SepoliaConfig.relayerUrl!}/v1`;

describe('RelayerV1Provider', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    relayerProvider = createRelayerProvider(`${SepoliaConfigeRelayerUrl}`, 1);
    expect(relayerProvider.version).toBe(1);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v1`);
  });

  it('v1: fetchGetKeyUrl', async () => {
    fetchMock.get(`${relayerUrlV1}/keyurl`, relayerV1ResponseGetKeyUrl);

    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerProvider = createRelayerProvider(SepoliaConfigeRelayerUrl, 1);
    expect(relayerProvider.version).toBe(1);
    const response = await relayerProvider.fetchGetKeyUrl();
    expect(response).toEqual(relayerV1ResponseGetKeyUrl);
  });

  it('v1: fetchGetKeyUrl', async () => {
    fetchMock.get(`${relayerUrlV1}/keyurl`, relayerV1ResponseGetKeyUrl);

    fetchMock.get(
      relayerV1ResponseGetKeyUrl.response.fhe_key_info[0].fhe_public_key
        .urls[0],
      assetPublicKey.safe_serialize(SERIALIZED_SIZE_LIMIT_PK),
    );

    fetchMock.get(
      relayerV1ResponseGetKeyUrl.response.crs[2048].urls[0],
      assetPublicParams[2048].publicParams.safe_serialize(
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
    );

    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerProvider = createRelayerProvider(SepoliaConfigeRelayerUrl, 1);
    expect(relayerProvider.version).toBe(1);
    const response = await relayerProvider.fetchGetKeyUrl();
    expect(response).toEqual(relayerV1ResponseGetKeyUrl);
  });
});
