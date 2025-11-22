import type { PublicParams } from '../../sdk/encrypt';
import { SERIALIZED_SIZE_LIMIT_CRS } from '../../utils';
import { assertRecordStringProperty } from '../../utils/string';
import {
  assertNonNullableRecordProperty,
  isNonNullableRecordProperty,
} from '../../utils/record';
import { assertUint8ArrayProperty, fetchBytes } from '../../utils/bytes';
import { assertRecordUintProperty } from '../../utils/uint';

type CompactPkeCrsType = object;
type TFHECrsBytesType = {
  id: string;
  data: Uint8Array;
  bits: number;
  srcUrl?: string;
};
type TFHECrsUrlType = { id: string; bits: number; srcUrl: string };

export class TFHECrs {
  private readonly _id: string;
  private readonly _compactPkeCrs: CompactPkeCrsType;
  private readonly _bits: number;
  private readonly _srcUrl?: string;

  private constructor(params: {
    id: string;
    compactPkeCrs: CompactPkeCrsType;
    bits: number;
    srcUrl?: string;
  }) {
    this._id = params.id;
    this._compactPkeCrs = params.compactPkeCrs;
    this._bits = params.bits;
    this._srcUrl = params.srcUrl;
  }

  /*
    {
      id: string,
      data: Uint8Array,
      bits: number
      srcUrl?: string
    }
  */
  private static isKeyBytesType(value: unknown): value is TFHECrsBytesType {
    try {
      TFHECrs.assertKeyBytesType(value, '');
      return true;
    } catch {
      return false;
    }
  }

  /*
    {
      id: string,
      bits: number
      srcUrl: string
    }
  */
  private static isKeyUrlType(value: unknown): value is TFHECrsUrlType {
    try {
      TFHECrs.assertKeyUrlType(value, '');
      return true;
    } catch {
      return false;
    }
  }

  /*
    {
      id: string,
      data: Uint8Array,
      bits: number
      srcUrl?: string
    }
  */
  private static assertKeyBytesType(
    value: unknown,
    name: string,
  ): asserts value is TFHECrsBytesType {
    assertRecordStringProperty(value, 'id', name);
    assertUint8ArrayProperty(value, 'data', name);
    assertRecordUintProperty(value, 'bits', name);
    if (isNonNullableRecordProperty(value, 'srcUrl')) {
      assertRecordStringProperty(value, 'srcUrl', name);
    }
  }

  /*
    {
      id: string,
      bits: number
      srcUrl: string
    }
  */
  private static assertKeyUrlType(
    value: unknown,
    name: string,
  ): asserts value is TFHECrsUrlType {
    assertRecordStringProperty(value, 'id', name);
    assertRecordUintProperty(value, 'bits', name);
    assertRecordStringProperty(value, 'srcUrl', name);
  }

  /*
    {
      2048: {
        publicParamsId: string,
        publicParams: Uint8Array
      }
    }
  */
  public static assertIsPublicParams2048BytesType(
    value: unknown,
    name: string,
  ): asserts value is PublicParams<Uint8Array> {
    assertNonNullableRecordProperty(value, '2048', name);
    assertRecordStringProperty(value['2048'], 'publicParamsId', `${name}.2048`);
    assertUint8ArrayProperty(value['2048'], 'publicParams', `${name}.2048`);
  }

  /*
    {
      2048: {
        publicParamsId: string,
        publicParams: Uint8Array
      }
    }
  */
  public static isPublicParams2048BytesType(
    value: unknown,
  ): value is PublicParams<Uint8Array> {
    try {
      TFHECrs.assertIsPublicParams2048BytesType(value, '');
      return true;
    } catch {
      return false;
    }
  }

  static async fromBytesOrUrl(
    params: PublicParams<Uint8Array> | TFHECrsBytesType | TFHECrsUrlType,
  ): Promise<TFHECrs> {
    if (TFHECrs.isKeyBytesType(params)) {
      return TFHECrs._fromBytes(params);
    } else if (TFHECrs.isPublicParams2048BytesType(params)) {
      return TFHECrs._fromPublicParamsBytes(params);
    } else if (TFHECrs.isKeyUrlType(params)) {
      return TFHECrs._fromUrl(params);
    } else {
      throw new Error('Invalid public key (deserialization failed)');
    }
  }

  public static fromBytes(params: TFHECrsBytesType) {
    try {
      TFHECrs.assertKeyBytesType(params, 'arg');
      return TFHECrs._fromBytes(params);
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
  }

  private static _fromBytes(params: TFHECrsBytesType) {
    const _params = {
      compactPkeCrs: TFHE.CompactPkeCrs.safe_deserialize(
        params.data,
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
      id: params.id,
      bits: params.bits,
      srcUrl: params.srcUrl,
    };

    return new TFHECrs(_params);
  }

  public static fromPublicParamsBytes(params: PublicParams<Uint8Array>) {
    try {
      TFHECrs.assertIsPublicParams2048BytesType(params, 'arg');
      return TFHECrs._fromPublicParamsBytes(params);
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
  }

  private static _fromPublicParamsBytes(params: PublicParams<Uint8Array>) {
    return TFHECrs._fromBytes({
      bits: 2048,
      data: params['2048'].publicParams,
      id: params['2048'].publicParamsId,
    });
  }

  public static async fromUrl(params: TFHECrsUrlType): Promise<TFHECrs> {
    try {
      TFHECrs.assertKeyUrlType(params, 'arg');
      return TFHECrs._fromUrl(params);
    } catch (e) {
      throw new Error('Impossible to fetch public key: wrong relayer url.', {
        cause: e,
      });
    }
  }

  private static async _fromUrl(params: TFHECrsUrlType): Promise<TFHECrs> {
    TFHECrs.assertKeyUrlType(params, 'arg');

    const compactPkeCrsBytes: Uint8Array = await fetchBytes(params.srcUrl);

    return TFHECrs.fromBytes({
      data: compactPkeCrsBytes,
      id: params.id,
      bits: params.bits,
      srcUrl: params.srcUrl,
    });
  }

  /*
    {
      id: string,
      bits: number,
      data: Uint8Array,
      srcUrl?: string
    }
  */
  public toBytes(): TFHECrsBytesType {
    return {
      data: (this._compactPkeCrs as any).safe_serialize(
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
      id: this._id,
      bits: this._bits,
      ...(this._srcUrl ? { srcUrl: this._srcUrl } : {}),
    };
  }

  /*
    {
      2048: {
        publicParamsId: string,
        publicParams: TFHE.CompactPkeCrs
      }
    }
  */
  public toPublicParamsWasm(): PublicParams<CompactPkeCrsType> {
    if (this._bits !== 2048) {
      throw new Error(`Unsupported PublicParams bits format ${this._bits}`);
    }
    const pp: PublicParams<CompactPkeCrsType> = {
      2048: {
        publicParams: this._compactPkeCrs,
        publicParamsId: this._id,
      },
    };
    return pp;
  }

  /*
    {
      2048: {
        publicParamsId: string,
        publicParams: Uint8Array
      }
    }
  */
  public toPublicParamsBytes(): PublicParams<Uint8Array> {
    if (this._bits !== 2048) {
      throw new Error(`Unsupported PublicParams bits format ${this._bits}`);
    }

    const pp: PublicParams<Uint8Array> = {
      2048: {
        publicParams: this.toBytes().data,
        publicParamsId: this._id,
      },
    };
    return pp;
  }
}
