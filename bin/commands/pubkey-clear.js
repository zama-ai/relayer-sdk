import fs from 'fs';
import { logCLI } from '../utils.js';
import { getFhevmPubKeyCacheInfo } from '../pubkeyCache.js';

// npx . pubkey clear
export async function pubkeyClearCommand(options) {
  const info = getFhevmPubKeyCacheInfo(options.network ?? 'devnet');

  const cacheDir = info.cacheDir;

  logCLI(`🎃 FHEVM pubKey cache directory: ${cacheDir}`, options);

  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true });
    logCLI(`✅ FHEVM pubKey cache cleared.`, options);
  } else {
    logCLI(`✅ FHEVM pubKey cache is empty.`, options);
  }
}
