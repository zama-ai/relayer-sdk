import { createInstance } from './index';
import { publicKey, publicKeyId, publicParams } from './test';
import { SERIALIZED_SIZE_LIMIT_CRS, SERIALIZED_SIZE_LIMIT_PK } from './utils';

jest.mock('ethers', () => ({
  JsonRpcProvider: () => ({
    // getSigners: () => ['0x4c102C7cA99d3079fEFF08114d3bad888b9794d9'],
  }),
  isAddress: () => true,
  Contract: () => ({
    getKmsSigners: () => ['0x4c102C7cA99d3079fEFF08114d3bad888b9794d9'],
    getCoprocessorSigners: () => ['0x2A51dd7E518cce40BA951B9a400922B4eAA73968'],
    getThreshold: () => BigInt(1),
  }),
}));

describe('index', () => {
  it('creates an instance', async () => {
    const serializedPublicKey = publicKey.safe_serialize(
      SERIALIZED_SIZE_LIMIT_PK,
    );
    const serializedPublicParams =
      publicParams[2048].publicParams.safe_serialize(SERIALIZED_SIZE_LIMIT_CRS);

    const publicParamsId = publicParams[2048].publicParamsId;
    const instance = await createInstance({
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
      publicKey: { data: serializedPublicKey, id: publicKeyId },
      publicParams: {
        2048: { publicParams: serializedPublicParams, publicParamsId },
      },
      network: 'https://network.com/',
    });
    expect(instance.createEIP712).toBeDefined();
    expect(instance.generateKeypair).toBeDefined();
    expect(instance.createEncryptedInput).toBeDefined();
    expect(instance.getPublicKey()).toStrictEqual({
      publicKey: serializedPublicKey,
      publicKeyId,
    });
    expect(instance.getPublicParams(2048)?.publicParamsId).toBe(publicParamsId);
  });

  it('fails to create an instance', async () => {
    const serializedPublicKey = publicKey.serialize();
    const serializedPublicParams =
      publicParams[2048].publicParams.safe_serialize(SERIALIZED_SIZE_LIMIT_CRS);
    const publicParamsId = publicParams[2048].publicParamsId;
    await expect(
      createInstance({
        gatewayChainId: 54321,
        aclContractAddress: '0x4c102C7cA99d3079fEFF08114d3bad888b9794d9',
        kmsContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        inputVerifierContractAddress:
          '0xd11aA685427f93f8010Ba3815f0B8c41c8a6222d',
        verifyingContractAddressDecryption:
          '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        verifyingContractAddressInputVerification:
          '0x2D55fF18668c6b5CB37B4c7687B46acf312A835c',
        chainId: BigInt(1234) as any,
        publicKey: { data: serializedPublicKey, id: publicKeyId },
        publicParams: {
          2048: { publicParams: serializedPublicParams, publicParamsId },
        },
        network: 'https://',
      }),
    ).rejects.toThrow('chainId must be a number');

    await expect(
      createInstance({
        gatewayChainId: 54321,
        aclContractAddress: '0x4c102C7cA99d3079fEFF08114d3bad888b9794d9',
        kmsContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        inputVerifierContractAddress:
          '0xd11aA685427f93f8010Ba3815f0B8c41c8a6222d',
        verifyingContractAddressDecryption:
          '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        verifyingContractAddressInputVerification:
          '0x2D55fF18668c6b5CB37B4c7687B46acf312A835c',
        chainId: 9000,
        publicKey: { data: 43 as any, id: publicKeyId },
      }),
    ).rejects.toThrow('publicKey must be a Uint8Array');
  });
});
