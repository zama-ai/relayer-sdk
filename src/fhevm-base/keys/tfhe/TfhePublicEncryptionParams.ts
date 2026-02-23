import type {
  TfheCrs,
  TfhePublicEncryptionParams,
  TfhePublicEncryptionParamsBytes,
  TfhePublicKey,
} from '@fhevm-base/types/private';
import type {
  RelayerFetchOptions,
  RelayerLib,
  TFHELib,
} from '../../types/libs';

////////////////////////////////////////////////////////////////////////////////
// TfhePublicEncryptionParams
////////////////////////////////////////////////////////////////////////////////

class TfhePublicEncryptionParamsImpl implements TfhePublicEncryptionParams {
  readonly #crs: TfheCrs;
  readonly #publicKey: TfhePublicKey;

  constructor(params: {
    readonly publicKey: TfhePublicKey;
    readonly crs: TfheCrs;
  }) {
    this.#publicKey = Object.freeze({ ...params.publicKey });
    this.#crs = Object.freeze({ ...params.crs });
  }

  public get publicKey(): TfhePublicKey {
    return this.#publicKey;
  }

  public get crs(): TfheCrs {
    return this.#crs;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API: fetchTfhePublicEncryptionParams
////////////////////////////////////////////////////////////////////////////////

export async function fetchTfhePublicEncryptionParams(
  fhevm: {
    readonly relayerUrl: string;
    readonly libs: {
      readonly tfheLib: TFHELib;
      readonly relayerLib: RelayerLib;
    };
  },
  options?: RelayerFetchOptions,
): Promise<TfhePublicEncryptionParams> {
  const paramsBytes =
    await fhevm.libs.relayerLib.fetchTfhePublicEncryptionParams(
      fhevm.relayerUrl,
      options,
    );

  return deserializeTfhePublicEncryptionParams(fhevm, paramsBytes);
}

////////////////////////////////////////////////////////////////////////////////
// Public API: deserializeTfhePublicEncryptionParams
////////////////////////////////////////////////////////////////////////////////

export function deserializeTfhePublicEncryptionParams(
  fhevm: {
    readonly libs: {
      readonly tfheLib: TFHELib;
    };
  },
  paramsBytes: TfhePublicEncryptionParamsBytes,
): TfhePublicEncryptionParams {
  const paramsNative =
    fhevm.libs.tfheLib.deserializeTfhePublicEncryptionParams(paramsBytes);

  return new TfhePublicEncryptionParamsImpl({
    publicKey: paramsNative.publicKey,
    crs: paramsNative.crs,
  });
}

////////////////////////////////////////////////////////////////////////////////
// Public API: deserializeOrFetchTfhePublicEncryptionParams
////////////////////////////////////////////////////////////////////////////////

export async function deserializeOrFetchTfhePublicEncryptionParams(
  fhevm: {
    readonly relayerUrl: string;
    readonly libs: {
      readonly tfheLib: TFHELib;
      readonly relayerLib: RelayerLib;
    };
  },
  args: {
    readonly paramsBytes?: TfhePublicEncryptionParamsBytes;
    readonly options?: RelayerFetchOptions;
  },
): Promise<TfhePublicEncryptionParams> {
  if (args.paramsBytes != null) {
    try {
      return deserializeTfhePublicEncryptionParams(fhevm, args.paramsBytes);
    } catch {
      // Silent catch.
      // If the provided params are invalid, fall through to fetching from the relayer.
    }
  }

  return await _fetchTfhePublicEncryptionParamsWithCache(fhevm, args.options);
}

////////////////////////////////////////////////////////////////////////////////
// Public API: serializeTfhePublicEncryptionParams
////////////////////////////////////////////////////////////////////////////////

export function serializeTfhePublicEncryptionParams(
  fhevm: {
    readonly libs: {
      readonly tfheLib: TFHELib;
    };
  },
  params: TfhePublicEncryptionParams,
): TfhePublicEncryptionParamsBytes {
  return fhevm.libs.tfheLib.serializeTfhePublicEncryptionParams(params);
}

////////////////////////////////////////////////////////////////////////////////
// Caching
////////////////////////////////////////////////////////////////////////////////

// Cache promises to avoid race conditions when multiple concurrent calls
// are made before the first one completes
const publicEncryptionParamsCache = new Map<
  string,
  Promise<TfhePublicEncryptionParams>
>();

/**
 * Clears the TfhePublicEncryptionParams cache. Exported for testing purposes only.
 * @internal
 */
export function _clearTfhePublicEncryptionParamsCache(): void {
  publicEncryptionParamsCache.clear();
}

async function _fetchTfhePublicEncryptionParamsWithCache(
  fhevm: {
    readonly relayerUrl: string;
    readonly libs: {
      readonly tfheLib: TFHELib;
      readonly relayerLib: RelayerLib;
    };
  },
  options?: RelayerFetchOptions,
): Promise<TfhePublicEncryptionParams> {
  // 1. Check if already stored in cache
  const cached = publicEncryptionParamsCache.get(fhevm.relayerUrl);
  if (cached !== undefined) {
    return cached;
  }

  // 2. Create and cache the promise immediately to prevent race conditions
  const promise = fetchTfhePublicEncryptionParams(fhevm, options).catch(
    (err: unknown) => {
      // Remove from cache on failure so subsequent calls can retry
      publicEncryptionParamsCache.delete(fhevm.relayerUrl);
      throw err;
    },
  );

  publicEncryptionParamsCache.set(fhevm.relayerUrl, promise);

  return promise;
}
