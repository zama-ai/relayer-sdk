import type { FhevmPkeConfigType } from '../types/relayer';
import type { Prettify } from '@base/types/utils';
import { InvalidRelayerUrlError } from '../errors/InvalidRelayerUrlError';
import { AbstractRelayerFhevm } from './AbstractRelayerFhevm';
import { parseRelayerUrl } from './relayerUrl';
import { RelayerV1Fhevm } from './v1/RelayerV1Fhevm';
import { RelayerV2Fhevm } from './v2/RelayerV2Fhevm';

/**
 * Creates a relayer FHEVM instance based on the URL and version.
 *
 * @param config - Configuration object
 * @param config.relayerUrl - The relayer API URL (may include `/v1` or `/v2` suffix)
 * @param config.defaultRelayerVersion - Version to use if URL doesn't specify one
 * @param config.publicKey - Optional TFHE public key (fetched from relayer if not provided)
 * @param config.publicParams - Optional TFHE public params (fetched from relayer if not provided)
 * @returns A {@link RelayerV1Fhevm} or {@link RelayerV2Fhevm} instance
 * @throws {InvalidRelayerUrlError} If the URL is invalid
 */
export async function createRelayerFhevm(
  config: Prettify<
    {
      relayerUrl: string;
      defaultRelayerVersion: 1 | 2;
    } & Partial<FhevmPkeConfigType>
  >,
): Promise<AbstractRelayerFhevm> {
  const resolved = parseRelayerUrl(
    config.relayerUrl,
    config.defaultRelayerVersion,
  );
  if (!resolved) {
    throw new InvalidRelayerUrlError({
      message: `Invalid relayerUrl: ${config.relayerUrl}`,
    });
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
    throw new InvalidRelayerUrlError({
      message: `Invalid relayerUrl: ${config.relayerUrl}`,
    });
  }
}
