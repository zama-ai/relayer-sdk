import type { TFHEPkeUrlsType } from './types';
import type { FhevmPkeConfigType } from '../../types/relayer';
import type { PartialWithUndefined } from '@base/types/utils';
import { TFHEPkeCrs } from './TFHEPkeCrs';
import { TFHEPublicKey } from './TFHEPublicKey';
import { isRecordNonNullableProperty } from '@base/record';
import {
  assertIsFhevmPkeCrsByCapacityType,
  assertIsFhevmPublicKeyType,
  isFhevmPkeCrsByCapacityType,
  isFhevmPublicKeyType,
} from '../../types/relayer.guards';
import { TFHEError } from '../../errors/TFHEError';

////////////////////////////////////////////////////////////////////////////////
// TFHEPkeParams
////////////////////////////////////////////////////////////////////////////////

export class TFHEPkeParams {
  readonly #pkeCrs2048: TFHEPkeCrs;
  readonly #publicKey: TFHEPublicKey;

  private constructor(params: {
    publicKey: TFHEPublicKey;
    pkeCrs2048: TFHEPkeCrs;
  }) {
    this.#publicKey = params.publicKey;
    this.#pkeCrs2048 = params.pkeCrs2048;
  }

  //////////////////////////////////////////////////////////////////////////////
  // getters
  //////////////////////////////////////////////////////////////////////////////

  public getTFHEPublicKey(): TFHEPublicKey {
    return this.#publicKey;
  }

  public getTFHEPkeCrs(): TFHEPkeCrs {
    return this.#pkeCrs2048;
  }

  //////////////////////////////////////////////////////////////////////////////
  // fromFhevmConfig
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Attempts to create a {@link TFHEPkeParams} instance from a FHEVM public key
   * encryption (PKE) configuration.
   *
   * - Returns undefined if fhevmPkeConfig is incomplete (missing publicKey or publicParams)
   * - Throws if fhevmPkeConfig is provided but contains invalid data
   *
   * @param fhevmPkeConfig - a {@link FhevmPkeConfigType} configuration object to validate and parse
   * @returns A new {@link TFHEPkeParams} instance, or undefined if the config is incomplete
   * @throws {TFHEError} If the config contains invalid data
   */
  public static tryFromFhevmPkeConfig(
    fhevmPkeConfig: PartialWithUndefined<FhevmPkeConfigType>,
  ): TFHEPkeParams | undefined {
    if (!isRecordNonNullableProperty(fhevmPkeConfig, 'publicParams')) {
      return undefined;
    }
    if (!isFhevmPkeCrsByCapacityType(fhevmPkeConfig.publicParams)) {
      return undefined;
    }
    if (!isRecordNonNullableProperty(fhevmPkeConfig, 'publicKey')) {
      return undefined;
    }
    if (!isFhevmPublicKeyType(fhevmPkeConfig.publicKey)) {
      return undefined;
    }

    return TFHEPkeParams.fromFhevmPkeConfig({
      publicKey: fhevmPkeConfig.publicKey,
      publicParams: fhevmPkeConfig.publicParams,
    });
  }

  /**
   * Creates a {@link TFHEPkeParams} instance from a FHEVM public key encryption (PKE) configuration.
   *
   * Unlike {@link tryFromFhevmPkeConfig}, this method requires a complete configuration
   * and throws if the data is invalid.
   *
   * @param fhevmPkeConfig - a {@link FhevmPkeConfigType} configuration object
   * @returns A new {@link TFHEPkeParams} instance
   * @throws {TFHEError} If the config contains invalid data
   * @see {@link tryFromFhevmPkeConfig} for a non-throwing alternative
   */
  public static fromFhevmPkeConfig(
    fhevmPkeConfig: FhevmPkeConfigType,
  ): TFHEPkeParams {
    // FhevmPkeCrsByCapacityType is a 2048 capacity
    assertIsFhevmPkeCrsByCapacityType(
      fhevmPkeConfig.publicParams,
      'fhevmPkeConfig.publicParams',
    );
    assertIsFhevmPublicKeyType(
      fhevmPkeConfig.publicKey,
      'fhevmPkeConfig.publicKey',
    );

    const publicKey: TFHEPublicKey = TFHEPublicKey.fromBytes({
      id: fhevmPkeConfig.publicKey.id,
      bytes: fhevmPkeConfig.publicKey.data,
    });

    const crs2048: TFHEPkeCrs = TFHEPkeCrs.fromBytes({
      id: fhevmPkeConfig.publicParams[2048].publicParamsId,
      bytes: fhevmPkeConfig.publicParams[2048].publicParams,
      capacity: 2048,
    });

    return new TFHEPkeParams({
      publicKey,
      pkeCrs2048: crs2048,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // fetch
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Fetches the TFHE public key and PKE CRS from remote URLs and creates a {@link TFHEPkeParams} instance.
   *
   * @param urls - a {@link TFHEPkeUrlsType} Object containing the URLs to fetch
   * @returns A new {@link TFHEPkeParams} instance
   * @throws {TFHEError} If pkeCrs capacity is not 2048 or if fetching fails
   */
  static async fetch(urls: TFHEPkeUrlsType): Promise<TFHEPkeParams> {
    if (urls.pkeCrsUrl.capacity !== 2048) {
      throw new TFHEError({
        message: `Invalid pke crs capacity ${urls.pkeCrsUrl.capacity.toString()}. Expecting 2048.`,
      });
    }

    try {
      const publicKey: TFHEPublicKey = await TFHEPublicKey.fetch(
        urls.publicKeyUrl,
      );
      const pkeCrs: TFHEPkeCrs = await TFHEPkeCrs.fetch(urls.pkeCrsUrl);

      return new TFHEPkeParams({
        publicKey,
        pkeCrs2048: pkeCrs,
      });
    } catch (e) {
      throw new TFHEError({
        message: 'Impossible to fetch public key: wrong relayer url.',
        cause: e,
      });
    }
  }
}
