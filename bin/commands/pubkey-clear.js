import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { logCLI } from '../utils';

// npx . pubkey clear
export async function pubkeyClearCommand(options) {
  const cacheDir = path.join(homedir(), '.fhevm');

  logCLI(`🎃 FHEVM pubKey cache directory: ${cacheDir}`, options);

  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true });
    logCLI(`✅ FHEVM pubKey cache cleared.`, options);
  } else {
    logCLI(`✅ FHEVM pubKey cache is empty.`, options);
  }
}
