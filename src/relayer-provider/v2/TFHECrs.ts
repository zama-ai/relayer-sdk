import type { PublicParams as PublicParams2048 } from '../../sdk/encrypt';
import { SERIALIZED_SIZE_LIMIT_CRS } from '../../constants';
import { assertRecordStringProperty } from '../../utils/string';
import {
  assertNonNullableRecordProperty,
  isNonNullableRecordProperty,
} from '../../utils/record';
import {
  assertUint8ArrayProperty,
  bytesToHexLarge,
  fetchBytes,
  hexToBytesFaster,
} from '../../utils/bytes';
import { assertRecordUintProperty } from '../../utils/uint';
import type { BytesHex } from '../../types/primitives';
import { TFHECrsError } from '../../errors/TFHECrsError';

type CompactPkeCrsType = object;
type TFHECrsBytesType = {
  id: string;
  data: Uint8Array;
  bits: number;
  srcUrl?: string;
};
type TFHECrsBytesHexType = {
  id: string;
  data: BytesHex;
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

  public get id() {
    return this._id;
  }
  public get bits() {
    return this._bits;
  }
  public get srcUrl() {
    return this._srcUrl;
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
  ): asserts value is PublicParams2048<Uint8Array> {
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
  ): value is PublicParams2048<Uint8Array> {
    try {
      TFHECrs.assertIsPublicParams2048BytesType(value, '');
      return true;
    } catch {
      return false;
    }
  }

  static async fromBytesOrUrl(
    params: PublicParams2048<Uint8Array> | TFHECrsBytesType | TFHECrsUrlType,
  ): Promise<TFHECrs> {
    if (TFHECrs.isKeyBytesType(params)) {
      return TFHECrs._fromBytes(params);
    } else if (TFHECrs.isPublicParams2048BytesType(params)) {
      return TFHECrs._fromPublicParamsBytes(params);
    } else if (TFHECrs.isKeyUrlType(params)) {
      return TFHECrs._fromUrl(params);
    } else {
      throw new TFHECrsError({
        message: 'Invalid public key (deserialization failed)',
      });
    }
  }

  /*
    {
      id: string;
      data: Uint8Array;
      bits: number;
      srcUrl?: string;
    }
  */
  public static fromBytes(params: TFHECrsBytesType): TFHECrs {
    try {
      TFHECrs.assertKeyBytesType(params, 'arg');
      return TFHECrs._fromBytes(params);
    } catch (e) {
      throw new TFHECrsError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
  }

  /*
    {
      id: string;
      data: BytesHex;
      bits: number;
      srcUrl?: string;
    }
  */
  public static fromBytesHex(params: TFHECrsBytesHexType): TFHECrs {
    let data;
    try {
      assertRecordStringProperty(params, 'data', 'arg');
      data = hexToBytesFaster(params.data, true /* strict */);
    } catch (e) {
      throw new TFHECrsError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
    return TFHECrs.fromBytes({
      id: params?.id,
      bits: params?.bits,
      srcUrl: params?.srcUrl,
      data,
    });
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

  public static fromPublicParamsBytes(params: PublicParams2048<Uint8Array>) {
    try {
      TFHECrs.assertIsPublicParams2048BytesType(params, 'arg');
      return TFHECrs._fromPublicParamsBytes(params);
    } catch (e) {
      throw new TFHECrsError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
  }

  public static fromBitsPublicParamsBytes(
    bits: number,
    params: {
      publicParams: Uint8Array;
      publicParamsId: string;
    },
  ) {
    if (bits === undefined) {
      throw new TFHECrsError({ message: 'Missing PublicParams bits format' });
    }
    if (bits !== 2048) {
      throw new TFHECrsError({
        message: `Unsupported PublicParams bits format '${bits}'`,
      });
    }

    try {
      assertRecordStringProperty(params, 'publicParamsId', `arg`);
      assertUint8ArrayProperty(params, 'publicParams', `arg`);
      return TFHECrs._fromPublicParamsBytes({
        2048: params,
      });
    } catch (e) {
      throw new TFHECrsError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
  }

  public static fromPublicParamsBytesHex(params: PublicParams2048<BytesHex>) {
    try {
      assertNonNullableRecordProperty(params, '2048', 'arg');
      assertRecordStringProperty(params['2048'], 'publicParamsId', `arg.2048`);
      assertRecordStringProperty(params['2048'], 'publicParams', `arg.2048`);
      return TFHECrs._fromPublicParamsBytes({
        2048: {
          publicParams: hexToBytesFaster(
            params['2048'].publicParams,
            true /* strict */,
          ),
          publicParamsId: params['2048'].publicParamsId,
        },
      });
    } catch (e) {
      throw new TFHECrsError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
  }

  private static _fromPublicParamsBytes(params: PublicParams2048<Uint8Array>) {
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
      throw new TFHECrsError({
        message: 'Impossible to fetch public key: wrong relayer url.',
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
      id: string,
      bits: number,
      data: BytesHex,
      srcUrl?: string
    }
  */
  public toBytesHex(): TFHECrsBytesHexType {
    return {
      data: bytesToHexLarge(
        (this._compactPkeCrs as any).safe_serialize(SERIALIZED_SIZE_LIMIT_CRS),
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
  public toPublicParams2048Wasm(): PublicParams2048<CompactPkeCrsType> {
    if (this._bits !== 2048) {
      throw new TFHECrsError({
        message: `Unsupported PublicParams bits format '2048'`,
      });
    }

    const pp: PublicParams2048<CompactPkeCrsType> = {
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
  public toPublicParams2048Bytes(): PublicParams2048<Uint8Array> {
    if (this._bits !== 2048) {
      throw new TFHECrsError({
        message: `Unsupported PublicParams bits format '2048'`,
      });
    }

    const pp: PublicParams2048<Uint8Array> = {
      2048: {
        publicParams: this.toBytes().data,
        publicParamsId: this._id,
      },
    };
    return pp;
  }

  /*
    {
      2048: {
        publicParamsId: string,
        publicParams: BytesHex
      }
    }
  */
  public toPublicParams2048BytesHex(): PublicParams2048<BytesHex> {
    if (this._bits === undefined) {
      throw new TFHECrsError({ message: 'Missing PublicParams bits format' });
    }
    if (this._bits !== 2048) {
      throw new TFHECrsError({
        message: `Unsupported PublicParams bits format '${this._bits}'`,
      });
    }

    const pp: PublicParams2048<BytesHex> = {
      2048: {
        publicParams: this.toBytesHex().data,
        publicParamsId: this._id,
      },
    };
    return pp;
  }

  //////////////////////////////////////////////////////////////////////////////
  // JSON
  //////////////////////////////////////////////////////////////////////////////

  /*
    {
      __type: 'TFHECrs',
      id: string,
      data: BytesHex,
      srcUrl?: string
    }
  */
  public toJSON(): TFHECrsBytesHexType & {
    __type: 'TFHECrs';
  } {
    return {
      __type: 'TFHECrs',
      ...this.toBytesHex(),
    };
  }

  public static fromJSON(json: unknown): TFHECrs {
    if ((json as any).__type !== 'TFHECrs') {
      throw new TFHECrsError({ message: 'Invalid TFHECrs JSON.' });
    }
    return TFHECrs.fromBytesHex(json as any);
  }
}
