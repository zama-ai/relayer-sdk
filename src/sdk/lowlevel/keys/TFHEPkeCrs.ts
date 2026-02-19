import { TFHE as TFHEModule } from '../wasm-modules';
import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import type {
  TFHEFetchParams,
  TFHEPkeCrsBytesHex,
  TFHEPkeCrsUrl,
  TFHEPkeCrsBytes,
  TFHEPkeCrsWasmType,
} from '../public-api';
import type { CompactPkeCrsWasmType, TFHEPkeCrs } from '../public-api';
import { assertRecordStringProperty } from '@base/string';
import {
  assertRecordUint8ArrayProperty,
  bytesToHexLarge,
  hexToBytesFaster,
} from '@base/bytes';
import { fetchWithRetry, getResponseBytes } from '@base/fetch';
import { ensureError } from '@base/errors/utils';
import { assertRecordUintProperty } from '@base/uint';
import { isRecordNonNullableProperty } from '@base/record';
import { SERIALIZED_SIZE_LIMIT_CRS } from '../constants';
import { TFHEError } from '../../errors/TFHEError';

////////////////////////////////////////////////////////////////////////////////
// TFHEPkeCrs
//
// TFHE-rs: Pke (Public Key Encryption) CRS (Common Reference String)
// See: https://docs.zama.org/tfhe-rs/fhe-computation/advanced-features/zk-pok
////////////////////////////////////////////////////////////////////////////////

class TFHEPkeCrsImpl implements TFHEPkeCrs {
  readonly #id: string;
  readonly #tfheCompactPkeCrsWasm: CompactPkeCrsWasmType;
  readonly #capacity: number;
  readonly #srcUrl?: string | undefined;

  constructor(params: {
    id: string;
    tfheCompactPkeCrsWasm: CompactPkeCrsWasmType;
    capacity: number;
    srcUrl?: string | undefined;
  }) {
    this.#id = params.id;
    this.#capacity = params.capacity;
    this.#tfheCompactPkeCrsWasm = params.tfheCompactPkeCrsWasm;
    this.#srcUrl = params.srcUrl;
  }

  public get id(): string {
    return this.#id;
  }

