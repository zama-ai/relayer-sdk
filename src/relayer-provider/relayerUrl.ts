import { removeSuffix } from '@base/string';

/**
 * Parses a relayer URL and extracts or applies the API version.
 *
 * - If the URL ends with `/v1`, returns version 1 and the URL unchanged.
 * - If the URL ends with `/v2`, returns version 2 and the URL unchanged.
 * - Otherwise, appends the fallback version to the URL.
 *
 * Trailing slashes are removed from the URL before processing.
 *
 * @param relayerUrl - The relayer URL to parse
 * @param fallbackVersion - Version to use if URL doesn't specify one
 * @returns The normalized URL and version, or null if invalid
 */
export function parseRelayerUrl(
  relayerUrl: unknown,
  fallbackVersion: 1 | 2,
): { url: string; version: 1 | 2 } | null {
  if (!relayerUrl || typeof relayerUrl !== 'string') {
    return null;
  }

  const urlNoSlash = removeSuffix(relayerUrl, '/');
  if (!URL.canParse(urlNoSlash)) {
    return null;
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

  if (fallbackVersion !== 1 && fallbackVersion !== 2) {
    return null;
  }

  return {
    url: `${urlNoSlash}/v${fallbackVersion}`,
    version: fallbackVersion,
  };
}
