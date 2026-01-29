import type { TFHEPkeUrlsType } from '@sdk/lowlevel/public-api';
import type { BytesHex } from '@base/types/primitives';
import type { RelayerGetResponseKeyUrlSnakeCase } from './types/private';
import type { ZKProof } from '@sdk/ZKProof';
import type {
  Auth,
  RelayerGetOperation,
  RelayerInputProofOptionsType,
  RelayerInputProofPayload,
  RelayerInputProofResult,
  RelayerPublicDecryptOptionsType,
  RelayerPublicDecryptPayload,
  RelayerPublicDecryptResult,
  RelayerUserDecryptOptionsType,
  RelayerUserDecryptPayload,
  RelayerDelegatedUserDecryptPayload,
  RelayerUserDecryptResult,
} from './types/public-api';
import { sdkName, version } from '../_version';
import {
  assertRecordBytes32HexArrayProperty,
  assertRecordBytes65HexArrayProperty,
  assertRecordBytesHexNo0xArrayProperty,
  assertRecordBytesHexNo0xProperty,
  assertRecordBytesHexProperty,
  bytesToHexNo0x,
} from '@base/bytes';
import { assertRecordStringProperty } from '@base/string';
import { ensureError } from '../errors/utils';
import { InternalError } from '../errors/InternalError';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { RelayerGetKeyUrlInvalidResponseError } from '../errors/RelayerGetKeyUrlError';
import {
  throwRelayerJSONError,
  throwRelayerResponseError,
  throwRelayerUnexpectedJSONError,
  throwRelayerUnknownError,
} from '../relayer/error';
import { setAuth } from './auth/auth';
import { TFHEPkeParams } from '@sdk/lowlevel/TFHEPkeParams';
import { FhevmHandle } from '@sdk/FhevmHandle';
import {
  assertIsRelayerGetResponseKeyUrlCamelCase,
  assertIsRelayerGetResponseKeyUrlSnakeCase,
  toRelayerGetResponseKeyUrlSnakeCase,
} from './AbstractRelayerGetResponseKeyUrl';
import { uintToHex } from '@base/uint';

////////////////////////////////////////////////////////////////////////////////

// Cache promises to avoid race conditions when multiple concurrent calls
// are made before the first one completes
const privateKeyurlCache = new Map<string, Promise<TFHEPkeParams>>();

/**
 * Clears the TFHEPkeParams cache. Exported for testing purposes only.
 * @internal
 */
export function _clearTFHEPkeParamsCache(): void {
  privateKeyurlCache.clear();
}

////////////////////////////////////////////////////////////////////////////////

export abstract class AbstractRelayerProvider {
  private readonly _relayerUrl: string;
  protected readonly _auth: Auth | undefined;

  constructor(relayerUrl: string, auth?: Auth) {
    this._relayerUrl = relayerUrl;
    this._auth = auth;
  }

  public get url(): string {
    return this._relayerUrl;
  }
  public get keyUrl(): string {
    return `${this.url}/keyurl`;
  }
  public get inputProofUrl(): string {
    return `${this.url}/input-proof`;
  }
  public get publicDecryptUrl(): string {
    return `${this.url}/public-decrypt`;
  }
  public get userDecryptUrl(): string {
    return `${this.url}/user-decrypt`;
  }
  public get delegatedUserDecryptUrl(): string {
    return `${this.url}/delegated-user-decrypt`;
  }

  public abstract get version(): number;

  /** @internal */
  public fetchTFHEPkeParams(): Promise<TFHEPkeParams> {
    const cached = privateKeyurlCache.get(this._relayerUrl);
    if (cached !== undefined) {
      return cached;
    }

    // Create and cache the promise immediately to prevent race conditions
    const promise = this._fetchTFHEPkeParamsImpl().catch((err: unknown) => {
      // Remove from cache on failure so subsequent calls can retry
      privateKeyurlCache.delete(this._relayerUrl);
      throw err;
    });

    privateKeyurlCache.set(this._relayerUrl, promise);

    return promise;
  }

