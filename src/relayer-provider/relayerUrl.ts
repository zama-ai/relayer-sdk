import { removeSuffix } from '@base/string';
import {
  MainnetRelayerBaseUrl,
  MainnetRelayerUrlV1,
  MainnetRelayerUrlV2,
  SepoliaRelayerBaseUrl,
  SepoliaRelayerUrlV1,
  SepoliaRelayerUrlV2,
} from '../configs';

/**
 * Parses and normalizes a relayer URL to its canonical v2 form.
 *
 * Returns `null` if `relayerUrl` is not a string or is not a valid URL.
 * Trailing slashes are stripped before any processing.
 *
 * **Non-Zama URLs** (custom/self-hosted relayers):
 *  - Returned as-is (minus trailing slash) with `version: 2`.
 *
 * **Zama-hosted URLs** (Sepolia / Mainnet base, v1, or v2 URLs):
 *  - v1 URLs are upgraded to their v2 equivalents.
 *  - Base URLs (no version suffix) have `/v2` appended.
 *  - v2 URLs are returned unchanged.
 *
 * @param relayerUrl - The relayer URL to parse
 * @returns The normalized URL and `version: 2`, or `null` if the input is invalid
 */
export function parseRelayerUrl(
  relayerUrl: unknown,
): { url: string; version: 2 } | null {
  if (
    relayerUrl === undefined ||
    relayerUrl === null ||
    typeof relayerUrl !== 'string'
  ) {
    return null;
  }

  const urlNoSlash = removeSuffix(relayerUrl, '/');
  if (!URL.canParse(urlNoSlash)) {
    return null;
  }

  const zamaUrls = [
    SepoliaRelayerBaseUrl,
    SepoliaRelayerUrlV1,
    SepoliaRelayerUrlV2,
    MainnetRelayerBaseUrl,
    MainnetRelayerUrlV1,
    MainnetRelayerUrlV2,
  ];

  const isZamaUrl = zamaUrls.includes(urlNoSlash);
  if (!isZamaUrl) {
    return {
      url: urlNoSlash,
      version: 2,
    };
  }

  if (urlNoSlash === SepoliaRelayerUrlV1) {
    return {
      url: SepoliaRelayerUrlV2,
      version: 2,
    };
  }

  if (urlNoSlash === MainnetRelayerUrlV1) {
    return {
      url: MainnetRelayerUrlV2,
      version: 2,
    };
  }

  if (urlNoSlash.endsWith('/v2')) {
    return {
      url: urlNoSlash,
      version: 2,
    };
  }

  return {
    url: `${urlNoSlash}/v2`,
    version: 2,
  };
}
