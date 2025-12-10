import type { FhevmInstanceOptions } from '../config';
import type {
  RelayerFetchResponseJson,
  RelayerInputProofPayload,
  RelayerKeyUrlResponse,
  RelayerPublicDecryptPayload,
  RelayerUserDecryptPayload,
} from '../relayer/fetchRelayer';

export type RelayerProviderFetchOptions<T> = {
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
  public abstract fetchGetKeyUrl(): Promise<RelayerKeyUrlResponse>;
  public abstract fetchPostInputProof(
    payload: RelayerInputProofPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: RelayerProviderFetchOptions<unknown>,
  ): Promise<RelayerFetchResponseJson>;
  public abstract fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: RelayerProviderFetchOptions<unknown>,
  ): Promise<RelayerFetchResponseJson>;
  public abstract fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: RelayerProviderFetchOptions<unknown>,
  ): Promise<RelayerFetchResponseJson>;
}