  private async _fetchTFHEPkeParamsImpl(): Promise<TFHEPkeParams> {
    const urls = await this.fetchTFHEPkeUrls();
    return TFHEPkeParams.fetch(urls);
  }

  /** @internal */
  public async fetchTFHEPkeUrls(): Promise<TFHEPkeUrlsType> {
    const response = await this.fetchGetKeyUrl();

    const responseSnakeCase = toRelayerGetResponseKeyUrlSnakeCase(response);
    if (!responseSnakeCase) {
      throw new Error(`Invalid relayer key url response`);
    }

    const pubKey0 = responseSnakeCase.response.fhe_key_info[0].fhe_public_key;
    const tfheCompactPublicKeyId = pubKey0.data_id;
    const tfheCompactPublicKeyUrl = pubKey0.urls[0];

    const crs2048 = responseSnakeCase.response.crs['2048'];
    const compactPkeCrs2048Id = crs2048.data_id;
    const compactPkeCrs2048Url = crs2048.urls[0];

    return {
      publicKeyUrl: {
        id: tfheCompactPublicKeyId,
        srcUrl: tfheCompactPublicKeyUrl,
      },
      pkeCrsUrl: {
        capacity: 2048,
        id: compactPkeCrs2048Id,
        srcUrl: compactPkeCrs2048Url,
      },
    };
  }

  /** @internal */
  public async fetchGetKeyUrl(): Promise<RelayerGetResponseKeyUrlSnakeCase> {
    const response = await this._fetchRelayerGet('KEY_URL', this.keyUrl);

    let responseSnakeCase;

    if (this.version === 2) {
      // in v2 the response is CamelCase
      try {
        assertIsRelayerGetResponseKeyUrlCamelCase(response, 'fetchGetKeyUrl()');
        responseSnakeCase = toRelayerGetResponseKeyUrlSnakeCase(response);

        if (!responseSnakeCase) {
          throw new InternalError({
            message: 'Unable to convert fetchGetKeyUrl() to snake case.',
          });
        }
      } catch (e) {
        throw new RelayerGetKeyUrlInvalidResponseError({
          cause: ensureError(e),
        });
      }
    } else {
      // in v1 the response is SnakeCase
      responseSnakeCase = response;

      try {
        assertIsRelayerGetResponseKeyUrlSnakeCase(
          responseSnakeCase,
          'fetchGetKeyUrl()',
        );
      } catch (e) {
        throw new RelayerGetKeyUrlInvalidResponseError({
          cause: ensureError(e),
        });
      }
    }

    return responseSnakeCase;
  }

  /** @internal */
  public async fetchPostInputProofWithZKProof(
    params: { zkProof: ZKProof; extraData: BytesHex },
    options?: RelayerInputProofOptionsType,
  ): Promise<{ result: RelayerInputProofResult; fhevmHandles: FhevmHandle[] }> {
    const fhevmHandles: FhevmHandle[] = FhevmHandle.fromZKProof(params.zkProof);

    const result = await this.fetchPostInputProof(
      {
        contractAddress: params.zkProof.contractAddress,
        userAddress: params.zkProof.userAddress,
        ciphertextWithInputVerification: bytesToHexNo0x(
          params.zkProof.ciphertextWithZKProof,
        ),
        contractChainId: uintToHex(params.zkProof.chainId),
        extraData: params.extraData,
      },
      options,
    );

    // Note: this check is theoretically unecessary
    // We prefer to perform this test since we do not trust the relayer
    // The purpose is to check if the relayer is possibly malicious

    if (fhevmHandles.length !== result.handles.length) {
      throw new Error(
        `Incorrect Handles list sizes: (expected) ${fhevmHandles.length} != ${result.handles.length} (received)`,
      );
    }

    const relayerResultHandles = result.handles.map((h) =>
      FhevmHandle.fromBytes32Hex(h),
    );

    for (let i = 0; i < fhevmHandles.length; ++i) {
      if (!fhevmHandles[i].equals(relayerResultHandles[i])) {
        throw new Error(
          `Incorrect Handle ${i}: (expected) ${fhevmHandles[i].toBytes32Hex()} != ${relayerResultHandles[i].toBytes32Hex()} (received)`,
        );
      }
    }

    return {
      result,
      fhevmHandles,
    };
  }

