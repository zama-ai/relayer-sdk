'use strict';

import { safeJSONstringify } from '../../lib/internal.js';
import { publicDecrypt } from '../publicDecrypt.js';
import { parseCommonOptions, parseHandles } from '../utils.js';

// Old devnet handles publicly decryptable
// =======================================
// 0xc49cf03ffa2768ee7ca49fb8b1fe930c6b43075ed0000000000000aa36a70000
// 0xfd82b3d4bc3318f57189a5841e248e24b59453a168ff0000000000aa36a70400

// npx . public-decrypt --handles 0xfd82b3d4bc3318f57189a5841e248e24b59453a168ff0000000000aa36a70400
// npx . public-decrypt --version 2 --handles 0xfd82b3d4bc3318f57189a5841e248e24b59453a168ff0000000000aa36a70400
// npx . public-decrypt --version 2 --handles 0xc49cf03ffa2768ee7ca49fb8b1fe930c6b43075ed0000000000000aa36a70000
// npx . public-decrypt --version 2 --handles 0xe85c2a81338b8542a6c0a99a5a794f158f4fb0f6a2ff0000000000aa36a70400
// npx . public-decrypt --version 2 --handles 0x7abb4a6c63af220fcd7da6bba4a0891fbe77e576efff00000000000000010500
export async function publicDecryptCommand(options) {
  const { config, provider, signer, zamaFhevmApiKey } =
    parseCommonOptions(options);

  const fhevmHandles = parseHandles(options.handles);
  const handles = fhevmHandles.map((h) => {
    return h.toBytes32Hex();
  });

  const res = await publicDecrypt({
    handles,
    config,
    zamaFhevmApiKey,
    options,
  });

  console.log(safeJSONstringify(res, 2));
}
