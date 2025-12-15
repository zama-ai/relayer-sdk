import { Prettify } from '../../utils/types';
import { ensureError } from '../../errors/utils';
import {
  fetchRelayerGet,
  type RelayerPublicDecryptPayload,
  type RelayerUserDecryptPayload,
  type RelayerInputProofPayload,
  RelayerKeyUrlResponse,
} from '../../relayer/fetchRelayer';
import {
  AbstractRelayerProvider,
  assertIsRelayerInputProofResult,
  assertIsRelayerPublicDecryptResult,
  assertIsRelayerUserDecryptResult,
  RelayerInputProofResult,
  RelayerProviderFetchOptions,
  RelayerPublicDecryptResult,
  RelayerUserDecryptResult,
} from '../AbstractRelayerProvider';
import { RelayerV2GetKeyUrlInvalidResponseError } from './errors/RelayerV2GetKeyUrlError';
import {
  RelayerV2AsyncRequest,
  RelayerV2ProgressArgs,
} from './RelayerV2AsyncRequest';
import {
  assertIsRelayerV2GetResponseKeyUrl,
  toRelayerKeyUrlResponse,
} from './types/RelayerV2GetResponseKeyUrl';
import type { FhevmInstanceOptions } from '../../config';
import {
  RelayerV2GetResponseKeyUrl,
  RelayerV2ResultInputProof,
  RelayerV2ResultUserDecrypt,
} from './types/types';

export class RelayerV2Provider extends AbstractRelayerProvider {
  constructor(relayerUrl: string) {
    super(relayerUrl);
  }

  public get version(): number {
    return 2;
  }

  public async fetchGetKeyUrlV2(): Promise<RelayerV2GetResponseKeyUrl> {
    const response = await fetchRelayerGet('KEY_URL', this.keyUrl);

    // Relayer error
    try {
      assertIsRelayerV2GetResponseKeyUrl(response, 'fetchGetKeyUrl()');
    } catch (e) {
      throw new RelayerV2GetKeyUrlInvalidResponseError({
        cause: ensureError(e),
      });
    }

    return response;
  }

  public async fetchGetKeyUrl(): Promise<RelayerKeyUrlResponse> {
    const response = await this.fetchGetKeyUrlV2();
    return toRelayerKeyUrlResponse(response);
  }

  public override async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: Prettify<RelayerProviderFetchOptions<RelayerV2ProgressArgs>>,
  ): Promise<RelayerInputProofResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: this.inputProof,
      payload,
      instanceOptions,
      ...fetchOptions,
    });
    const result = (await request.run()) as RelayerV2ResultInputProof;
    assertIsRelayerInputProofResult(result, 'fetchPostInputProof()');
    return result as RelayerInputProofResult;
  }

  public override async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: Prettify<RelayerProviderFetchOptions<RelayerV2ProgressArgs>>,
  ): Promise<RelayerPublicDecryptResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'PUBLIC_DECRYPT',
      url: this.publicDecrypt,
      payload,
      instanceOptions,
      ...fetchOptions,
    });
    const result = await request.run();
    assertIsRelayerPublicDecryptResult(result, 'fetchPostPublicDecrypt()');
    return result;
  }

  public override async fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: Prettify<RelayerProviderFetchOptions<RelayerV2ProgressArgs>>,
  ): Promise<RelayerUserDecryptResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'USER_DECRYPT',
      url: this.userDecrypt,
      payload,
      instanceOptions,
      ...fetchOptions,
    });
    const result = (await request.run()) as RelayerV2ResultUserDecrypt;
    assertIsRelayerUserDecryptResult(result.result, 'fetchPostUserDecrypt()');
    return result.result;
  }
}
