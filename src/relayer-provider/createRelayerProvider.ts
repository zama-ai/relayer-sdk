import type { AbstractRelayerProvider } from './AbstractRelayerProvider';
import { RelayerV2Provider } from './v2/RelayerV2Provider';
import { parseRelayerUrl } from './relayerUrl';
import { InvalidRelayerUrlError } from '../errors/InvalidRelayerUrlError';

/**
 * Creates a relayer provider instance based on the URL and version.
 *
 * @param relayerUrl - The relayer API URL (may include `/v1` or `/v2` suffix)
 * @returns A {@link RelayerV2Provider} instance
 * @throws {InvalidRelayerUrlError} If the URL is invalid
 */
export function createRelayerProvider(
  relayerUrl: string,
): AbstractRelayerProvider {
  const resolved = parseRelayerUrl(relayerUrl);
  if (!resolved) {
    throw new InvalidRelayerUrlError({
      message: `Invalid relayerUrl: ${relayerUrl}`,
    });
  }

  return new RelayerV2Provider({ relayerUrl: resolved.url });
}
