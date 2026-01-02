import type {
  RelayerInputProofOptionsType,
  RelayerPublicDecryptOptionsType,
  RelayerUserDecryptOptionsType,
  RelayerInputProofPayload,
  RelayerInputProofResult,
  RelayerPublicDecryptPayload,
  RelayerPublicDecryptResult,
  RelayerUserDecryptPayload,
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
      url: this.inputProof,
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
      url: this.publicDecrypt,
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
      url: this.userDecrypt,
      payload,
      options,
    });
    const result = (await request.run()) as RelayerUserDecryptResult;
    assertIsRelayerUserDecryptResult(result, 'fetchPostUserDecrypt()');
    return result;
  }
}
