import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import {
  createRelayerFhevm,
  TFHEPkeCrs,
  TFHEPublicKey,
} from '../lib/internal.js';
import { logCLI } from './utils.js';

export function getFhevmPubKeyCacheInfo() {
  const cacheDir = path.join(homedir(), '.fhevm');
  const pubKeyFile = path.join(cacheDir, 'pubkey.json');
  const pubKeyParams2048File = path.join(cacheDir, 'pubkey-params-2048.json');
  return {
    cacheDir,
    pubKeyFile,
    pubKeyParams2048File,
  };
}

export async function loadFhevmPublicKeyConfig(config, options) {
  const res = loadFhevmPubKeyFromCache(options);
  if (res) {
    const pk = res.pk.toBytes();
    const crs = res.crs.toBytes();
    return {
      publicKey: {
        data: pk.bytes,
        id: pk.id,
      },
      publicParams: {
        2048: {
          publicParams: crs.bytes,
          publicParamsId: crs.id,
        },
      },
    };
  }

  const startTime = Date.now();

  logCLI(
    `Fetching pub keys from ${config.fhevmInstanceConfig.relayerUrl}...`,
    options,
  );

  const fhevm = await createRelayerFhevm({
    ...config.fhevmInstanceConfig,
    defaultRelayerVersion: config.version,
  });

  logCLI(`Relayer url: ${fhevm.relayerVersionUrl}`, options);

  const pubKeyBytes = fhevm.getPublicKeyBytes();
  const pkeCrs2048Bytes = fhevm.getPkeCrsBytesForCapacity(2048);

  const pk = TFHEPublicKey.fromBytes(pubKeyBytes);
  const crs = TFHEPkeCrs.fromBytes(pkeCrs2048Bytes);

  saveFhevmPubKeyToCache({ startTime, pk, crs });

  const pkBytes = pk.toBytes();
  const crsBytes = crs.toBytes();

  return {
    publicKey: {
      data: pkBytes.bytes,
      id: pkBytes.id,
    },
    publicParams: {
      2048: {
        publicParams: crsBytes.bytes,
        publicParamsId: crsBytes.id,
      },
    },
  };
}

export function loadFhevmPubKeyFromCache({ clearCache, json, verbose }) {
  const { pubKeyFile, pubKeyParams2048File } = getFhevmPubKeyCacheInfo();

  const pubKeyFileExists = fs.existsSync(pubKeyFile);
  const pubKeyParams2048FileExists = fs.existsSync(pubKeyParams2048File);

  if (!pubKeyFileExists) {
    logCLI(`❌ pubKey file does not exist.`, { json, verbose });
  }
  if (!pubKeyParams2048FileExists) {
    logCLI(`❌ pubKeyParams2048 file does not exist.`, { json, verbose });
  }

  if (!pubKeyParams2048FileExists || !pubKeyFileExists) {
    clearCache = true;
  }

  if (clearCache) {
    if (pubKeyFileExists) {
      logCLI(`delete ${pubKeyFile}.`, { json, verbose });
      fs.rmSync(pubKeyFile);
    }
    if (pubKeyParams2048FileExists) {
      logCLI(`delete ${pubKeyParams2048File}.`, { json, verbose });
      fs.rmSync(pubKeyParams2048File);
    }

    return null;
  }

  logCLI(`✅ load pubKey from cache...`, { json, verbose });
  const pk = TFHEPublicKey.fromJSON(
    JSON.parse(fs.readFileSync(pubKeyFile, 'utf-8')),
  );

  logCLI(`✅ load pubKeyParams2048 from cache...`, { json, verbose });
  const crs = TFHEPkeCrs.fromJSON(
    JSON.parse(fs.readFileSync(pubKeyParams2048File, 'utf-8')),
  );

  return { pk, crs };
}

export function saveFhevmPubKeyToCache({ startTime, pk, crs, json, verbose }) {
  const { cacheDir, pubKeyFile, pubKeyParams2048File } =
    getFhevmPubKeyCacheInfo();

  const pkJson = pk.toJSON();
  const crsJson = crs.toJSON();

  logCLI(`FHEVM pubKey cache directory: ${cacheDir}`, { json, verbose });

  if (!fs.existsSync(cacheDir)) {
    logCLI(`create directory ${cacheDir}...`, { json, verbose });
    fs.mkdirSync(cacheDir);
  }

  fs.writeFileSync(pubKeyFile, JSON.stringify(pkJson), 'utf-8');
  logCLI(
    `🍟 TFHEPublicKey saved at ${pubKeyFile} (${Date.now() - startTime}ms)`,
    {
      json,
      verbose,
    },
  );

  fs.writeFileSync(pubKeyParams2048File, JSON.stringify(crsJson), 'utf-8');
  logCLI(
    `🥬 TFHEPkeCrs saved at ${pubKeyParams2048File} (${Date.now() - startTime}ms)`,
    { json, verbose },
  );
}
