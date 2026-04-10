import type { FhevmInstanceConfig } from '../types/relayer';
import type { AbstractRelayerFhevm } from './AbstractRelayerFhevm';
import { InvalidRelayerUrlError } from '../errors/InvalidRelayerUrlError';
import { parseRelayerUrl } from './relayerUrl';
import { RelayerV2Fhevm } from './v2/RelayerV2Fhevm';

/**
 * Creates a relayer FHEVM instance based on the URL and version.
 *
 * @param config - Configuration object
 * @returns A {@link RelayerV2Fhevm} instance
 * @throws {InvalidRelayerUrlError} If the URL is invalid
 */
export async function createRelayerFhevm(
  config: FhevmInstanceConfig,
): Promise<AbstractRelayerFhevm> {
  const resolved = parseRelayerUrl(config.relayerUrl);

  if (!resolved || (resolved.version as unknown) !== 2) {
    throw new InvalidRelayerUrlError({
      message: `Invalid relayerUrl: ${config.relayerUrl}`,
    });
  }

  return RelayerV2Fhevm.fromConfig({
    ...config,
    relayerVersionUrl: resolved.url,
  });
}
