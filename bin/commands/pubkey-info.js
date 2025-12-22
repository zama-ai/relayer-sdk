import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { TFHECrs, TFHEPublicKey } from '../../lib/internal.js';
import { logCLI } from '../utils.js';

// npx . pubkey info
export async function pubkeyInfoCommand(options) {
  const cacheDir = path.join(homedir(), '.fhevm');

  const pubKeyFile = path.join(cacheDir, 'pubkey.json');
  const pubKeyParams2048File = path.join(cacheDir, 'pubkey-params-2048.json');

  logCLI(`cache directory       : ${cacheDir}`, options);
  logCLI(`pubKey file           : ${pubKeyFile}`, options);
  logCLI(`pubKeyParams2048 file : ${pubKeyParams2048File}`, options);

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

  if (fs.existsSync(pubKeyParams2048File)) {
    logCLI(
      `✅ pubKeyParams2048 file size : ${fs.statSync(pubKeyParams2048File).size} bytes`,
      options,
    );
    const crs = TFHECrs.fromJSON(
      JSON.parse(fs.readFileSync(pubKeyParams2048File, 'utf-8')),
    );
    logCLI(`✅ pubKeyParams2048 bits : ${crs.bits}`, options);
    logCLI(`✅ pubKeyParams2048 id   : ${crs.id}`, options);
  } else {
    logCLI(`❌ pubKeyParams2048 file size : file does not exist`, options);
  }
}
