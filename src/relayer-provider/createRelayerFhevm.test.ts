import { SepoliaConfig } from '../index';
import { TEST_CONFIG } from '../test/config';
import { createRelayerProvider } from './createRelayerFhevm';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/createRelayerFhevm.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/createRelayerFhevm.test.ts --collectCoverageFrom=./src/relayer-provider/createRelayerFhevm.ts

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('createRelayerProvider', () => {
  it('v1: <SepoliaConfig.relayerUrl>', () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    expect(SepoliaConfigeRelayerUrl).not.toBeNull();
    expect(SepoliaConfigeRelayerUrl).not.toBeUndefined();

    const defaultRelayerVersion = 1;
    const relayerProvider = createRelayerProvider(
      SepoliaConfigeRelayerUrl,
      defaultRelayerVersion,
    );
    expect(relayerProvider.version).toBe(defaultRelayerVersion);
    expect(relayerProvider.url).toBe(
      `${SepoliaConfigeRelayerUrl}/v${defaultRelayerVersion}`,
    );
  });

  it('v1: https://foo-relayer.org', () => {
    const defaultRelayerVersion = 1;
    const relayerProvider = createRelayerProvider(
      'https://foo-relayer.org',
      defaultRelayerVersion,
    );
    expect(relayerProvider.version).toBe(defaultRelayerVersion);
    expect(relayerProvider.url).toBe(
      `https://foo-relayer.org/v${defaultRelayerVersion}`,
    );
  });

  it('v1: https://foo-relayer.org/v1', () => {
    const relayerProvider = createRelayerProvider(
      'https://foo-relayer.org/v1',
      1,
    );
    expect(relayerProvider.version).toBe(1);
    expect(relayerProvider.url).toBe('https://foo-relayer.org/v1');
  });

  it('v1: https://foo-relayer.org/v2', () => {
    const relayerProvider = createRelayerProvider(
      'https://foo-relayer.org/v2',
      1,
    );
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe('https://foo-relayer.org/v2');
  });

  it('v2: <SepoliaConfig.relayerUrl>/v2', () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    expect(SepoliaConfigeRelayerUrl).not.toBeNull();
    expect(SepoliaConfigeRelayerUrl).not.toBeUndefined();

    const relayerProvider = createRelayerProvider(
      `${SepoliaConfigeRelayerUrl}/v2`,
      1,
    );
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v2`);
  });
});
