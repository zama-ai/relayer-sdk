import type {
  TFHEPkeCrsBytesHexType,
  TFHEPkeCrsUrlType,
  TFHEPksCrsBytesType,
} from './types';
import { SERIALIZED_SIZE_LIMIT_CRS } from './constants';
import { assertRecordStringProperty } from '../../utils/string';
import { bytesToHexLarge, hexToBytesFaster } from '../../utils/bytes';
import { fetchBytes } from '../../utils/fetch';
import { TFHEError } from '../../errors/TFHEError';
import {
  assertIsTFHEPkeCrsUrlType,
  assertIsTFHEPksCrsBytesType,
} from '../../types/relayer.guards';

////////////////////////////////////////////////////////////////////////////////
// Public/Private types
////////////////////////////////////////////////////////////////////////////////

type CompactPkeCrsWasmType = object;

////////////////////////////////////////////////////////////////////////////////
// TFHEPkeCrs
//
// TFHE-rs: Pke (Public Key Encryption) CRS (Common Reference String)
// See: https://docs.zama.org/tfhe-rs/fhe-computation/advanced-features/zk-pok
////////////////////////////////////////////////////////////////////////////////

export class TFHEPkeCrs {
  #id: string = '';
  #tfheCompactPkeCrsWasm: CompactPkeCrsWasmType = {};
  #capacity: number = -1;
  #srcUrl?: string;

  private constructor() {}

  public get srcUrl() {
    return this.#srcUrl;
  }
  public get wasmClassName(): string {
    return (this.#tfheCompactPkeCrsWasm as any)?.constructor?.name;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API
  //////////////////////////////////////////////////////////////////////////////

  public supportsCapacity(capacity: number): boolean {
    return this.#capacity === capacity;
  }

  public getWasmForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    wasm: CompactPkeCrsWasmType;
  } {
    if (this.#capacity !== capacity) {
      throw new TFHEError({
        message: `Unsupported FHEVM PkeCrs capacity: ${capacity}`,
      });
    }

    return {
      capacity,
      id: this.#id,
      wasm: this.#tfheCompactPkeCrsWasm,
    };
  }

  public getBytesForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    bytes: Uint8Array;
  } {
    if (this.#capacity !== capacity) {
      throw new TFHEError({
        message: `Unsupported FHEVM PkeCrs capacity: ${capacity}`,
      });
    }

    return {
      capacity,
      id: this.#id,
      bytes: this.toBytes().bytes,
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: fromBytes
  //////////////////////////////////////////////////////////////////////////////

  public static fromBytes(params: TFHEPksCrsBytesType): TFHEPkeCrs {
    try {
      assertIsTFHEPksCrsBytesType(params, 'arg');
      return TFHEPkeCrs._fromBytes(params);
    } catch (e) {
      throw new TFHEError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
  }

  private static _fromBytesHex(params: TFHEPkeCrsBytesHexType): TFHEPkeCrs {
    let bytes;
    try {
      assertRecordStringProperty(
        params,
        'bytesHex' satisfies keyof TFHEPkeCrsBytesHexType,
        'arg',
      );
      bytes = hexToBytesFaster(params.bytesHex, { strict: true });
    } catch (e) {
      throw new TFHEError({
        message: 'Invalid public key (deserialization failed)',
        cause: e,
      });
    }
    return TFHEPkeCrs.fromBytes({
      id: params?.id,
      capacity: params?.capacity,
      srcUrl: params?.srcUrl,
      bytes,
    });
  }

  private static _fromBytes(params: TFHEPksCrsBytesType) {
    const crs = new TFHEPkeCrs();
    crs.#id = params.id;
    crs.#tfheCompactPkeCrsWasm = TFHE.CompactPkeCrs.safe_deserialize(
      params.bytes,
      SERIALIZED_SIZE_LIMIT_CRS,
    );
    crs.#capacity = params.capacity;
    crs.#srcUrl = params.srcUrl;

    return crs;
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: fetch
  //////////////////////////////////////////////////////////////////////////////

  public static async fetch(params: TFHEPkeCrsUrlType): Promise<TFHEPkeCrs> {
    try {
      assertIsTFHEPkeCrsUrlType(params, 'arg');
      return TFHEPkeCrs._fetch(params);
    } catch (e) {
      throw new TFHEError({
        message: 'Impossible to fetch public key: wrong relayer url.',
        cause: e,
      });
    }
  }

  private static async _fetch(params: TFHEPkeCrsUrlType): Promise<TFHEPkeCrs> {
    assertIsTFHEPkeCrsUrlType(params, 'arg');

    const compactPkeCrsBytes: Uint8Array = await fetchBytes(params.srcUrl);

    return TFHEPkeCrs.fromBytes({
      bytes: compactPkeCrsBytes,
      id: params.id,
      capacity: params.capacity,
      srcUrl: params.srcUrl,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: toBytes
  //////////////////////////////////////////////////////////////////////////////

  public toBytes(): TFHEPksCrsBytesType {
    return {
      bytes: (this.#tfheCompactPkeCrsWasm as any).safe_serialize(
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
      id: this.#id,
      capacity: this.#capacity,
      ...(this.#srcUrl ? { srcUrl: this.#srcUrl } : {}),
    };
  }

  private _toBytesHex(): TFHEPkeCrsBytesHexType {
    return {
      bytesHex: bytesToHexLarge(
        (this.#tfheCompactPkeCrsWasm as any).safe_serialize(
          SERIALIZED_SIZE_LIMIT_CRS,
        ),
      ),
      id: this.#id,
      capacity: this.#capacity,
      ...(this.#srcUrl ? { srcUrl: this.#srcUrl } : {}),
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // JSON
  //////////////////////////////////////////////////////////////////////////////

  /*
    {
      __type: 'TFHEPkeCrs',
      id: string,
      data: BytesHex,
      capacity: number,
      srcUrl?: string
    }
  */
  public toJSON(): TFHEPkeCrsBytesHexType & {
    __type: 'TFHEPkeCrs';
  } {
    return {
      __type: 'TFHEPkeCrs',
      ...this._toBytesHex(),
    };
  }

  public static fromJSON(json: unknown): TFHEPkeCrs {
    if ((json as any).__type !== 'TFHEPkeCrs') {
      throw new TFHEError({ message: 'Invalid TFHEPkeCrs JSON.' });
    }
    return TFHEPkeCrs._fromBytesHex(json as any);
  }
}
