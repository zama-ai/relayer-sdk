import { SepoliaConfig } from '../..';
import { createRelayerFhevm } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import {
  publicKey as assetPublicKey,
  publicParams as assetPublicParams,
} from '../../test';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from '../../utils';
import { RelayerV2Fhevm } from './RelayerV2Fhevm';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Fhevm.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Fhevm.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Fhevm.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Fhevm.ts

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
const assetPublicKeyBytes = assetPublicKey.safe_serialize(
  SERIALIZED_SIZE_LIMIT_PK,
);
const assetPublicParams2048Bytes =
  assetPublicParams[2048].publicParams.safe_serialize(
    SERIALIZED_SIZE_LIMIT_CRS,
  );

describe('RelayerV2Fhevm', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
    fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

    fetchMock.get(
      relayerV2ResponseGetKeyUrl.response.fhe_key_info[0].fhe_public_key
        .urls[0],
      assetPublicKeyBytes,
    );

    fetchMock.get(
      relayerV2ResponseGetKeyUrl.response.crs[2048].urls[0],
      assetPublicParams2048Bytes,
    );
  });

  it('v2: createRelayerFhevm', async () => {
    const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}/v2`,
    });
    expect(relayerFhevm.version).toBe(2);
  });

  it('v2: getPublicKey().publicKeyId', async () => {
    const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}/v2`,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.publicKeyId).toBe('fhe-public-key-data-id');
  });

  it('v2: getPublicKey().publicKey', async () => {
    const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}/v2`,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.publicKey).toStrictEqual(assetPublicKeyBytes);
  });

  it('v2: getPublicParams().publicParamsId', async () => {
    const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}/v2`,
    });
    const pub_params = relayerFhevm.getPublicParamsBytes(2048);
    expect(pub_params.publicParamsId).toBe('crs-data-id');
  });

  it('v2: getPublicParams().publicParams', async () => {
    const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}/v2`,
    });
    const pub_params = relayerFhevm.getPublicParamsBytes(2048);
    expect(pub_params.publicParams).toStrictEqual(assetPublicParams2048Bytes);
  });

  it('v2: getPublicParams(123).publicParams', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}/v2`,
    });
    expect(() => relayerFhevm.getPublicParamsBytes(123)).toThrow(
      'Unsupported PublicParams bits format 123',
    );
  });

  it('v2: relayerProvider()', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}/v2`,
    });
    expect(relayerFhevm instanceof RelayerV2Fhevm).toBe(true);
    const relayerFhevmV2 = relayerFhevm as RelayerV2Fhevm;
    expect(relayerFhevmV2.relayerProvider.url).toEqual(relayerUrlV2);
    expect(relayerFhevmV2.relayerProvider.version).toEqual(2);
  });

  it('v2: createRelayerFhevm from publicKey and publicParams', async () => {
    const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm1 = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}/v2`,
    });

    const pub_key = relayerFhevm1.getPublicKeyBytes();
    const pub_params = relayerFhevm1.getPublicParamsBytes(2048);

    const relayerFhevm2 = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}/v2`,
      publicKey: {
        data: pub_key.publicKey,
        id: pub_key.publicKeyId,
      },
      publicParams: {
        2048: pub_params,
      },
    });

    expect(relayerFhevm2.getPublicKeyBytes()).toStrictEqual(
      relayerFhevm1.getPublicKeyBytes(),
    );
    expect(relayerFhevm2.getPublicParamsBytes(2048)).toStrictEqual(
      relayerFhevm1.getPublicParamsBytes(2048),
    );
  });
});
