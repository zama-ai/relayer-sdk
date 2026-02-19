import type {
  TFHEPkeParams,
  TFHEPkeCrsBytes,
  TFHEPublicKeyBytes,
} from '@sdk/lowlevel/public-api';
import {
  createTFHEPkeParams,
  fetchTFHEPkeParams,
} from '@sdk/lowlevel/keys/TFHEPkeParams';
import type { RelayerKeyUrlOptions } from './types/public-api';
import { fetchKeyUrl } from './fetch/keyUrl';

// Cache promises to avoid race conditions when multiple concurrent calls
// are made before the first one completes
const privateKeyUrlCache = new Map<string, Promise<TFHEPkeParams>>();

/**
 * Clears the TFHEPkeParams cache. Exported for testing purposes only.
 * @internal
 */
export function _clearTFHEPkeParamsCache(): void {
  privateKeyUrlCache.clear();
}

/**
 * Resolves the TFHE public key and PKE CRS parameters needed for encryption.
 *
 * If `tfhePkeParams` are provided, attempts to use them directly.
 * If they are missing or invalid, falls back to fetching them from the relayer
 * (with in-memory caching to avoid redundant network requests).
 *
 * @param args.relayerUrl - The base URL of the relayer API.
 * @param args.tfhePkeParams - Optional pre-supplied public key and PKE CRS bytes.
 *   When valid, avoids a network round-trip to the relayer.
 * @param args.options - Optional fetch settings (auth, signal, retry configuration).
 * @returns The resolved {@link TFHEPkeParams}.
 */
export async function keyUrl(args: {
  relayerUrl: string;
  tfhePkeParams?: {
    publicKey: TFHEPublicKeyBytes;
    pkeCrs: TFHEPkeCrsBytes & { capacity: 2048 };
  };
  options?: RelayerKeyUrlOptions;
}): Promise<TFHEPkeParams> {
  let tfhePkeParams;
  if (args.tfhePkeParams != null) {
    try {
      tfhePkeParams = createTFHEPkeParams(args.tfhePkeParams);
    } catch {
      // Silent catch.
      // If the provided params are invalid, fall through to fetching from the relayer.
    }
  }

  tfhePkeParams ??= await _fetchTFHEPkeParamsWithCache(
    args.relayerUrl,
    args.options,
  );

  return tfhePkeParams;
}

async function _fetchTFHEPkeParamsWithCache(
  relayerUrl: string,
  options?: RelayerKeyUrlOptions,
): Promise<TFHEPkeParams> {
  // 1. Check if already stored in cache
  const cached = privateKeyUrlCache.get(relayerUrl);
  if (cached !== undefined) {
    return cached;
  }

  // 2. Create and cache the promise immediately to prevent race conditions
  const promise = _fetchTFHEPkeParamsImpl(relayerUrl, options).catch(
    (err: unknown) => {
      // Remove from cache on failure so subsequent calls can retry
      privateKeyUrlCache.delete(relayerUrl);
      throw err;
    },
  );

  privateKeyUrlCache.set(relayerUrl, promise);

  return promise;
}

async function _fetchTFHEPkeParamsImpl(
  relayerUrl: string,
  options?: RelayerKeyUrlOptions,
): Promise<TFHEPkeParams> {
  const init: RequestInit | undefined =
    options?.signal !== undefined ? { signal: options.signal } : undefined;

  // 1. Ask the relayer for the URLs where the keys are hosted
  const tfhePkeUrls = await fetchKeyUrl(relayerUrl, options);

  // 2. Download the actual keys from those URLs
  return fetchTFHEPkeParams(tfhePkeUrls, {
    retries: options?.fetchRetries,
    retryDelayMs: options?.fetchRetryDelayInMilliseconds,
    init,
  });
}
