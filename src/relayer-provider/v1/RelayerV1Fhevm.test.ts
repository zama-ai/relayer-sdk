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
import { RelayerV1Fhevm } from './RelayerV1Fhevm';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Fhevm.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Fhevm.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Fhevm.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Fhevm.ts

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

const defaultRelayerVersion = 1;
const relayerUrlV1 = `${SepoliaConfig.relayerUrl!}/v1`;
const assetPublicKeyBytes = assetPublicKey.safe_serialize(
  SERIALIZED_SIZE_LIMIT_PK,
);
const assetPublicParams2048Bytes =
  assetPublicParams[2048].publicParams.safe_serialize(
    SERIALIZED_SIZE_LIMIT_CRS,
  );

describe('RelayerV1Fhevm', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
    fetchMock.get(`${relayerUrlV1}/keyurl`, relayerV1ResponseGetKeyUrl);

    fetchMock.get(
      relayerV1ResponseGetKeyUrl.response.fhe_key_info[0].fhe_public_key
        .urls[0],
      assetPublicKeyBytes,
    );

    fetchMock.get(
      relayerV1ResponseGetKeyUrl.response.crs[2048].urls[0],
      assetPublicParams2048Bytes,
    );
  });

  it('v1: createRelayerFhevm', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}`,
      defaultRelayerVersion,
    });
    expect(relayerFhevm.version).toBe(1);
  });

  it('v1: getPublicKey().publicKeyId', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}`,
      defaultRelayerVersion,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.publicKeyId).toBe('fhe-public-key-data-id');
  });

  it('v1: getPublicKey().publicKey', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}`,
      defaultRelayerVersion,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.publicKey).toStrictEqual(assetPublicKeyBytes);
  });

  it('v1: getPublicParams(2048).publicParamsId', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}`,
      defaultRelayerVersion,
    });
    const pub_params = relayerFhevm.getPublicParamsBytes(2048);
    expect(pub_params.publicParamsId).toBe('crs-data-id');
  });

  it('v1: getPublicParams(2048).publicParams', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}`,
      defaultRelayerVersion,
    });
    const pub_params = relayerFhevm.getPublicParamsBytes(2048);
    expect(pub_params.publicParams).toStrictEqual(assetPublicParams2048Bytes);
  });

  it('v1: getPublicParams(123).publicParams', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}`,
      defaultRelayerVersion,
    });
    expect(() => relayerFhevm.getPublicParamsBytes(123)).toThrow(
      'Unsupported PublicParams bits format 123',
    );
  });

  it('v1: relayerProvider()', async () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigeRelayerUrl}`,
      defaultRelayerVersion,
    });
    expect(relayerFhevm instanceof RelayerV1Fhevm).toBe(true);
    const relayerFhevmV1 = relayerFhevm as RelayerV1Fhevm;
    expect(relayerFhevmV1.relayerProvider.url).toEqual(relayerUrlV1);
    expect(relayerFhevmV1.relayerProvider.version).toEqual(1);
  });

  it('v1: createRelayerFhevm from publicKey and publicParams', async () => {
    const SepoliaConfigRelayerUrl = SepoliaConfig.relayerUrl!;
    const relayerFhevm1 = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}`,
      defaultRelayerVersion,
    });
    const pub_key = relayerFhevm1.getPublicKeyBytes();
    const pub_params = relayerFhevm1.getPublicParamsBytes(2048);

    const relayerFhevm2 = await createRelayerFhevm({
      relayerUrl: `${SepoliaConfigRelayerUrl}`,
      defaultRelayerVersion,
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
