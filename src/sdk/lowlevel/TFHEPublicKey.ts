import { TFHE as TFHEModule } from './wasm-modules';
import type {
  TfheCompactPublicKeyWasmType,
  TFHEFetchParams,
  TFHEPublicKeyBytesHexType,
  TFHEPublicKeyBytesType,
  TFHEPublicKeyUrlType,
  TFHEPublicKeyWasmType,
} from './public-api';
import { bytesToHexLarge, hexToBytesFaster } from '@base/bytes';
import { fetchWithRetry, getResponseBytes } from '@base/fetch';
import { assertRecordStringProperty } from '@base/string';
import { TFHEError } from '../../errors/TFHEError';
import {
  assertIsTFHEPublicKeyBytesType,
  assertIsTFHEPublicKeyUrlType,
} from './guards';
import { SERIALIZED_SIZE_LIMIT_PK } from './constants';

////////////////////////////////////////////////////////////////////////////////
// TFHEPublicKey
////////////////////////////////////////////////////////////////////////////////

export class TFHEPublicKey {
  #id: string = '';
  #tfheCompactPublicKeyWasm!: TfheCompactPublicKeyWasmType;
  #srcUrl?: string | undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public get id(): string {
    return this.#id;
  }

  public get srcUrl(): string | undefined {
    return this.#srcUrl;
  }

  public get tfheCompactPublicKeyWasm(): TfheCompactPublicKeyWasmType {
    return this.#tfheCompactPublicKeyWasm;
  }

  public get wasmClassName(): string {
    return this.#tfheCompactPublicKeyWasm.constructor.name;
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: fromWasm
  //////////////////////////////////////////////////////////////////////////////

  public static fromWasm(params: TFHEPublicKeyWasmType): TFHEPublicKey {
    return this._fromWasm(params);
  }

  private static _fromWasm(params: TFHEPublicKeyWasmType): TFHEPublicKey {
    const pk = new TFHEPublicKey();

    pk.#id = params.id;
    pk.#tfheCompactPublicKeyWasm = params.wasm;
    pk.#srcUrl = params.srcUrl;

    return pk;
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
      bytes = hexToBytesFaster(params.bytesHex, { strict: true });
    } catch (e) {
      throw new TFHEError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
    return TFHEPublicKey.fromBytes({
      id: params.id,
      srcUrl: params.srcUrl,
      bytes,
    });
  }

  private static _fromBytes(params: TFHEPublicKeyBytesType): TFHEPublicKey {
    const pk = new TFHEPublicKey();

    pk.#id = params.id;
    pk.#tfheCompactPublicKeyWasm =
      TFHEModule.TfheCompactPublicKey.safe_deserialize(
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
    params: TFHEPublicKeyUrlType & TFHEFetchParams,
  ): Promise<TFHEPublicKey> {
    try {
      assertIsTFHEPublicKeyUrlType(params, 'arg');
      return await TFHEPublicKey.#fetch(params);
    } catch (e) {
      throw new TFHEError({
        message: 'Impossible to fetch public key: wrong relayer url.',
        cause: e,
      });
    }
  }

  static async #fetch(
    params: TFHEPublicKeyUrlType & TFHEFetchParams,
  ): Promise<TFHEPublicKey> {
    // Fetching a public key must use GET (the default method)
    if (params.init?.method !== undefined && params.init.method !== 'GET') {
      throw new TFHEError({
        message: `Invalid fetch method: expected 'GET', got '${params.init.method}'`,
      });
    }

    const response = await fetchWithRetry({
      url: params.srcUrl,
      ...(params.init !== undefined ? { init: params.init } : {}),
      ...(params.retries !== undefined ? { retries: params.retries } : {}),
      ...(params.retryDelayMs !== undefined
        ? { retryDelayMs: params.retryDelayMs }
        : {}),
    });

    if (!response.ok) {
      throw new TFHEError({
        message: `HTTP error! status: ${response.status} on ${response.url}`,
      });
    }

    const tfheCompactPublicKeyBytes: Uint8Array =
      await getResponseBytes(response);

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
      bytes: this.#tfheCompactPublicKeyWasm.safe_serialize(
        SERIALIZED_SIZE_LIMIT_PK,
      ),
      id: this.#id,
      ...(this.#srcUrl !== undefined ? { srcUrl: this.#srcUrl } : {}),
    };
  }

  private _toBytesHex(): TFHEPublicKeyBytesHexType {
    return {
      bytesHex: bytesToHexLarge(
        this.#tfheCompactPublicKeyWasm.safe_serialize(SERIALIZED_SIZE_LIMIT_PK),
      ),
      id: this.#id,
      ...(this.#srcUrl !== undefined ? { srcUrl: this.#srcUrl } : {}),
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
    const record = json as Record<string, unknown>;
    if (record.__type !== 'TFHEPublicKey') {
      throw new TFHEError({ message: 'Invalid TFHEPublicKey JSON.' });
    }
    return TFHEPublicKey._fromBytesHex(json as TFHEPublicKeyBytesHexType);
  }
}
