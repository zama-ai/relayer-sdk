import { SepoliaConfig } from '../index';
import { cleanURL } from '../utils';
import { AbstractRelayerProvider } from './AbstractRelayerProvider';
import { RelayerV1Provider } from './v1/RelayerV1Provider';
import { RelayerV2Provider } from './v2/RelayerV2Provider';

export function createRelayerProvider(
  relayerUrl: string,
): AbstractRelayerProvider {
  const resolved = _resolveRelayerUrl(relayerUrl, SepoliaConfig.relayerUrl!);
  if (!resolved) {
    throw new Error(`Invalid relayerUrl: ${relayerUrl}`);
  }

  if (resolved.version === 2) {
    return new RelayerV2Provider(resolved.url);
  }

  return new RelayerV1Provider(resolved.url);
}

const DEFAULT_RELAYER_ROUTE_VERSION = 1;

function _resolveRelayerUrl(
  value: unknown,
  defaultRelayerBaseUrl: string,
): { url: string; version: number } | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const url = cleanURL(value);
  if (url === defaultRelayerBaseUrl) {
    return {
      url: `${defaultRelayerBaseUrl}/v${DEFAULT_RELAYER_ROUTE_VERSION}`,
      version: DEFAULT_RELAYER_ROUTE_VERSION,
    };
  }

  if (!URL.canParse(url)) {
    return null;
  }

  // Try to parse version number:
  // https://relayer.testnet.zama.org/vXXX
  const prefix = `${defaultRelayerBaseUrl}/v`;
  if (url.startsWith(prefix)) {
    // Determine version
    const version = Number.parseInt(url.substring(prefix.length));
    if (!Number.isInteger(version) || version <= 1) {
      return null;
    }

    return { url, version };
  }

  return { url, version: DEFAULT_RELAYER_ROUTE_VERSION };
}
