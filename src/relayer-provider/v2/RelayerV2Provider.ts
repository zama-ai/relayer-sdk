import type {
  RelayerInputProofOptions,
  RelayerPublicDecryptOptions,
  RelayerUserDecryptOptions,
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
  constructor(relayerUrl: string) {
    super(relayerUrl);
  }

  public get version(): number {
    return 2;
  }

  public override async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: RelayerInputProofOptions,
  ): Promise<RelayerInputProofResult> {
    const request = new RelayerV2AsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: this.inputProof,
      payload,
      options,
    });
    const result = await request.run();
    assertIsRelayerInputProofResult(result, 'fetchPostInputProof()');
    return result as RelayerInputProofResult;
  }

  public override async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: RelayerPublicDecryptOptions,
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
    options?: RelayerUserDecryptOptions,
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
