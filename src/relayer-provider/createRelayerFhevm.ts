import type { FhevmInstanceConfig } from '../types/relayer';
import type { AbstractRelayerFhevm } from './AbstractRelayerFhevm';
import { InvalidRelayerUrlError } from '../errors/InvalidRelayerUrlError';
import { parseRelayerUrl } from './relayerUrl';
import { RelayerV1Fhevm } from './v1/RelayerV1Fhevm';
import { RelayerV2Fhevm } from './v2/RelayerV2Fhevm';

/**
 * Creates a relayer FHEVM instance based on the URL and version.
 *
 * @param config - Configuration object
 * @param config.defaultRelayerVersion - Version to use if URL doesn't specify one
 * @returns A {@link RelayerV1Fhevm} or {@link RelayerV2Fhevm} instance
 * @throws {InvalidRelayerUrlError} If the URL is invalid
 */
export async function createRelayerFhevm(
  config: FhevmInstanceConfig & {
    defaultRelayerVersion: 1 | 2;
  },
): Promise<AbstractRelayerFhevm> {
  const resolved = parseRelayerUrl(
    config.relayerUrl,
    config.defaultRelayerVersion,
  );
  if (
    !resolved ||
    ((resolved.version as unknown) !== 1 && (resolved.version as unknown) !== 2)
  ) {
    throw new InvalidRelayerUrlError({
      message: `Invalid relayerUrl: ${config.relayerUrl}`,
    });
  }

  if (resolved.version === 2) {
    return RelayerV2Fhevm.fromConfig({
      ...config,
      relayerVersionUrl: resolved.url,
    });
  } else {
    return RelayerV1Fhevm.fromConfig({
      ...config,
      relayerVersionUrl: resolved.url,
    });
  }
}
