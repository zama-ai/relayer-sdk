import fs from 'fs';
import { safeJSONstringify, TFHEPublicKey } from '../../lib/internal.js';
import { logCLI, parseCommonOptions } from '../utils.js';
import { getFhevmPubKeyCacheInfo } from '../pubkeyCache.js';

// npx . pubkey info
export async function pubkeyInfoCommand(options) {
  const { config } = parseCommonOptions(options);

  const info = getFhevmPubKeyCacheInfo(config.name);

  if (options.keyUrls === true) {
    const keyUrls = await fetch(
      `${config.fhevmInstanceConfig.relayerUrl}/keyurl`,
    );
    const json = await keyUrls.json();

    logCLI(
      `✅ Relayer url      : ${config.fhevmInstanceConfig.relayerUrl}`,
      options,
    );
    logCLI(`✅ Relayer response :`, options);
    logCLI('');
    logCLI(safeJSONstringify(json.response, 2));
    logCLI('');
    logCLI('=======================================================');
    logCLI('');
  }

  const cacheDir = info.cacheDir;
  const pubKeyFile = info.pubKeyFile;
  const pkeCrs2048File = info.pubKeyParams2048File;

  logCLI(`- cache directory : ${cacheDir}`, options);
  logCLI(`- pubKey file     : ${pubKeyFile}`, options);
  logCLI(`- pkeCrs2048 file : ${pkeCrs2048File}`, options);
  logCLI('');

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
