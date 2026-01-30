import type { AbstractRelayerProvider } from './AbstractRelayerProvider';
import { RelayerV1Provider } from './v1/RelayerV1Provider';
import { RelayerV2Provider } from './v2/RelayerV2Provider';
import { parseRelayerUrl } from './relayerUrl';
import { InvalidRelayerUrlError } from '../errors/InvalidRelayerUrlError';

/**
 * Creates a relayer provider instance based on the URL and version.
 *
 * @param relayerUrl - The relayer API URL (may include `/v1` or `/v2` suffix)
 * @param defaultRelayerVersion - Version to use if URL doesn't specify one
 * @returns A {@link RelayerV1Provider} or {@link RelayerV2Provider} instance
 * @throws {InvalidRelayerUrlError} If the URL is invalid
 */
export function createRelayerProvider(
  relayerUrl: string,
  defaultRelayerVersion: 1 | 2,
): AbstractRelayerProvider {
  const resolved = parseRelayerUrl(relayerUrl, defaultRelayerVersion);
  if (!resolved) {
    throw new InvalidRelayerUrlError({
      message: `Invalid relayerUrl: ${relayerUrl}`,
    });
  }

  if (resolved.version === 2) {
    return new RelayerV2Provider({ relayerUrl: resolved.url });
  }

  return new RelayerV1Provider({ relayerUrl: resolved.url });
}
