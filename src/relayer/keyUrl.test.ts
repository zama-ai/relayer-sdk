import { TEST_CONFIG } from '../test/config';
import { keyUrl } from '@relayer/keyUrl';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer/keyUrl.test.ts
//
// Testnet:
// ========
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer/keyUrl.test.ts
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/relayer/keyUrl.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

jest.setTimeout(60000 * 3);

describe('keyUrl', () => {
  it('test keys caching', async () => {
    // fetch keys
    const tfhePkeParams1 = await keyUrl({
      relayerUrl: TEST_CONFIG.v2.fhevmInstanceConfig.relayerUrl,
    });
    const tfhePkeParams2 = await keyUrl({
      relayerUrl: TEST_CONFIG.v2.fhevmInstanceConfig.relayerUrl,
    });
    expect(tfhePkeParams1 === tfhePkeParams2).toBe(true);
  });
});
