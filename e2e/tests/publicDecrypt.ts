import type { TFHEType, TKMSType } from '../../src/sdk/lowlevel/public-api';
import type { PublicDecryptResults } from '../../bundle';

declare global {
  interface Window {
    relayerSDK: typeof import('../../bundle');
    TFHE: TFHEType;
    TMKS: TKMSType;
  }
}

export async function testPublicDecrypt() {
  function trace(str: string, startTime: number) {
    console.log(`[${Date.now() - startTime}ms] ${str}`);
  }

  function assert(cond: boolean, str: string) {
    if (!cond) {
      throw new Error(`Assertion failed: ${str}`);
    }
  }

  const startTime = Date.now();

  const SERIALIZED_SIZE_LIMIT_PK = BigInt(1024 * 1024 * 512);
  const SERIALIZED_SIZE_LIMIT_CRS = BigInt(1024 * 1024 * 512);

  trace(String(startTime), startTime);
  trace(String(SERIALIZED_SIZE_LIMIT_PK), startTime);
  trace(String(SERIALIZED_SIZE_LIMIT_CRS), startTime);

  const relayerSDK = window.relayerSDK;
  const ok = await relayerSDK.initSDK();
  if (!ok) {
    throw new Error('Test failed - initSDK() returned false');
  }

  trace(JSON.stringify(relayerSDK.SepoliaConfig), startTime);

  trace('Creating instance...', startTime);
  const instance = await relayerSDK.createInstance({
    ...relayerSDK.SepoliaConfig,
    network: 'https://ethereum-sepolia-rpc.publicnode.com',
  });

  const handle =
    '0x1edaef82ad486a3edb58e08ae5701141927d4eeb28ff0000000000aa36a70400';

  trace('Public decrypt...', startTime);
  const res: PublicDecryptResults = await instance.publicDecrypt([handle]);

  assert(res.clearValues !== undefined, 'res.clearValues !== undefined');
  assert(
    res.clearValues[handle] !== undefined,
    'res.clearValues[handle] !== undefined',
  );

  trace(`handle=${handle}`, startTime);
  trace(`clear=${res.clearValues[handle]}`, startTime);
}
