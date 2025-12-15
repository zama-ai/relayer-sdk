import fetchMock from 'fetch-mock';
import { createInstance, SepoliaConfig } from './index';
import {
  publicKey as assetPublicKey,
  publicParams as assetPublicParams,
  publicKeyId as assetPublicKeyId,
} from './test';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from './constants';
import type { FhevmInstanceConfig } from './config';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests --coverage ./src/index.test.ts --collectCoverageFrom=./src/index.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/index.test.ts --collectCoverageFrom=./src/index.ts

jest.mock('ethers', () => ({
  JsonRpcProvider: () => ({
    // getSigners: () => ['0x4c102C7cA99d3079fEFF08114d3bad888b9794d9'],
  }),
  isAddress: () => true,
  getAddress: (address: string) => address,
  Contract: () => ({
    getKmsSigners: () => ['0x4c102C7cA99d3079fEFF08114d3bad888b9794d9'],
    getCoprocessorSigners: () => ['0x2A51dd7E518cce40BA951B9a400922B4eAA73968'],
    getThreshold: () => BigInt(1),
  }),
}));

// curl https://relayer.testnet.zama.org/v2/keyurl
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
const assetPublicParamsId = assetPublicParams[2048].publicParamsId;
const assetPublicKeyBytes = assetPublicKey.safe_serialize(
  SERIALIZED_SIZE_LIMIT_PK,
);
const assetPublicParams2048Bytes =
  assetPublicParams[2048].publicParams.safe_serialize(
    SERIALIZED_SIZE_LIMIT_CRS,
  );

describe('index', () => {
  let config: FhevmInstanceConfig;

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

    config = {
      gatewayChainId: 54321,
      aclContractAddress: '0x4c102C7cA99d3079fEFF08114d3bad888b9794d9',
      kmsContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      inputVerifierContractAddress:
        '0xd11aA685427f93f8010Ba3815f0B8c41c8a6222d',
      verifyingContractAddressDecryption:
        '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      verifyingContractAddressInputVerification:
        '0x2D55fF18668c6b5CB37B4c7687B46acf312A835c',
      chainId: 1234,
      publicKey: { data: assetPublicKeyBytes, id: assetPublicKeyId },
      publicParams: {
        2048: {
          publicParams: assetPublicParams2048Bytes,
          publicParamsId: assetPublicParamsId,
        },
      },
      network: 'https://network.com/',
    };
  });

  it('v1: createInstance', async () => {
    const instance = await createInstance(config);
    expect(instance.createEIP712).toBeDefined();
    expect(instance.generateKeypair).toBeDefined();
    expect(instance.createEncryptedInput).toBeDefined();
    expect(instance.getPublicKey()).toStrictEqual({
      publicKey: assetPublicKeyBytes,
      publicKeyId: assetPublicKeyId,
    });
    expect(instance.getPublicParams(2048)?.publicParamsId).toBe(
      assetPublicParamsId,
    );
  });

  it('v1: fails: chainId', async () => {
    config.chainId = BigInt(1234) as any;

    await expect(createInstance(config)).rejects.toThrow(
      'chainId must be a number',
    );
  });

  it('v1: fails: publicKey', async () => {
    config.publicKey = { data: 43 as any, id: assetPublicKeyId };
    await expect(createInstance(config)).rejects.toThrow(
      'publicKey must be a Uint8Array',
    );
  });

  it('v1: fails: aclContractAddress', async () => {
    config.aclContractAddress = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'ACL contract address is not valid or empty',
    );
  });

  it('v1: fails: kmsContractAddress', async () => {
    config.kmsContractAddress = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'KMS contract address is not valid or empty',
    );
  });

  it('v1: fails: verifyingContractAddressDecryption', async () => {
    config.verifyingContractAddressDecryption = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'Verifying contract for Decryption address is not valid or empty',
    );
  });

  it('v1: fails: verifyingContractAddressInputVerification', async () => {
    config.verifyingContractAddressInputVerification = '0x12345';
    await expect(createInstance(config)).rejects.toThrow(
      'Verifying contract for InputVerification address is not valid or empty',
    );
  });

  it('v1: fails: network', async () => {
    config.network = undefined;
    await expect(createInstance(config)).rejects.toThrow(
      'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
    );
  });

  it('v1: getPublicKey', async () => {
    const instance = await createInstance(config);
    const pub_key = instance.getPublicKey();
    expect(pub_key).not.toBeNull();
    expect(pub_key).not.toBeUndefined();
    expect(pub_key!.publicKeyId).toBe(assetPublicKeyId);
    expect(pub_key!.publicKey).toStrictEqual(assetPublicKeyBytes);
  });

  it('v1: getPublicParams', async () => {
    const instance = await createInstance(config);
    const pub_params = instance.getPublicParams(2048);
    expect(pub_params).not.toBeNull();
    expect(pub_params).not.toBeUndefined();
    expect(pub_params!.publicParamsId).toBe(assetPublicParamsId);
    expect(pub_params!.publicParams).toStrictEqual(assetPublicParams2048Bytes);
  });

  it('v1: generateKeypair', async () => {
    const instance = await createInstance(config);
    const kp = instance.generateKeypair();
    expect(kp).not.toBeNull();
    expect(kp).not.toBeUndefined();
  });
});
