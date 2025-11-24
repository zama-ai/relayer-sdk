import { type Auth } from '../../auth';
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

  //   private async _fetchPost(
  //     url: string,
  //     payload: any,
  //     options?: { auth?: Auth },
  //   ) {
  //     const init = setAuth(
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(payload),
  //       } satisfies RequestInit,
  //       options?.auth,
  //     );

  //     const response = await fetch(url, init);

  //     switch (response.status) {
  //       // Queued
  //       // RelayerV2ResponseQueued
  //       case 202: {
  //         // response.json() errors:
  //         // 1. if body is already read (call json() 2 times)
  //         //    - TypeError: Body is unusable: Body has already been read
  //         // 2. if body is invalid JSON
  //         //    - SyntaxError: Unexpected end of JSON input
  //         //    - SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2) at JSON.parse (<anonymous>)
  //         const bodyJson = await response.json();
  //         assertIsRelayerV2ResponseQueued(bodyJson, 'body');
  //         const retry_after = Date.parse(bodyJson.result.retry_after);
  //         break;
  //       }
  //       // RelayerV2ResponseFailed
  //       // RelayerV2ApiPostError400
  //       // RelayerV2ApiPostError400WithDetails
  //       case 400: {
  //         break;
  //       }
  //       // RelayerV2ResponseFailed
  //       // RelayerV2ApiPostError429
  //       case 429: {
  //         break;
  //       }
  //       // RelayerV2ResponseFailed
  //       // RelayerV2ApiError500
  //       case 500: {
  //         break;
  //       }
  //       default: {
  //         // Unknown error
  //         throw new Error(`Unknown response.status=${response.status}`);
  //       }
  //     }

  //     // if (!response.ok) {
  //     //   await throwRelayerResponseError(relayerOperation, response);
  //     // }

  //     // let parsed;
  //     // try {
  //     //   parsed = await response.json();
  //     // } catch (e) {
  //     //   throwRelayerJSONError(relayerOperation, e);
  //     // }

  //     // try {
  //     //   assertIsRelayerFetchResponseJson(parsed);
  //     //   json = parsed;
  //     // } catch (e) {
  //     //   throwRelayerUnexpectedJSONError(relayerOperation, e);
  //     // }
  //   }

  public async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: {
      auth?: Auth;
    },
  ) {
    // await this._fetchPost(this.inputProof, payload, options);
    // return { response: {} } as RelayerFetchResponseJson;
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
