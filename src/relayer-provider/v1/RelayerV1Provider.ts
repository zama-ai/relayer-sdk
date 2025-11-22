import type { Auth } from '../../auth';
import {
  fetchRelayerGet,
  fetchRelayerJsonRpcPost,
  type RelayerPublicDecryptPayload,
  type RelayerUserDecryptPayload,
  type RelayerInputProofPayload,
  type RelayerKeyUrlResponse,
} from '../../relayer/fetchRelayer';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';

export class RelayerV1Provider extends AbstractRelayerProvider {
  constructor(relayerUrl: string) {
    super(relayerUrl);
  }

  public get version(): number {
    return 1;
  }

  public async fetchGetKeyUrl(): Promise<RelayerKeyUrlResponse> {
    const response = await fetchRelayerGet('KEY_URL', this.keyUrl);
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
