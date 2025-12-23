'use strict';

import { safeJSONstringify } from '../../lib/internal.js';
import { getInstance } from '../instance.js';
import { loadFhevmPubKey } from '../pubkeyCache.js';
import { logCLI, parseCommonOptions, parseHandles } from '../utils.js';

// Old devnet handles publicly decryptable
// =======================================
// 0xc49cf03ffa2768ee7ca49fb8b1fe930c6b43075ed0000000000000aa36a70000
// 0xfd82b3d4bc3318f57189a5841e248e24b59453a168ff0000000000aa36a70400

// npx . public-decrypt --handles 0xfd82b3d4bc3318f57189a5841e248e24b59453a168ff0000000000aa36a70400
// npx . public-decrypt --version 2 --handles 0xfd82b3d4bc3318f57189a5841e248e24b59453a168ff0000000000aa36a70400
// npx . public-decrypt --version 2 --handles 0xc49cf03ffa2768ee7ca49fb8b1fe930c6b43075ed0000000000000aa36a70000
export async function publicDecryptCommand(options) {
  const { config } = parseCommonOptions(options);

  const fhevmHandles = parseHandles(options.handles);
  const handles = fhevmHandles.map((h) => {
    return h.toBytes32Hex();
  });

  const { publicKey, publicParams } = await loadFhevmPubKey(config, options);

  try {
    const instance = await getInstance(
      {
        ...config.fhevmInstanceConfig,
        publicKey,
        publicParams,
      },
      options,
    );

    logCLI('Running public decrypt...', options);

    // setTimeout(() => {
    //   abortController.abort();
    // }, 3000);

    const res = await instance.publicDecrypt(handles, {
      timeout: 5000,
      //signal: abortController.signal,
      onProgress: (args) => {
        logCLI('progress=' + args.type, options);
      },
    });

    console.log(safeJSONstringify(res, 2));
  } catch (e) {
    console.log('');
    console.log('===================== ❌ ERROR ❌ ========================');
    console.log(`[Error message]: '${e.message}'`);
    console.log('');
    console.log(`[Error log]:`);
    console.log(e);
    if (e.cause) {
      console.log('[ERROR cause]:');
      console.log(JSON.stringify(e.cause, null, 2));
    }
    console.log('========================================================');
  }
}
