import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { TFHEPkeCrs, TFHEPublicKey } from '../../lib/internal.js';
import { logCLI } from '../utils.js';
import { getFhevmPubKeyCacheInfo } from '../pubkeyCache.js';

// npx . pubkey info
export async function pubkeyInfoCommand(options) {
  const info = getFhevmPubKeyCacheInfo(options.network ?? 'devnet');

  const cacheDir = info.cacheDir;
  const pubKeyFile = info.pubKeyFile;
  const pkeCrs2048File = info.pubKeyParams2048File;

  logCLI(`cache directory : ${cacheDir}`, options);
  logCLI(`pubKey file     : ${pubKeyFile}`, options);
  logCLI(`pkeCrs2048 file : ${pkeCrs2048File}`, options);

  if (fs.existsSync(pubKeyFile)) {
    logCLI(
      `✅ pubKey file size : ${fs.statSync(pubKeyFile).size} bytes`,
      options,
    );

    const pk = TFHEPublicKey.fromJSON(
      JSON.parse(fs.readFileSync(pubKeyFile, 'utf-8')),
    );

    logCLI(`✅ pubKey id : ${pk.id}`, options);
  } else {
    logCLI(`❌ pubKey file size : file does not exist`, options);
  }

  if (fs.existsSync(pkeCrs2048File)) {
    logCLI(
      `✅ pkeCrs2048 file size : ${fs.statSync(pkeCrs2048File).size} bytes`,
      options,
    );
  } else {
    logCLI(`❌ pkeCrs2048 file size : file does not exist`, options);
  }
}
