import { TFHE as TFHEModule } from '../wasm-modules';
import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import type {
  TfheCompactPublicKeyWasmType,
  TFHEFetchParams,
  TFHEPublicKeyBytesHex,
  TFHEPublicKeyBytes,
  TFHEPublicKeyUrl,
  TFHEPublicKeyWasmType,
  TFHEPublicKey,
} from '../public-api';
import {
  assertRecordUint8ArrayProperty,
  bytesToHexLarge,
  hexToBytesFaster,
} from '@base/bytes';
import { fetchWithRetry, getResponseBytes } from '@base/fetch';
import { assertRecordStringProperty } from '@base/string';
import { ensureError } from '@base/errors/utils';
import { isRecordNonNullableProperty } from '@base/record';
import { TFHEError } from '../../errors/TFHEError';
import { SERIALIZED_SIZE_LIMIT_PK } from '../constants';

////////////////////////////////////////////////////////////////////////////////
// TFHEPublicKey
////////////////////////////////////////////////////////////////////////////////

class TFHEPublicKeyImpl implements TFHEPublicKey {
  readonly #id: string;
  readonly #tfheCompactPublicKeyWasm: TfheCompactPublicKeyWasmType;
  readonly #srcUrl?: string | undefined;

  constructor(params: {
    id: string;
    tfheCompactPublicKeyWasm: TfheCompactPublicKeyWasmType;
    srcUrl?: string | undefined;
  }) {
    this.#id = params.id;
    this.#tfheCompactPublicKeyWasm = params.tfheCompactPublicKeyWasm;
    this.#srcUrl = params.srcUrl;
  }

  public get id(): string {
    return this.#id;
  }

  public get srcUrl(): string | undefined {
    return this.#srcUrl;
  }

  public get tfheCompactPublicKeyWasm(): TfheCompactPublicKeyWasmType {
    return this.#tfheCompactPublicKeyWasm;
  }

  //////////////////////////////////////////////////////////////////////////////
  // serialize/deserialize: toBytes
  //////////////////////////////////////////////////////////////////////////////

  public toBytes(): TFHEPublicKeyBytes {
    return {
      bytes: this.#tfheCompactPublicKeyWasm.safe_serialize(
        SERIALIZED_SIZE_LIMIT_PK,
      ),
      id: this.#id,
      ...(this.#srcUrl !== undefined ? { srcUrl: this.#srcUrl } : {}),
    };
  }

  private _toBytesHex(): TFHEPublicKeyBytesHex {
    const b = this.toBytes();
    return {
      bytesHex: bytesToHexLarge(b.bytes),
      id: b.id,
      ...(b.srcUrl !== undefined ? { srcUrl: b.srcUrl } : {}),
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
  public toJSON(): TFHEPublicKeyBytesHex & {
    __type: 'TFHEPublicKey';
  } {
    return {
      __type: 'TFHEPublicKey',
      ...this._toBytesHex(),
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export async function fetchTFHEPublicKey(
  params: TFHEPublicKeyUrl & TFHEFetchParams,
): Promise<TFHEPublicKey> {
  assertIsTFHEPublicKeyUrlType(params, 'arg', {});

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

  const tfheCompactPublicKeyBytes: Uint8Array =
    await getResponseBytes(response);

  return bytesToTFHEPublicKey({
    bytes: tfheCompactPublicKeyBytes,
    id: params.id,
    srcUrl: params.srcUrl,
  });
}

export function bytesToTFHEPublicKey(
  params: TFHEPublicKeyBytes,
): TFHEPublicKey {
  try {
    assertIsTFHEPublicKeyBytes(params, 'arg', {});
    return new TFHEPublicKeyImpl({
      id: params.id,
      tfheCompactPublicKeyWasm:
        TFHEModule.TfheCompactPublicKey.safe_deserialize(
          params.bytes,
          SERIALIZED_SIZE_LIMIT_PK,
        ),
      srcUrl: params.srcUrl,
    });
  } catch (e) {
    throw new TFHEError({
      message: 'Invalid public key (deserialization failed)',
      cause: ensureError(e),
    });
  }
}

export function bytesHexToTFHEPublicKey(
  params: TFHEPublicKeyBytesHex,
): TFHEPublicKey {
  let bytes;
  try {
    assertRecordStringProperty(
      params,
      'bytesHex' satisfies keyof TFHEPublicKeyBytesHex,
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
  return bytesToTFHEPublicKey({
    id: params.id,
    srcUrl: params.srcUrl,
    bytes,
  });
}

export function wasmToTFHEPublicKey(
  params: TFHEPublicKeyWasmType,
): TFHEPublicKey {
  return new TFHEPublicKeyImpl({
    ...params,
    tfheCompactPublicKeyWasm: params.wasm,
  });
}

export function jsonToTFHEPublicKey(json: unknown): TFHEPublicKey {
  const record = json as Record<string, unknown>;
  if (record.__type !== 'TFHEPublicKey') {
    throw new TFHEError({ message: 'Invalid TFHEPublicKey JSON.' });
  }
  return bytesHexToTFHEPublicKey(json as TFHEPublicKeyBytesHex);
}

////////////////////////////////////////////////////////////////////////////////
// Assert
////////////////////////////////////////////////////////////////////////////////

export function assertIsTFHEPublicKeyBytes(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is TFHEPublicKeyBytes {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPublicKeyBytes,
    name,
    options,
  );
  assertRecordUint8ArrayProperty(
    value,
    'bytes' satisfies keyof TFHEPublicKeyBytes,
    name,
    options,
  );
  if (
    isRecordNonNullableProperty(
      value,
      'srcUrl' satisfies keyof TFHEPublicKeyBytes,
    )
  ) {
    assertRecordStringProperty(
      value,
      'srcUrl' satisfies keyof TFHEPublicKeyBytes,
      name,
      options,
    );
  }
}

export function assertIsTFHEPublicKeyUrlType(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is TFHEPublicKeyUrl {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPublicKeyUrl,
    name,
    options,
  );
  assertRecordStringProperty(
    value,
    'srcUrl' satisfies keyof TFHEPublicKeyUrl,
    name,
    options,
  );
}
