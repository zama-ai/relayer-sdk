import { TFHECrs } from './TFHECrs';
import { TFHEPublicKey } from './TFHEPublicKey';
import type { PublicParams } from '../../sdk/encrypt';
import { assertIsRelayerV2GetResponseKeyUrl } from './types/RelayerV2GetResponseKeyUrl';
import { RelayerV2GetResponseKeyUrl } from './types/types';
import { isNonNullableRecordProperty } from '../../utils/record';

//const __KEY_URL_CACHE__: Record<string, RelayerV2PublicKey> = {};

export class RelayerV2PublicKey {
  private _crs2048: TFHECrs;
  private _publicKey: TFHEPublicKey;

  private constructor(params: { publicKey: TFHEPublicKey; crs2048: TFHECrs }) {
    this._publicKey = params.publicKey;
    this._crs2048 = params.crs2048;
  }

  static tryFromBytes(value: unknown) {
    if (!isNonNullableRecordProperty(value, 'publicParams')) {
      return null;
    }
    if (!TFHECrs.isPublicParams2048BytesType(value.publicParams)) {
      return null;
    }
    if (!isNonNullableRecordProperty(value, 'publicKey')) {
      return null;
    }
    if (!TFHEPublicKey.isKeyBytesType(value.publicKey)) {
      return null;
    }

    const publicKey = value.publicKey;
    const publicParams = value.publicParams;

    return RelayerV2PublicKey.fromBytes({
      publicKey,
      publicParams,
    });
  }

  static fromBytes(params: {
    publicKey: { data: Uint8Array; id: string };
    publicParams: PublicParams<Uint8Array>;
  }) {
    TFHECrs.assertIsPublicParams2048BytesType(
      params.publicParams,
      'arg.publicParams',
    );

    const publicKey: TFHEPublicKey = TFHEPublicKey.fromBytes(params.publicKey);

    const crs2048: TFHECrs = TFHECrs.fromBytes({
      id: params.publicParams[2048].publicParamsId,
      data: params.publicParams[2048].publicParams,
      bits: 2048,
    });

    return new RelayerV2PublicKey({ publicKey, crs2048 });
  }

  static async fromRelayerResponse(response: RelayerV2GetResponseKeyUrl) {
    try {
      assertIsRelayerV2GetResponseKeyUrl(
        response,
        'RelayerV2GetResponseKeyUrl',
      );

      const pub_key_0 = response.response.fheKeyInfo[0].fhePublicKey;
      const tfheCompactPublicKeyId = pub_key_0.dataId;
      const tfheCompactPublicKeyUrl = pub_key_0.urls[0];

      const crs_2048 = response.response.crs['2048'];
      const compactPkeCrs2048Id = crs_2048.dataId;
      const compactPkeCrs2048Url = crs_2048.urls[0];

      const publicKey: TFHEPublicKey = await TFHEPublicKey.fromUrl({
        id: tfheCompactPublicKeyId,
        srcUrl: tfheCompactPublicKeyUrl,
      });

      const crs: TFHECrs = await TFHECrs.fromUrl({
        id: compactPkeCrs2048Id,
        bits: 2048,
        srcUrl: compactPkeCrs2048Url,
      });

      return new RelayerV2PublicKey({ publicKey, crs2048: crs });
    } catch (e) {
      throw new Error('Impossible to fetch public key: wrong relayer url.', {
        cause: e,
      });
    }
  }

  public getTFHEPublicKey(): TFHEPublicKey {
    return this._publicKey;
  }

  public getTFHECrs(): TFHECrs {
    return this._crs2048;
  }

  public toBytes(): {
    publicKey: { data: Uint8Array; id: string };
    publicParams: PublicParams<Uint8Array>;
  } {
    return {
      publicKey: this._publicKey.toBytes(),
      publicParams: this._crs2048.toPublicParams2048Bytes(),
    };
  }
}
