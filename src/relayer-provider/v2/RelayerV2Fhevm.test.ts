import { createRelayerFhevm } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import { RelayerV2Fhevm } from './RelayerV2Fhevm';
import { TEST_CONFIG } from '../../test/config';
import { TFHEError } from '../../errors/TFHEError';
import { tfheCompactPkeCrsBytes, tfheCompactPublicKeyBytes } from '../../test';
import { setupV2RoutesKeyUrl } from '../../test/v2/mockRoutes';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Fhevm.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Fhevm.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Fhevm.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Fhevm.ts
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

describeIfFetchMock('RelayerV2Fhevm', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
    setupV2RoutesKeyUrl();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: createRelayerFhevm', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    expect(relayerFhevm.version).toBe(2);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: getPublicKey().publicKeyId', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.id).toBe('fhe-public-key-data-id');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: getPublicKey().publicKey', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.bytes).toStrictEqual(tfheCompactPublicKeyBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: getPublicParams().publicParamsId', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    const pub_params = relayerFhevm.getPkeCrsBytesForCapacity(2048);
    expect(pub_params.id).toBe('crs-data-id');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: getPublicParams().publicParams', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    const pub_params = relayerFhevm.getPkeCrsBytesForCapacity(2048);
    expect(pub_params.bytes).toStrictEqual(tfheCompactPkeCrsBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: getPublicParams(123).publicParams', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    expect(() => relayerFhevm.getPkeCrsBytesForCapacity(123)).toThrow(
      new TFHEError({
        message: `Unsupported FHEVM PkeCrs capacity: 123`,
      }),
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: relayerProvider()', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    expect(relayerFhevm instanceof RelayerV2Fhevm).toBe(true);
    const relayerFhevmV2 = relayerFhevm as RelayerV2Fhevm;
    expect(relayerFhevmV2.relayerProvider.url).toEqual(
      TEST_CONFIG.v2.fhevmInstanceConfig.relayerUrl,
    );
    expect(relayerFhevmV2.relayerProvider.version).toEqual(2);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: createRelayerFhevm from publicKey and publicParams', async () => {
    const relayerFhevm1 = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
      defaultRelayerVersion: 2,
    });
    const pub_key = relayerFhevm1.getPublicKeyBytes();
    const pub_params = relayerFhevm1.getPkeCrsBytesForCapacity(2048);

    const relayerFhevm2 = await createRelayerFhevm({
      ...TEST_CONFIG.v2.fhevmInstanceConfig,
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
      defaultRelayerVersion: 2,
    });

    expect(relayerFhevm2.getPublicKeyBytes()).toStrictEqual(
      relayerFhevm1.getPublicKeyBytes(),
    );
    expect(relayerFhevm2.getPkeCrsBytesForCapacity(2048)).toStrictEqual(
      relayerFhevm1.getPkeCrsBytesForCapacity(2048),
    );
  });
});
