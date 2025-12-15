import { SERIALIZED_SIZE_LIMIT_PK } from '../../constants';
import { assertRecordStringProperty } from '../../utils/string';
import { isNonNullableRecordProperty } from '../../utils/record';
import { assertUint8ArrayProperty, fetchBytes } from '../../utils/bytes';

type TfheCompactPublicKeyType = object;
type TFHEPublicKeyBytesType = { id: string; data: Uint8Array; srcUrl?: string };
type TFHEPublicKeyUrlType = { id: string; srcUrl: string };

export class TFHEPublicKey {
  private readonly _id: string;
  private readonly _tfheCompactPublicKey: TfheCompactPublicKeyType;
  private readonly _srcUrl?: string;

  private constructor(params: {
    id: string;
    tfheCompactPublicKey: TfheCompactPublicKeyType;
    srcUrl?: string;
  }) {
    this._id = params.id;
    this._tfheCompactPublicKey = params.tfheCompactPublicKey;
    this._srcUrl = params.srcUrl;
  }

  /*
    {
      id: string,
      data: Uint8Array,
      srcUrl?: string
    }
  */
  public static isKeyBytesType(
    value: unknown,
  ): value is TFHEPublicKeyBytesType {
    try {
      TFHEPublicKey.assertKeyBytesType(value, '');
      return true;
    } catch {
      return false;
    }
  }

  /*
    {
      id: string,
      srcUrl: string
    }
  */
  private static isKeyUrlType(value: unknown): value is TFHEPublicKeyUrlType {
    try {
      TFHEPublicKey.assertKeyUrlType(value, '');
      return true;
    } catch {
      return false;
    }
  }

  /*
    {
      id: string,
      data: Uint8Array,
      srcUrl?: string
    }
  */
  private static assertKeyBytesType(
    value: unknown,
    name: string,
  ): asserts value is TFHEPublicKeyBytesType {
    assertRecordStringProperty(value, 'id', name);
    assertUint8ArrayProperty(value, 'data', name);
    if (isNonNullableRecordProperty(value, 'srcUrl')) {
      assertRecordStringProperty(value, 'srcUrl', name);
    }
  }

  /*
    {
      id: string,
      srcUrl: string
    }
  */
  private static assertKeyUrlType(
    value: unknown,
    name: string,
  ): asserts value is TFHEPublicKeyUrlType {
    assertRecordStringProperty(value, 'id', name);
    assertRecordStringProperty(value, 'srcUrl', name);
  }

  public static async fromBytesOrUrl(
    params: TFHEPublicKeyBytesType | TFHEPublicKeyUrlType,
  ): Promise<TFHEPublicKey> {
    if (TFHEPublicKey.isKeyBytesType(params)) {
      return TFHEPublicKey._fromBytes(params);
    } else if (TFHEPublicKey.isKeyUrlType(params)) {
      return TFHEPublicKey._fromUrl(params);
    } else {
      throw new Error('Invalid public key (deserialization failed)');
    }
  }

  /*
    {
      id: string,
      data: Uint8Array,
      srcUrl?: string
    }
  */
  public static fromBytes(params: TFHEPublicKeyBytesType): TFHEPublicKey {
    try {
      TFHEPublicKey.assertKeyBytesType(params, 'arg');
      return TFHEPublicKey._fromBytes(params);
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
  }

  /*
    {
      id: string,
      data: Uint8Array,
      srcUrl?: string
    }
  */
  private static _fromBytes(params: TFHEPublicKeyBytesType): TFHEPublicKey {
    const _params = {
      tfheCompactPublicKey: TFHE.TfheCompactPublicKey.safe_deserialize(
        params.data,
        SERIALIZED_SIZE_LIMIT_PK,
      ),
      id: params.id,
      srcUrl: params.srcUrl,
    };

    return new TFHEPublicKey(_params);
  }

  /*
    {
      id: string,
      srcUrl: string
    }
  */
  public static async fromUrl(
    params: TFHEPublicKeyUrlType,
  ): Promise<TFHEPublicKey> {
    try {
      TFHEPublicKey.assertKeyUrlType(params, 'arg');
      return TFHEPublicKey._fromUrl(params);
    } catch (e) {
      throw new Error('Impossible to fetch public key: wrong relayer url.', {
        cause: e,
      });
    }
  }

  /*
    {
      id: string,
      srcUrl: string
    }
  */
  private static async _fromUrl(
    params: TFHEPublicKeyUrlType,
  ): Promise<TFHEPublicKey> {
    const tfheCompactPublicKeyBytes: Uint8Array = await fetchBytes(
      params.srcUrl,
    );

    return TFHEPublicKey.fromBytes({
      data: tfheCompactPublicKeyBytes,
      id: params.id,
      srcUrl: params.srcUrl,
    });
  }

  /*
    {
      id: string,
      data: Uint8Array,
      srcUrl?: string
    }
  */
  public toBytes(): TFHEPublicKeyBytesType {
    return {
      data: (this._tfheCompactPublicKey as any).safe_serialize(
        SERIALIZED_SIZE_LIMIT_PK,
      ),
      id: this._id,
      ...(this._srcUrl ? { srcUrl: this._srcUrl } : {}),
    };
  }

  /*
    { 
      publicKey: TFHE.TfheCompactPublicKey
      publicKeyId: string
    }   
  */
  public toPublicKeyWasm(): {
    publicKey: TfheCompactPublicKeyType;
    publicKeyId: string;
  } {
    return {
      publicKey: this._tfheCompactPublicKey,
      publicKeyId: this._id,
    };
  }

  /*
    { 
      publicKey: Uint8Array
      publicKeyId: string
    }   
  */
  public toPublicKeyBytes(): {
    publicKey: Uint8Array;
    publicKeyId: string;
  } {
    return {
      publicKey: this.toBytes().data,
      publicKeyId: this._id,
    };
  }
}
