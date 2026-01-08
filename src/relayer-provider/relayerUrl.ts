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
 * Parses a relayer URL and extracts or applies the API version.
 *
 * If the URL is not a Zama URL:
 *  - Returns the `relayerRouteVersion` if specified.
 *  - Otherwise returns the `fallbackVersion`.
 *
 * If the URL is a Zama URL:
 *  - If the URL ends with `/v1`, returns version 1 and the URL unchanged.
 *  - If the URL ends with `/v2`, returns version 2 and the URL unchanged.
 *  - If the URL does not end with a version suffix, appends the `relayerRouteVersion` if specified.
 *  - Otherwise, appends the `fallbackVersion` to the URL.
 *
 * Trailing slashes are removed from the URL before processing.
 *
 * @param relayerUrl - The relayer URL to parse
 * @param fallbackVersion - Version to use if URL doesn't specify one
 * @param relayerRouteVersion - Version to use if specified
 * @returns The normalized URL and version, or null if invalid
 */
export function parseRelayerUrl(
  relayerUrl: unknown,
  fallbackVersion: 1 | 2,
  relayerRouteVersion?: 1 | 2,
): { url: string; version: 1 | 2 } | null {
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
    if (relayerRouteVersion === 1 || relayerRouteVersion === 2) {
      return {
        url: urlNoSlash,
        version: relayerRouteVersion,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (fallbackVersion !== 1 && fallbackVersion !== 2) {
      return null;
    }

    return {
      url: urlNoSlash,
      version: fallbackVersion,
    };
  }

  if (urlNoSlash.endsWith('/v1')) {
    return {
      url: urlNoSlash,
      version: 1,
    };
  }

  if (urlNoSlash.endsWith('/v2')) {
    return {
      url: urlNoSlash,
      version: 2,
    };
  }

  let version: 1 | 2;
  if (relayerRouteVersion === 1 || relayerRouteVersion === 2) {
    version = relayerRouteVersion;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (fallbackVersion !== 1 && fallbackVersion !== 2) {
      return null;
    }
    version = fallbackVersion;
  }

  return {
    url: `${urlNoSlash}/v${version}`,
    version,
  };
}