  /** @internal */
  public abstract fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: RelayerInputProofOptionsType,
  ): Promise<RelayerInputProofResult>;

  /** @internal */
  public abstract fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: RelayerPublicDecryptOptionsType,
  ): Promise<RelayerPublicDecryptResult>;

  /** @internal */
  public abstract fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    options?: RelayerUserDecryptOptionsType,
  ): Promise<RelayerUserDecryptResult>;

  /** @internal */
  public abstract fetchPostDelegatedUserDecrypt(
    payload: RelayerDelegatedUserDecryptPayload,
    options?: RelayerUserDecryptOptionsType,
  ): Promise<RelayerUserDecryptResult>;

  /** @internal */
  private async _fetchRelayerGet(
    relayerOperation: RelayerGetOperation,
    url: string,
  ): Promise<{ response: unknown }> {
    const init = setAuth(
      {
        method: 'GET',
        headers: {
          'ZAMA-SDK-VERSION': version,
          'ZAMA-SDK-NAME': sdkName,
        },
      } satisfies RequestInit,
      this._auth,
    );

    let response: Response;
    let json: { response: unknown };
    try {
      response = await fetch(url, init);
    } catch (e) {
      throwRelayerUnknownError(relayerOperation, e);
    }

    if (!response.ok) {
      await throwRelayerResponseError(relayerOperation, response);
    }

    let parsed;
    try {
      parsed = (await response.json()) as unknown;
    } catch (e) {
      throwRelayerJSONError(relayerOperation, e, response);
    }

    try {
      _assertIsRelayerFetchResponseJson(parsed);
      json = parsed;
    } catch (e) {
      throwRelayerUnexpectedJSONError(relayerOperation, e);
    }

    return json;
  }
}

/** @internal */
export function assertIsRelayerInputProofResult(
  value: unknown,
  name: string,
): asserts value is RelayerInputProofResult {
  assertRecordBytes32HexArrayProperty(value, 'handles', name);
  assertRecordBytes65HexArrayProperty(value, 'signatures', name);
}

/** @internal */
export function assertIsRelayerPublicDecryptResult(
  value: unknown,
  name: string,
): asserts value is RelayerPublicDecryptResult {
  assertRecordBytesHexNo0xArrayProperty(value, 'signatures', name);
  assertRecordStringProperty(value, 'decryptedValue', name);
  assertRecordBytesHexProperty(value, 'extraData', name);
}

/** @internal */
export function assertIsRelayerUserDecryptResult(
  value: unknown,
  name: string,
): asserts value is RelayerUserDecryptResult {
  if (!Array.isArray(value)) {
    throw InvalidPropertyError.invalidObject({
      objName: name,
      expectedType: 'Array',
      type: typeof value,
    });
  }
  for (let i = 0; i < value.length; ++i) {
    // Missing extraData
    assertRecordBytesHexNo0xProperty(value[i], 'payload', `${name}[i]`);
    assertRecordBytesHexNo0xProperty(value[i], 'signature', `${name}[i]`);
  }
}

/** @internal */
function _assertIsRelayerFetchResponseJson(
  json: unknown,
): asserts json is { response: unknown } {
  if (json === undefined || json === null || typeof json !== 'object') {
    throw new Error('Unexpected response JSON.');
  }
  if (
    !(
      'response' in json &&
      json.response !== null &&
      json.response !== undefined
    )
  ) {
    throw new Error(
      "Unexpected response JSON format: missing 'response' property.",
    );
  }
}
