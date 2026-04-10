import { SepoliaConfig } from '../configs';
import { TEST_CONFIG } from '../test/config';
import { createRelayerProvider } from './createRelayerProvider';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/createRelayerFhevm.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/createRelayerFhevm.test.ts --collectCoverageFrom=./src/relayer-provider/createRelayerFhevm.ts

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

describeIfFetchMock('createRelayerProvider', () => {
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
