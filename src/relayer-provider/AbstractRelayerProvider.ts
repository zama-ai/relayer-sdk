import type { TFHEPkeUrlsType } from '../sdk/lowlevel/types';
import type {
  FhevmInstanceOptions,
  RelayerGetOperation,
  RelayerInputProofPayload,
  RelayerInputProofResult,
  RelayerPublicDecryptPayload,
  RelayerPublicDecryptResult,
  RelayerUserDecryptPayload,
  RelayerUserDecryptResult,
} from '../types/relayer';
import { sdkName, version } from '../_version';
import {
  assertRecordBytes32HexArrayProperty,
  assertRecordBytes65HexArrayProperty,
  assertRecordBytesHexNo0xArrayProperty,
  assertRecordBytesHexNo0xProperty,
  assertRecordBytesHexProperty,
} from '../utils/bytes';
import { assertRecordStringProperty } from '../utils/string';
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
import { TFHEPkeParams } from '../sdk/lowlevel/TFHEPkeParams';
import {
  assertIsRelayerGetResponseKeyUrlCamelCase,
  assertIsRelayerGetResponseKeyUrlSnakeCase,
  toRelayerGetResponseKeyUrlSnakeCase,
} from './AbstractRelayerGetResponseKeyUrl';
import { RelayerGetResponseKeyUrlSnakeCase } from './common-types';

export type RelayerProviderFetchOptions<T> = {
  timeout?: number;
  signal?: AbortSignal;
  onProgress?: (args: T) => void;
};

export abstract class AbstractRelayerProvider {
  private readonly _relayerUrl: string;

  constructor(relayerUrl: string) {
    this._relayerUrl = relayerUrl;
  }

  public get url(): string {
    return this._relayerUrl;
  }
  public get keyUrl(): string {
    return `${this.url}/keyurl`;
  }
  public get inputProof(): string {
    return `${this.url}/input-proof`;
  }
  public get publicDecrypt(): string {
    return `${this.url}/public-decrypt`;
  }
  public get userDecrypt(): string {
    return `${this.url}/user-decrypt`;
  }

  public abstract get version(): number;

  public async fetchTFHEPkeParams(): Promise<TFHEPkeParams> {
    const urls = await this.fetchTFHEPkeUrls();
    return await TFHEPkeParams.fetch(urls);
  }

  public async fetchTFHEPkeUrls(): Promise<TFHEPkeUrlsType> {
    const response = await this.fetchGetKeyUrl();

    const responseSnakeCase = toRelayerGetResponseKeyUrlSnakeCase(response);
    if (!responseSnakeCase) {
      throw new Error(`Invalid relayer key url response`);
    }

    const pub_key_0 = responseSnakeCase.response.fhe_key_info[0].fhe_public_key;
    const tfheCompactPublicKeyId = pub_key_0.data_id;
    const tfheCompactPublicKeyUrl = pub_key_0.urls[0];

    const crs_2048 = responseSnakeCase.response.crs['2048'];
    const compactPkeCrs2048Id = crs_2048.data_id;
    const compactPkeCrs2048Url = crs_2048.urls[0];

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

  // TODO: should be private
  public async fetchGetKeyUrl(): Promise<RelayerGetResponseKeyUrlSnakeCase> {
    const response = await AbstractRelayerProvider._fetchRelayerGet(
      'KEY_URL',
      this.keyUrl,
    );

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

  public abstract fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: FhevmInstanceOptions & RelayerProviderFetchOptions<any>,
  ): Promise<RelayerInputProofResult>;

  public abstract fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: FhevmInstanceOptions & RelayerProviderFetchOptions<any>,
  ): Promise<RelayerPublicDecryptResult>;

  public abstract fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    options?: FhevmInstanceOptions & RelayerProviderFetchOptions<any>,
  ): Promise<RelayerUserDecryptResult>;

  private static async _fetchRelayerGet(
    relayerOperation: RelayerGetOperation,
    url: string,
  ): Promise<{ response: any }> {
    const init = {
      method: 'GET',
      headers: {
        'ZAMA-SDK-VERSION': `${version}`,
        'ZAMA-SDK-NAME': `${sdkName}`,
      },
    } satisfies RequestInit;

    let response: Response;
    let json: { response: any };
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
      parsed = await response.json();
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

export function assertIsRelayerInputProofResult(
  value: unknown,
  name: string,
): asserts value is RelayerInputProofResult {
  assertRecordBytes32HexArrayProperty(value, 'handles', name);
  assertRecordBytes65HexArrayProperty(value, 'signatures', name);
}

export function assertIsRelayerPublicDecryptResult(
  value: unknown,
  name: string,
): asserts value is RelayerPublicDecryptResult {
  assertRecordBytesHexNo0xArrayProperty(value, 'signatures', name);
  assertRecordStringProperty(value, 'decryptedValue', name);
  assertRecordBytesHexProperty(value, 'extraData', name);
}

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

function _assertIsRelayerFetchResponseJson(
  json: any,
): asserts json is { response: any } {
  if (!json || typeof json !== 'object') {
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
