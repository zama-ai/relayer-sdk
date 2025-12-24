import type { PublicParams } from '../sdk/encrypt';
import { removeSuffix } from '../utils/string';
import { AbstractRelayerProvider } from './AbstractRelayerProvider';
import { RelayerV1Provider } from './v1/RelayerV1Provider';
import { RelayerV2Provider } from './v2/RelayerV2Provider';
import { RelayerV2Fhevm } from './v2/RelayerV2Fhevm';
import { RelayerV1Fhevm } from './v1/RelayerV1Fhevm';
import { AbstractRelayerFhevm } from './AbstractRelayerFhevm';

export async function createRelayerFhevm(config: {
  relayerUrl: string;
  publicKey?: {
    data: Uint8Array | null;
    id: string | null;
  };
  publicParams?: PublicParams<Uint8Array> | null;
  defaultRelayerVersion: 1 | 2;
}): Promise<AbstractRelayerFhevm> {
  const resolved = _resolveRelayerUrl(
    config.relayerUrl,
    config.defaultRelayerVersion,
  );
  if (!resolved) {
    throw new Error(`Invalid relayerUrl: ${config.relayerUrl}`);
  }

  if (resolved.version === 2) {
    return RelayerV2Fhevm.fromConfig({
      relayerVersionUrl: resolved.url,
      publicKey: config.publicKey,
      publicParams: config.publicParams,
    });
  } else if (resolved.version === 1) {
    return RelayerV1Fhevm.fromConfig({
      relayerVersionUrl: resolved.url,
      publicKey: config.publicKey,
      publicParams: config.publicParams,
    });
  } else {
    throw new Error(`Invalid relayerUrl: ${config.relayerUrl}`);
  }
}

export function createRelayerProvider(
  relayerUrl: string,
  defaultRelayerVersion: 1 | 2,
): AbstractRelayerProvider {
  const resolved = _resolveRelayerUrl(relayerUrl, defaultRelayerVersion);
  if (!resolved) {
    throw new Error(`Invalid relayerUrl: ${relayerUrl}`);
  }

  if (resolved.version === 2) {
    return new RelayerV2Provider(resolved.url);
  }

  return new RelayerV1Provider(resolved.url);
}

function _resolveRelayerUrl(
  value: unknown,
  defaultVersion: 1 | 2,
): { url: string; version: 1 | 2 } | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const urlNoSlash = removeSuffix(value, '/');
  if (!URL.canParse(urlNoSlash)) {
    return null;
  }

  if (urlNoSlash.endsWith('/v1')) {
    return {
      url: value,
      version: 1,
    };
  }

  if (urlNoSlash.endsWith('/v2')) {
    return {
      url: value,
      version: 2,
    };
  }

  if (typeof defaultVersion !== 'number') {
    throw new Error(`relayerUrl cannot be resolved. (value=${value})`);
  }

  return {
    url: `${urlNoSlash}/v${defaultVersion}`,
    version: defaultVersion,
  };
}
