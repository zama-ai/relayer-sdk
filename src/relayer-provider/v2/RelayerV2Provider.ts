import type {
  RelayerV2GetResponseKeyUrl,
  RelayerV2ProgressArgs,
  RelayerV2ResultInputProof,
  RelayerV2ResultUserDecrypt,
} from './types/types';
import type { RelayerV1KeyUrlResponse } from '../v1/types';
import type { Prettify } from '../../utils/types';
import type {
  FhevmInstanceOptions,
  RelayerInputProofPayload,
  RelayerInputProofResult,
  RelayerPublicDecryptPayload,
  RelayerPublicDecryptResult,
  RelayerUserDecryptPayload,
  RelayerUserDecryptResult,
} from '../../types/relayer';
import type { RelayerProviderFetchOptions } from '../AbstractRelayerProvider';
import { ensureError } from '../../errors/utils';
import { fetchRelayerV1Get } from '../v1/fetchRelayerV1';
import {
  AbstractRelayerProvider,
  assertIsRelayerInputProofResult,
  assertIsRelayerPublicDecryptResult,
  assertIsRelayerUserDecryptResult,
} from '../AbstractRelayerProvider';
import { RelayerV2GetKeyUrlInvalidResponseError } from './errors/RelayerV2GetKeyUrlError';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';
import {
  assertIsRelayerV2GetResponseKeyUrl,
  toRelayerV1KeyUrlResponse,
} from './types/RelayerV2GetResponseKeyUrl';

export class RelayerV2Provider extends AbstractRelayerProvider {
  constructor(relayerUrl: string) {
    super(relayerUrl);
  }

  public get version(): number {
    return 2;
  }

  public async fetchGetKeyUrlV2(): Promise<RelayerV2GetResponseKeyUrl> {
    const response = await fetchRelayerV1Get('KEY_URL', this.keyUrl);

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

  public async fetchGetKeyUrl(): Promise<RelayerV1KeyUrlResponse> {
    const response = await this.fetchGetKeyUrlV2();
    return toRelayerV1KeyUrlResponse(response);
  }

  public override async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: Prettify<
      FhevmInstanceOptions & RelayerProviderFetchOptions<RelayerV2ProgressArgs>
    >,
  ): Promise<RelayerInputProofResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: this.inputProof,
      payload,
      options,
    });
    const result = (await request.run()) as RelayerV2ResultInputProof;
    assertIsRelayerInputProofResult(result, 'fetchPostInputProof()');
    return result as RelayerInputProofResult;
  }

  public override async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: Prettify<
      FhevmInstanceOptions & RelayerProviderFetchOptions<RelayerV2ProgressArgs>
    >,
  ): Promise<RelayerPublicDecryptResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'PUBLIC_DECRYPT',
      url: this.publicDecrypt,
      payload,
      options,
    });
    const result = await request.run();
    assertIsRelayerPublicDecryptResult(result, 'fetchPostPublicDecrypt()');
    return result;
  }

  public override async fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    options?: Prettify<
      FhevmInstanceOptions & RelayerProviderFetchOptions<RelayerV2ProgressArgs>
    >,
  ): Promise<RelayerUserDecryptResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'USER_DECRYPT',
      url: this.userDecrypt,
      payload,
      options,
    });
    const result = (await request.run()) as RelayerV2ResultUserDecrypt;
    assertIsRelayerUserDecryptResult(result.result, 'fetchPostUserDecrypt()');
    return result.result;
  }
}
