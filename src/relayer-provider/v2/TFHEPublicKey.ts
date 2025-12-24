import { SERIALIZED_SIZE_LIMIT_PK } from '../../constants';
import { assertRecordStringProperty } from '../../utils/string';
import { isNonNullableRecordProperty } from '../../utils/record';
import {
  assertUint8ArrayProperty,
  bytesToHexLarge,
  fetchBytes,
  hexToBytesFaster,
} from '../../utils/bytes';
import type { BytesHex } from '../../types/primitives';
import { TFHEPublicKeyError } from '../../errors/TFHEPublicKeyError';

type TfheCompactPublicKeyType = object;
type TFHEPublicKeyBytesType = { id: string; data: Uint8Array; srcUrl?: string };
type TFHEPublicKeyBytesHexType = {
  id: string;
  data: BytesHex;
  srcUrl?: string;
};
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

  public get id() {
    return this._id;
  }
  public get srcUrl() {
    return this._srcUrl;
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
      data: BytesHex,
      srcUrl?: string
    }
  */
  public static fromBytesHex(params: TFHEPublicKeyBytesHexType): TFHEPublicKey {
    let data;
    try {
      assertRecordStringProperty(params, 'data', 'arg');
      data = hexToBytesFaster(params.data, true /* strict */);
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
    return TFHEPublicKey.fromBytes({
      id: params?.id,
      srcUrl: params?.srcUrl,
      data,
    });
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
      id: string,
      data: BytesHex,
      srcUrl?: string
    }
  */
  public toBytesHex(): TFHEPublicKeyBytesHexType {
    return {
      data: bytesToHexLarge(
        (this._tfheCompactPublicKey as any).safe_serialize(
          SERIALIZED_SIZE_LIMIT_PK,
        ),
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

  /*
    { 
      publicKey: Uint8Array
      publicKeyId: string
    }   
  */
  public toPublicKeyBytesHex(): {
    publicKey: BytesHex;
    publicKeyId: string;
  } {
    return {
      publicKey: this.toBytesHex().data,
      publicKeyId: this._id,
    };
  }

  private static _fromPublicKeyBytes(params: {
    publicKey: Uint8Array;
    publicKeyId: string;
    srcUrl?: string;
  }) {
    return TFHEPublicKey._fromBytes({
      data: params.publicKey,
      id: params.publicKeyId,
      srcUrl: params.srcUrl,
    });
  }

  public static fromPublicKeyBytesHex(params: {
    publicKey: BytesHex;
    publicKeyId: string;
  }) {
    try {
      assertRecordStringProperty(params, 'publicKey', `arg`);
      assertRecordStringProperty(params, 'publicKeyId', `arg`);
      return TFHEPublicKey._fromPublicKeyBytes({
        publicKey: hexToBytesFaster(params.publicKey, true /* strict */),
        publicKeyId: params.publicKeyId,
      });
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
  }

  public static fromPublicKeyBytes(params: {
    publicKey: Uint8Array;
    publicKeyId: string;
    srcUrl?: string;
  }) {
    try {
      assertUint8ArrayProperty(params, 'publicKey', `arg`);
      assertRecordStringProperty(params, 'publicKeyId', `arg`);
      return TFHEPublicKey._fromPublicKeyBytes(params);
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // JSON
  //////////////////////////////////////////////////////////////////////////////

  /*
    {
      __type: 'TFHEPublicKey',
      id: string,
      data: BytesHex,
      srcUrl?: string
    }
  */
  public toJSON(): TFHEPublicKeyBytesHexType & {
    __type: 'TFHEPublicKey';
  } {
    return {
      __type: 'TFHEPublicKey',
      ...this.toBytesHex(),
    };
  }

  public static fromJSON(json: unknown): TFHEPublicKey {
    if ((json as any).__type !== 'TFHEPublicKey') {
      throw new TFHEPublicKeyError({ message: 'Invalid TFHEPublicKey JSON.' });
    }
    return TFHEPublicKey.fromBytesHex(json as any);
  }
}
