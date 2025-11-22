import { SepoliaConfig } from '../index';
import { createRelayerProvider } from './createRelayerFhevm';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/createRelayerProvider.test.ts --collectCoverageFrom=./src/relayer-provider/createRelayerProvider.ts

describe('createRelayerProvider', () => {
  it('v1: <SepoliaConfig.relayerUrl>', () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    expect(SepoliaConfigeRelayerUrl).not.toBeNull();
    expect(SepoliaConfigeRelayerUrl).not.toBeUndefined();

    const relayerProvider = createRelayerProvider(SepoliaConfigeRelayerUrl);
    expect(relayerProvider.version).toBe(1);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v1`);
  });

  it('v1: https://foo-relayer.org', () => {
    const relayerProvider = createRelayerProvider('https://foo-relayer.org');
    expect(relayerProvider.version).toBe(1);
    expect(relayerProvider.url).toBe('https://foo-relayer.org');
  });

  it('v1: https://foo-relayer.org/v1', () => {
    const relayerProvider = createRelayerProvider('https://foo-relayer.org/v1');
    expect(relayerProvider.version).toBe(1);
    expect(relayerProvider.url).toBe('https://foo-relayer.org/v1');
  });

  it('v1: https://foo-relayer.org/v2', () => {
    const relayerProvider = createRelayerProvider('https://foo-relayer.org/v2');
    expect(relayerProvider.version).toBe(1);
    expect(relayerProvider.url).toBe('https://foo-relayer.org/v2');
  });

  it('v2: <SepoliaConfig.relayerUrl>/v2', () => {
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    expect(SepoliaConfigeRelayerUrl).not.toBeNull();
    expect(SepoliaConfigeRelayerUrl).not.toBeUndefined();

    const relayerProvider = createRelayerProvider(
      `${SepoliaConfigeRelayerUrl}/v2`,
    );
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v2`);
  });
});
