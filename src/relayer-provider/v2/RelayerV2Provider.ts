import type {
  RelayerInputProofOptionsType,
  RelayerPublicDecryptOptionsType,
  RelayerUserDecryptOptionsType,
  RelayerInputProofPayload,
  RelayerInputProofResult,
  RelayerPublicDecryptPayload,
  RelayerPublicDecryptResult,
  RelayerUserDecryptPayload,
  RelayerDelegatedUserDecryptPayload,
  RelayerUserDecryptResult,
} from '../types/public-api';
import {
  AbstractRelayerProvider,
  assertIsRelayerInputProofResult,
  assertIsRelayerPublicDecryptResult,
  assertIsRelayerUserDecryptResult,
} from '../AbstractRelayerProvider';
import { RelayerV2AsyncRequest } from './RelayerV2AsyncRequest';

export class RelayerV2Provider extends AbstractRelayerProvider {
  public override get version(): number {
    return 2;
  }

  public override async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: RelayerInputProofOptionsType,
  ): Promise<RelayerInputProofResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: this.inputProofUrl,
      payload,
      options,
    });
    const result = await request.run();
    assertIsRelayerInputProofResult(result, 'fetchPostInputProof()');
    return result;
  }

  public override async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: RelayerPublicDecryptOptionsType,
  ): Promise<RelayerPublicDecryptResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'PUBLIC_DECRYPT',
      url: this.publicDecryptUrl,
      payload,
      options,
    });
    const result = (await request.run()) as RelayerPublicDecryptResult;
    assertIsRelayerPublicDecryptResult(result, 'fetchPostPublicDecrypt()');
    return result;
  }

  public override async fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    options?: RelayerUserDecryptOptionsType,
  ): Promise<RelayerUserDecryptResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'USER_DECRYPT',
      url: this.userDecryptUrl,
      payload,
      options,
    });
    const result = (await request.run()) as RelayerUserDecryptResult;
    assertIsRelayerUserDecryptResult(result, 'fetchPostUserDecrypt()');
    return result;
  }

  public override async fetchPostDelegatedUserDecrypt(
    payload: RelayerDelegatedUserDecryptPayload,
    options?: RelayerUserDecryptOptionsType,
  ): Promise<RelayerUserDecryptResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'DELEGATED_USER_DECRYPT',
      url: this.delegatedUserDecryptUrl,
      payload,
      options,
    });
    const result = await request.run();
    assertIsRelayerUserDecryptResult(result, 'fetchPostDelegatedUserDecrypt()');
    return result;
  }
}
