import { ensureError } from '../../errors/utils';
import { type Auth } from '../../auth';
import {
  fetchRelayerGet,
  type RelayerPublicDecryptPayload,
  type RelayerUserDecryptPayload,
  type RelayerInputProofPayload,
  type RelayerFetchResponseJson,
} from '../../relayer/fetchRelayer';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { RelayerV2GetKeyUrlInvalidResponseError } from './errors/RelayerV2GetKeyUrlError';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';
import { assertIsRelayerV2GetResponseKeyUrl } from './types/RelayerV2GetResponseKeyUrl';
import type { RelayerV2GetResponseKeyUrl } from './types/types';

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

  public async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: {
      auth?: Auth;
    },
  ) {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: this.inputProof,
      payload,
      options,
    });
    const response = await request.run();
    return { response } as RelayerFetchResponseJson;

    // await this._fetchPost(this.inputProof, payload, options);
    // return { response: {} } as RelayerFetchResponseJson;
    // const json = await fetchRelayerJsonRpcPost(
    //   'INPUT_PROOF',
    //   this.inputProof,
    //   payload,
    //   options,
    // );
    // return json;
  }

  public async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: {
      auth?: Auth;
    },
  ) {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'PUBLIC_DECRYPT',
      url: this.publicDecrypt,
      payload,
      options,
    });
    const response = await request.run();
    return { response } as RelayerFetchResponseJson;

    // const json = await fetchRelayerJsonRpcPost(
    //   'PUBLIC_DECRYPT',
    //   this.publicDecrypt,
    //   payload,
    //   options,
    // );
    // return json;
  }

  public async fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    options?: {
      auth?: Auth;
    },
  ) {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'USER_DECRYPT',
      url: this.userDecrypt,
      payload,
      options,
    });
    const response = await request.run();
    return { response } as RelayerFetchResponseJson;

    // const json = await fetchRelayerJsonRpcPost(
    //   'USER_DECRYPT',
    //   this.userDecrypt,
    //   payload,
    //   options,
    // );
    // return json;
  }
}
