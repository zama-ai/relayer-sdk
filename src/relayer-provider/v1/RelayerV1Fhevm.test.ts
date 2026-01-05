import { SepoliaConfig } from '../..';
import { createRelayerFhevm } from '../createRelayerFhevm';
import fetchMock from 'fetch-mock';
import { tfheCompactPkeCrsBytes, tfheCompactPublicKeyBytes } from '../../test';
import { RelayerV1Fhevm } from './RelayerV1Fhevm';
import { TEST_CONFIG } from '../../test/config';
import { setupV1RoutesKeyUrl } from '../../test/v1/mockRoutes';

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
//
// Curl Testnet:
// =============
//
// curl https://relayer.testnet.zama.org/v1/keyurl
//
////////////////////////////////////////////////////////////////////////////////

const defaultRelayerVersion = 1;
const relayerUrlV1 = `${SepoliaConfig.relayerUrl!}/v1`;

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('RelayerV1Fhevm', () => {
  beforeEach(async () => {
    fetchMock.removeRoutes();
    setupV1RoutesKeyUrl();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: createRelayerFhevm', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    expect(relayerFhevm.version).toBe(1);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicKey().publicKeyId', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.id).toBe('fhe-public-key-data-id');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicKey().publicKey', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    const pub_key = relayerFhevm.getPublicKeyBytes();
    expect(pub_key.bytes).toStrictEqual(tfheCompactPublicKeyBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams(2048).publicParamsId', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    const pub_params = relayerFhevm.getPkeCrsBytesForCapacity(2048);
    expect(pub_params.id).toBe('crs-data-id');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams(2048).publicParams', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    const pub_params = relayerFhevm.getPkeCrsBytesForCapacity(2048);
    expect(pub_params.bytes).toStrictEqual(tfheCompactPkeCrsBytes);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: getPublicParams(123).publicParams', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    expect(() => relayerFhevm.getPkeCrsBytesForCapacity(123)).toThrow(
      "Unsupported PublicParams bits format '123'",
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: relayerProvider()', async () => {
    const relayerFhevm = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    expect(relayerFhevm instanceof RelayerV1Fhevm).toBe(true);
    const relayerFhevmV1 = relayerFhevm as RelayerV1Fhevm;
    expect(relayerFhevmV1.relayerProvider.url).toEqual(relayerUrlV1);
    expect(relayerFhevmV1.relayerProvider.version).toEqual(1);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: createRelayerFhevm from publicKey and publicParams', async () => {
    const relayerFhevm1 = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
    });
    const pub_key = relayerFhevm1.getPublicKeyBytes();
    const pub_params = relayerFhevm1.getPkeCrsBytesForCapacity(2048);

    const relayerFhevm2 = await createRelayerFhevm({
      ...SepoliaConfig,
      defaultRelayerVersion,
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
