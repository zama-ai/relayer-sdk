import type {
  TFHEPkeParams,
  TFHEPkeUrls,
  TFHEPkeCrsBytes,
  TFHEPublicKeyBytes,
  TFHEFetchParams,
} from '../public-api';
import type { TFHEPkeCrs, TFHEPublicKey } from '../public-api';
import { bytesToTFHEPublicKey, fetchTFHEPublicKey } from './TFHEPublicKey';
import { TFHEError } from '../../errors/TFHEError';
import { ensureError } from '@base/errors/utils';
import { bytesToTFHEPkeCrs, fetchTFHEPkeCrs } from './TFHEPkeCrs';

////////////////////////////////////////////////////////////////////////////////
// TFHEPkeParams
////////////////////////////////////////////////////////////////////////////////

class TFHEPkeParamsImpl implements TFHEPkeParams {
  readonly #pkeCrs2048: TFHEPkeCrs;
  readonly #publicKey: TFHEPublicKey;

  constructor(params: { publicKey: TFHEPublicKey; pkeCrs2048: TFHEPkeCrs }) {
    this.#publicKey = params.publicKey;
    this.#pkeCrs2048 = params.pkeCrs2048;
  }

  //////////////////////////////////////////////////////////////////////////////
  // getters
  //////////////////////////////////////////////////////////////////////////////

  public get tfhePublicKey(): TFHEPublicKey {
    return this.#publicKey;
  }

  public get tfhePkeCrs(): TFHEPkeCrs {
    return this.#pkeCrs2048;
  }
}

//////////////////////////////////////////////////////////////////////////////
// fetch
//////////////////////////////////////////////////////////////////////////////

/**
 * Fetches the TFHE public key and PKE CRS from remote URLs and creates a {@link TFHEPkeParams} instance.
 *
 * @param urls - a {@link TFHEPkeUrls} Object containing the URLs to fetch
 * @returns A new {@link TFHEPkeParams} instance
 * @throws A {@link TFHEError} if pkeCrs capacity is not 2048 or if fetching fails
 */
export async function fetchTFHEPkeParams(
  urls: TFHEPkeUrls,
  options?: TFHEFetchParams,
): Promise<TFHEPkeParams> {
  if (urls.pkeCrsUrl.capacity !== 2048) {
    throw new TFHEError({
      message: `Invalid pke crs capacity ${urls.pkeCrsUrl.capacity.toString()}. Expecting 2048.`,
    });
  }

  try {
    const publicKey: TFHEPublicKey = await fetchTFHEPublicKey({
      ...urls.publicKeyUrl,
      ...options,
    });
    const pkeCrs: TFHEPkeCrs = await fetchTFHEPkeCrs({
      ...urls.pkeCrsUrl,
      ...options,
    });

    return new TFHEPkeParamsImpl({
      publicKey,
      pkeCrs2048: pkeCrs,
    });
  } catch (e) {
    throw new TFHEError({
      message: 'Impossible to fetch public key: wrong relayer url.',
      cause: ensureError(e),
    });
  }
}

export function createTFHEPkeParams(params: {
  publicKey: TFHEPublicKeyBytes;
  pkeCrs: TFHEPkeCrsBytes & { capacity: 2048 };
}): TFHEPkeParams {
  const publicKey: TFHEPublicKey = bytesToTFHEPublicKey({
    id: params.publicKey.id,
    bytes: params.publicKey.bytes,
  });

  const pkeCrs2048: TFHEPkeCrs = bytesToTFHEPkeCrs({
    id: params.pkeCrs.id,
    bytes: params.pkeCrs.bytes,
    capacity: params.pkeCrs.capacity,
  });

  return new TFHEPkeParamsImpl({
    publicKey,
    pkeCrs2048,
  });
}
