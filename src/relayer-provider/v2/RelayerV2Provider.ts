import { Prettify } from '../../utils/types';
import { ensureError } from '../../errors/utils';
import {
  fetchRelayerGet,
  type RelayerPublicDecryptPayload,
  type RelayerUserDecryptPayload,
  type RelayerInputProofPayload,
  type RelayerFetchResponseJson,
} from '../../relayer/fetchRelayer';
import {
  AbstractRelayerProvider,
  RelayerProviderFetchOptions,
} from '../AbstractRelayerProvider';
import { RelayerV2GetKeyUrlInvalidResponseError } from './errors/RelayerV2GetKeyUrlError';
import {
  RelayerV2AsyncRequest,
  RelayerV2ProgressArgs,
} from './RelayerV2AsyncRequest';
import { assertIsRelayerV2GetResponseKeyUrl } from './types/RelayerV2GetResponseKeyUrl';
import type { RelayerV2GetResponseKeyUrl } from './types/types';
import type { FhevmInstanceOptions } from '../../config';

export class RelayerV2Provider extends AbstractRelayerProvider {
  constructor(relayerUrl: string) {
    super(relayerUrl);
  }

  public get version(): number {
    return 2;
  }

  public async fetchGetKeyUrl(): Promise<RelayerV2GetResponseKeyUrl> {
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

  public override async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: Prettify<RelayerProviderFetchOptions<RelayerV2ProgressArgs>>,
  ) {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: this.inputProof,
      payload,
      instanceOptions,
      ...fetchOptions,
    });
    const response = await request.run();
    return { response } as RelayerFetchResponseJson;
  }

  public override async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: Prettify<RelayerProviderFetchOptions<RelayerV2ProgressArgs>>,
  ) {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'PUBLIC_DECRYPT',
      url: this.publicDecrypt,
      payload,
      instanceOptions,
      ...fetchOptions,
    });
    const response = await request.run();
    return { response } as RelayerFetchResponseJson;
  }

  public override async fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    instanceOptions?: FhevmInstanceOptions,
    fetchOptions?: Prettify<RelayerProviderFetchOptions<RelayerV2ProgressArgs>>,
  ) {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'USER_DECRYPT',
      url: this.userDecrypt,
      payload,
      instanceOptions,
      ...fetchOptions,
    });
    const response = await request.run();
    return { response } as RelayerFetchResponseJson;
  }
}
