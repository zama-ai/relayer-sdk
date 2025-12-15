import {
  assertRecordBytes32HexArrayProperty,
  assertRecordBytes65HexArrayProperty,
  assertRecordBytesHexArrayProperty,
  assertRecordBytesHexNo0xProperty,
  assertRecordBytesHexProperty,
  BytesHex,
  BytesHexNo0x,
} from '../utils/bytes';
import type { FhevmInstanceOptions } from '../config';
import type {
  RelayerInputProofPayload,
  RelayerKeyUrlResponse,
  RelayerPublicDecryptPayload,
  RelayerUserDecryptPayload,
} from '../relayer/fetchRelayer';
import { assertRecordStringProperty } from '../utils/string';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';

export type RelayerProviderFetchOptions<T> = {
  signal?: AbortSignal;
  onProgress?: (args: T) => void;
};

export type RelayerPublicDecryptResult = {
  signatures: BytesHexNo0x[];
  decryptedValue: BytesHexNo0x;
  extraData: BytesHex;
};

/*
 * [
 *   {
 *     signature: '69e7e040cab157aa819015b321c012dccb1545ffefd325b359b492653f0347517e28e66c572cdc299e259024329859ff9fcb0096e1ce072af0b6e1ca1fe25ec6',
 *     payload: '0100000029...',
 *     extra_data: '01234...',
 *   }
 * ]
 */
export type RelayerUserDecryptResult = {
  payload: BytesHexNo0x;
  signature: BytesHexNo0x;
  //extraData: BytesHex;
}[];

export type RelayerV1UserDecryptResult = Array<{
  payload: BytesHexNo0x;
  signature: BytesHexNo0x;
  extraData: BytesHexNo0x;
}>;

export type RelayerInputProofResult = {
  // Ordered List of hex encoded handles with 0x prefix.
  handles: `0x${string}`[];
  // Attestation signatures for Input verification for the ordered list of handles with 0x prefix.
  signatures: `0x${string}`[];
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
  public abstract fetchGetKeyUrl(): Promise<RelayerKeyUrlResponse>;
  public abstract fetchPostInputProof(
    payload: RelayerInputProofPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: RelayerProviderFetchOptions<unknown>,
  ): Promise<RelayerInputProofResult>;
  public abstract fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: RelayerProviderFetchOptions<unknown>,
  ): Promise<RelayerPublicDecryptResult>;
  public abstract fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: RelayerProviderFetchOptions<unknown>,
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
  assertRecordBytesHexArrayProperty(value, 'signatures', name);
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
