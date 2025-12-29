import type {
  TFHEPublicKeyBytesHexType,
  TFHEPublicKeyBytesType,
  TFHEPublicKeyUrlType,
} from './types';
import { bytesToHexLarge, hexToBytesFaster } from '../../utils/bytes';
import { fetchBytes } from '../../utils/fetch';
import { assertRecordStringProperty } from '../../utils/string';
import { TFHEError } from '../../errors/TFHEError';
import {
  assertIsTFHEPublicKeyBytesType,
  assertIsTFHEPublicKeyUrlType,
} from '../../types/relayer.guards';
import { SERIALIZED_SIZE_LIMIT_PK } from './constants';

////////////////////////////////////////////////////////////////////////////////
// Private types
////////////////////////////////////////////////////////////////////////////////

type TfheCompactPublicKeyType = object;

////////////////////////////////////////////////////////////////////////////////
// TFHEPublicKey
////////////////////////////////////////////////////////////////////////////////

export class TFHEPublicKey {
  #id: string = '';
  #tfheCompactPublicKeyWasm: TfheCompactPublicKeyType = {};
  #srcUrl?: string;

  private constructor() {}

  public get id() {
    return this.#id;
  }
  public get srcUrl() {
    return this.#srcUrl;
  }
  public get tfheCompactPublicKeyWasm() {
    return this.#tfheCompactPublicKeyWasm;
  }
  public get wasmClassName(): string {
    return (this.#tfheCompactPublicKeyWasm as any)?.constructor?.name;
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: fromBytes
  //////////////////////////////////////////////////////////////////////////////

  public static fromBytes(params: TFHEPublicKeyBytesType): TFHEPublicKey {
    try {
      assertIsTFHEPublicKeyBytesType(params, 'arg');
      return TFHEPublicKey._fromBytes(params);
    } catch (e) {
      throw new TFHEError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
  }

  private static _fromBytesHex(
    params: TFHEPublicKeyBytesHexType,
  ): TFHEPublicKey {
    let bytes;
    try {
      assertRecordStringProperty(
        params,
        'bytesHex' satisfies keyof TFHEPublicKeyBytesHexType,
        'arg',
      );
      bytes = hexToBytesFaster(params.bytesHex, true /* strict */);
    } catch (e) {
      throw new TFHEError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
    return TFHEPublicKey.fromBytes({
      id: params?.id,
      srcUrl: params?.srcUrl,
      bytes,
    });
  }

  private static _fromBytes(params: TFHEPublicKeyBytesType): TFHEPublicKey {
    const pk = new TFHEPublicKey();

    pk.#id = params.id;
    pk.#tfheCompactPublicKeyWasm = TFHE.TfheCompactPublicKey.safe_deserialize(
      params.bytes,
      SERIALIZED_SIZE_LIMIT_PK,
    );
    pk.#srcUrl = params.srcUrl;

    return pk;
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: fetch
  //////////////////////////////////////////////////////////////////////////////

  public static async fetch(
    params: TFHEPublicKeyUrlType,
  ): Promise<TFHEPublicKey> {
    try {
      assertIsTFHEPublicKeyUrlType(params, 'arg');
      return TFHEPublicKey._fetch(params);
    } catch (e) {
      throw new TFHEError({
        message: 'Impossible to fetch public key: wrong relayer url.',
        cause: e,
      });
    }
  }

  private static async _fetch(
    params: TFHEPublicKeyUrlType,
  ): Promise<TFHEPublicKey> {
    const tfheCompactPublicKeyBytes: Uint8Array = await fetchBytes(
      params.srcUrl,
    );

    return TFHEPublicKey.fromBytes({
      bytes: tfheCompactPublicKeyBytes,
      id: params.id,
      srcUrl: params.srcUrl,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: toBytes
  //////////////////////////////////////////////////////////////////////////////

  public toBytes(): TFHEPublicKeyBytesType {
    return {
      bytes: (this.#tfheCompactPublicKeyWasm as any).safe_serialize(
        SERIALIZED_SIZE_LIMIT_PK,
      ),
      id: this.#id,
      ...(this.#srcUrl ? { srcUrl: this.#srcUrl } : {}),
    };
  }

  private _toBytesHex(): TFHEPublicKeyBytesHexType {
    return {
      bytesHex: bytesToHexLarge(
        (this.#tfheCompactPublicKeyWasm as any).safe_serialize(
          SERIALIZED_SIZE_LIMIT_PK,
        ),
      ),
      id: this.#id,
      ...(this.#srcUrl ? { srcUrl: this.#srcUrl } : {}),
    };
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
      ...this._toBytesHex(),
    };
  }

  public static fromJSON(json: unknown): TFHEPublicKey {
    if ((json as any).__type !== 'TFHEPublicKey') {
      throw new TFHEError({ message: 'Invalid TFHEPublicKey JSON.' });
    }
    return TFHEPublicKey._fromBytesHex(json as any);
  }
}
