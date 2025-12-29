import type {
  RelayerV2ProgressArgs,
  RelayerV2ResultInputProof,
  RelayerV2ResultUserDecrypt,
} from './types/types';
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
import {
  AbstractRelayerProvider,
  assertIsRelayerInputProofResult,
  assertIsRelayerPublicDecryptResult,
  assertIsRelayerUserDecryptResult,
} from '../AbstractRelayerProvider';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';

export class RelayerV2Provider extends AbstractRelayerProvider {
  constructor(relayerUrl: string) {
    super(relayerUrl);
  }

  public get version(): number {
    return 2;
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
