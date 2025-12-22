import type {
  FhevmInstanceOptions,
  RelayerInputProofResult,
  RelayerPublicDecryptResult,
  RelayerUserDecryptPayload,
  RelayerUserDecryptResult,
} from '../types/relayer';
import type {
  RelayerInputProofPayload,
  RelayerPublicDecryptPayload,
} from '../types/relayer';
import type { RelayerV1KeyUrlResponse } from './v1/types';
import {
  assertRecordBytes32HexArrayProperty,
  assertRecordBytes65HexArrayProperty,
  assertRecordBytesHexNo0xArrayProperty,
  assertRecordBytesHexNo0xProperty,
  assertRecordBytesHexProperty,
} from '../utils/bytes';
import { assertRecordStringProperty } from '../utils/string';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';

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
  public abstract fetchGetKeyUrl(): Promise<RelayerV1KeyUrlResponse>;
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
