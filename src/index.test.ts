import { bytesToHex } from '@base/bytes';
import { createInstance, SepoliaConfigV2 } from './index';
import { keyUrl } from '@relayer/fetchTfhePublicEncryptionParams';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/index.test.ts
//
// Testnet:
// ========
// npx jest --config jest.testnet.config.cjs --colors --passWithNoTests ./src/index.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

jest.setTimeout(60000 * 3);

describe('index', () => {
  it('createInstance - test keys', async () => {
    // fetch keys
    const instance1 = await createInstance(SepoliaConfigV2);

    const pk1 = instance1.getPublicKey();
    const pp1 = instance1.getPublicParams();

    // create new instance with the downloaded keys
    const instance2 = await createInstance({
      ...SepoliaConfigV2,
      publicKey: {
        id: pk1.publicKeyId,
        data: pk1.publicKey,
      },
      publicParams: {
        2048: pp1,
      },
    });

    const pk2 = instance2.getPublicKey();
    const pp2 = instance2.getPublicParams();

    // compare keys
    const pkHex1 = bytesToHex(pk1.publicKey);
    const pkHex2 = bytesToHex(pk2.publicKey);
    expect(pkHex1).toEqual(pkHex2);

    const ppHex1 = bytesToHex(pp1.publicParams);
    const ppHex2 = bytesToHex(pp2.publicParams);
    expect(ppHex1).toEqual(ppHex2);
  });

  it('keyUrl - test keys caching', async () => {
    // fetch keys
    const tfhePkeParams1 = await keyUrl({
      relayerUrl: SepoliaConfigV2.relayerUrl,
    });
    const tfhePkeParams2 = await keyUrl({
      relayerUrl: SepoliaConfigV2.relayerUrl,
    });
    expect(tfhePkeParams1 === tfhePkeParams2).toBe(true);
  });
});
