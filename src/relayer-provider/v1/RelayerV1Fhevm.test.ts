import { createRelayerFhevm } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import { tfheCompactPkeCrsBytes, tfheCompactPublicKeyBytes } from '../../test';
import { RelayerV1Fhevm } from './RelayerV1Fhevm';
import { setupAllFetchMockRoutes, TEST_CONFIG } from '../../test/config';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer-provider/v1/RelayerV1Fhevm.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v1/RelayerV1Fhevm.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Fhevm.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Fhevm.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v1/RelayerV1Fhevm.test.ts --collectCoverageFrom=./src/relayer-provider/v1/RelayerV1Fhevm.ts
//
// Testnet:
// ========
//
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v1/RelayerV1Fhevm.test.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('../../test/config');
  return setupEthersJestMock();
});

////////////////////////////////////////////////////////////////////////////////
// Mock only, compares with keys assets
////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV1Fhevm', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
    setupAllFetchMockRoutes();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: createRelayerFhevm', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    expect(relayerFhevm.version).toBe(1);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicKey().publicKeyId', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.id).toBe('fhe-public-key-data-id');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicKey().publicKey', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.bytes).toStrictEqual(tfheCompactPublicKeyBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams(2048).publicParamsId', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    const pub_params = relayerFhevm.getPkeCrsBytesForCapacity(2048);
    expect(pub_params.id).toBe('crs-data-id');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams(2048).publicParams', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    const pub_params = relayerFhevm.getPkeCrsBytesForCapacity(2048);
    expect(pub_params.bytes).toStrictEqual(tfheCompactPkeCrsBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams(123).publicParams', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    expect(() => relayerFhevm.getPkeCrsBytesForCapacity(123)).toThrow(
      "Unsupported PublicParams bits format '123'",
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: relayerProvider()', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    expect(relayerFhevm instanceof RelayerV1Fhevm).toBe(true);
    const relayerFhevmV1 = relayerFhevm as RelayerV1Fhevm;
    expect(relayerFhevmV1.relayerProvider.url).toEqual(
      TEST_CONFIG.v1.fhevmInstanceConfig.relayerUrl,
    );
    expect(relayerFhevmV1.relayerProvider.version).toEqual(1);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: createRelayerFhevm from publicKey and publicParams', async () => {
    const relayerFhevm1 = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
    });
    const pub_key = relayerFhevm1.getPublicKeyBytes();
    const pub_params = relayerFhevm1.getPkeCrsBytesForCapacity(2048);

    const relayerFhevm2 = await createRelayerFhevm({
      ...TEST_CONFIG.v1.fhevmInstanceConfig,
      defaultRelayerVersion: 1,
      publicKey: {
        data: pub_key.bytes,
        id: pub_key.id,
      },
      publicParams: {
        2048: {
          publicParams: pub_params.bytes,
          publicParamsId: pub_params.id,
        },
      },
    });

    expect(relayerFhevm2.getPublicKeyBytes()).toStrictEqual(
      relayerFhevm1.getPublicKeyBytes(),
    );

    expect(relayerFhevm2.getPkeCrsBytesForCapacity(2048)).toStrictEqual(
      relayerFhevm1.getPkeCrsBytesForCapacity(2048),
    );
  });
});
