import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import {
  TFHEPkeCrs,
  TFHEPublicKey,
  createRelayerFhevm,
} from '../lib/internal.js';
import { logCLI } from './utils.js';

export function getFhevmPubKeyCacheInfo(name) {
  const cacheDir = path.join(homedir(), '.fhevm', name);
  const pubKeyFile = path.join(cacheDir, 'pubkey.json');
  const pubKeyParams2048File = path.join(cacheDir, 'pubkey-params-2048.json');
  return {
    cacheDir,
    pubKeyFile,
    pubKeyParams2048File,
  };
}

export async function loadFhevmPublicKeyConfig(
  config,
  zamaFhevmApiKey,
  options,
) {
  const instanceOptions = {
    //...(options.verbose === true ? { debug: true } : {}),
    auth: { __type: 'ApiKeyHeader', value: zamaFhevmApiKey },
  };

  const res = loadFhevmPubKeyFromCache({ ...options, name: config.name });
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
    ...instanceOptions,
  });

  logCLI(`Relayer url: ${fhevm.relayerVersionUrl}`, options);

  const pubKeyBytes = fhevm.getPublicKeyBytes();
  const pkeCrs2048Bytes = fhevm.getPkeCrsBytesForCapacity(2048);

  const pk = TFHEPublicKey.fromBytes(pubKeyBytes);
  const crs = TFHEPkeCrs.fromBytes(pkeCrs2048Bytes);

  saveFhevmPubKeyToCache({ name: config.name, startTime, pk, crs });

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

export function loadFhevmPubKeyFromCache({ name, clearCache, json, verbose }) {
  const { pubKeyFile, pubKeyParams2048File } = getFhevmPubKeyCacheInfo(name);

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

export function saveFhevmPubKeyToCache({
  name,
  startTime,
  pk,
  crs,
  json,
  verbose,
}) {
  const { cacheDir, pubKeyFile, pubKeyParams2048File } =
    getFhevmPubKeyCacheInfo(name);

  const pkJson = pk.toJSON();
  const crsJson = crs.toJSON();

  logCLI(`FHEVM pubKey cache directory: ${cacheDir}`, { json, verbose });

  if (!fs.existsSync(cacheDir)) {
    logCLI(`create directory ${cacheDir}...`, { json, verbose });
    fs.mkdirSync(cacheDir, { recursive: true });
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
