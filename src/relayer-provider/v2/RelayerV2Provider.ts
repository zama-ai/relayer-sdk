import type { Auth } from '../../auth';
import {
  fetchRelayerGet,
  type RelayerPublicDecryptPayload,
  type RelayerUserDecryptPayload,
  type RelayerInputProofPayload,
  fetchRelayerJsonRpcPost,
} from '../../relayer/fetchRelayer';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
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
    try {
      assertIsRelayerV2GetResponseKeyUrl(response, 'fetchGetKeyUrl()');
    } catch (e) {
      throw new Error(
        `Unexpected response ${this.keyUrl}. ${(e as Error).message}`,
      );
    }
    return response;
  }

  public async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: {
      auth?: Auth;
    },
  ) {
    const json = await fetchRelayerJsonRpcPost(
      'INPUT_PROOF',
      this.inputProof,
      payload,
      options,
    );
    return json;
  }

  public async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: {
      auth?: Auth;
    },
  ) {
    const json = await fetchRelayerJsonRpcPost(
      'PUBLIC_DECRYPT',
      this.publicDecrypt,
      payload,
      options,
    );
    return json;
  }

  public async fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    options?: {
      auth?: Auth;
    },
  ) {
    const json = await fetchRelayerJsonRpcPost(
      'USER_DECRYPT',
      this.userDecrypt,
      payload,
      options,
    );
    return json;
  }
}