  public get srcUrl(): string | undefined {
    return this.#srcUrl;
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
        message: `Unsupported FHEVM PkeCrs capacity: ${String(capacity)}`,
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
        message: `Unsupported FHEVM PkeCrs capacity: ${String(capacity)}`,
      });
    }

    return {
      capacity,
      id: this.#id,
      bytes: this.toBytes().bytes,
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: toBytes
  //////////////////////////////////////////////////////////////////////////////

  public toBytes(): TFHEPkeCrsBytes {
    return {
      bytes: this.#tfheCompactPkeCrsWasm.safe_serialize(
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
      id: this.#id,
      capacity: this.#capacity,
      ...(this.#srcUrl !== undefined ? { srcUrl: this.#srcUrl } : {}),
    };
  }

  private _toBytesHex(): TFHEPkeCrsBytesHex {
    const b = this.toBytes();
    return {
      bytesHex: bytesToHexLarge(b.bytes),
      id: b.id,
      capacity: b.capacity,
      ...(b.srcUrl !== undefined ? { srcUrl: b.srcUrl } : {}),
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
  public toJSON(): TFHEPkeCrsBytesHex & {
    __type: 'TFHEPkeCrs';
  } {
    return {
      __type: 'TFHEPkeCrs',
      ...this._toBytesHex(),
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export async function fetchTFHEPkeCrs(
  params: TFHEPkeCrsUrl & TFHEFetchParams,
): Promise<TFHEPkeCrs> {
  assertIsTFHEPkeCrsUrl(params, 'arg', {});
  // Fetching a public key must use GET (the default method)
  if (params.init?.method !== undefined && params.init.method !== 'GET') {
    throw new TFHEError({
      message: `Invalid fetch method: expected 'GET', got '${params.init.method}'`,
    });
  }

  const response = await fetchWithRetry({
    url: params.srcUrl,
    init: params.init,
    retries: params.retries,
    retryDelayMs: params.retryDelayMs,
  });
  if (!response.ok) {
    throw new TFHEError({
      message: `HTTP error! status: ${response.status} on ${response.url}`,
    });
  }

  const compactPkeCrsBytes: Uint8Array = await getResponseBytes(response);

  return bytesToTFHEPkeCrs({
    bytes: compactPkeCrsBytes,
    id: params.id,
    capacity: params.capacity,
    srcUrl: params.srcUrl,
  });
}

export function bytesToTFHEPkeCrs(params: TFHEPkeCrsBytes): TFHEPkeCrs {
  try {
    assertIsTFHEPkeCrsBytes(params, 'arg', {});
    return new TFHEPkeCrsImpl({
      id: params.id,
      srcUrl: params.srcUrl,
      capacity: params.capacity,
      tfheCompactPkeCrsWasm: TFHEModule.CompactPkeCrs.safe_deserialize(
        params.bytes,
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
    });
  } catch (e) {
    throw new TFHEError({
      message: 'Invalid public key (deserialization failed)',
      cause: ensureError(e),
    });
  }
}

export function bytesHexToTFHEPkeCrs(params: TFHEPkeCrsBytesHex): TFHEPkeCrs {
  let bytes;
  try {
    assertRecordStringProperty(
      params,
      'bytesHex' satisfies keyof TFHEPkeCrsBytesHex,
      'arg',
      {},
    );
    bytes = hexToBytesFaster(params.bytesHex, { strict: true });
  } catch (e) {
    throw new TFHEError({
      message: 'Invalid public key (deserialization failed)',
      cause: ensureError(e),
    });
  }
  return bytesToTFHEPkeCrs({
    id: params.id,
    capacity: params.capacity,
    srcUrl: params.srcUrl,
    bytes,
  });
}

export function wasmToTFHEPkeCrs(params: TFHEPkeCrsWasmType): TFHEPkeCrs {
  return new TFHEPkeCrsImpl({
    ...params,
    tfheCompactPkeCrsWasm: params.wasm,
  });
}

export function jsonToTFHEPkeCrs(json: unknown): TFHEPkeCrs {
  const record = json as Record<string, unknown>;
  if (record.__type !== 'TFHEPkeCrs') {
    throw new TFHEError({ message: 'Invalid TFHEPkeCrs JSON.' });
  }
  return bytesHexToTFHEPkeCrs(json as TFHEPkeCrsBytesHex);
}

////////////////////////////////////////////////////////////////////////////////
// Asserts
////////////////////////////////////////////////////////////////////////////////

export function assertIsTFHEPkeCrsUrl(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is TFHEPkeCrsUrl {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPkeCrsUrl,
    name,
    options,
  );
  assertRecordUintProperty(
    value,
    'capacity' satisfies keyof TFHEPkeCrsUrl,
    name,
    options,
  );
  assertRecordStringProperty(
    value,
    'srcUrl' satisfies keyof TFHEPkeCrsUrl,
    name,
    options,
  );
}

export function assertIsTFHEPkeCrsBytes(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is TFHEPkeCrsBytes {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPkeCrsBytes,
    name,
    options,
  );
  assertRecordUint8ArrayProperty(
    value,
    'bytes' satisfies keyof TFHEPkeCrsBytes,
    name,
    options,
  );
  assertRecordUintProperty(
    value,
    'capacity' satisfies keyof TFHEPkeCrsBytes,
    name,
    options,
  );
  if (
    isRecordNonNullableProperty(value, 'srcUrl' satisfies keyof TFHEPkeCrsBytes)
  ) {
    assertRecordStringProperty(
      value,
      'srcUrl' satisfies keyof TFHEPkeCrsBytes,
      name,
      options,
    );
  }
}
