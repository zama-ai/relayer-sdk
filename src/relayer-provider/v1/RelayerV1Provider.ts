import type { BytesHex, BytesHexNo0x } from '../../utils/bytes';
import type { FhevmInstanceOptions } from '../../config';
import {
  fetchRelayerGet,
  fetchRelayerJsonRpcPost,
  type RelayerPublicDecryptPayload,
  type RelayerUserDecryptPayload,
  type RelayerInputProofPayload,
  type RelayerKeyUrlResponse,
} from '../../relayer/fetchRelayer';
import {
  AbstractRelayerProvider,
  assertIsRelayerInputProofResult,
  assertIsRelayerPublicDecryptResult,
  assertIsRelayerUserDecryptResult,
  RelayerInputProofResult,
  RelayerPublicDecryptResult,
  RelayerUserDecryptResult,
} from '../AbstractRelayerProvider';

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

  public override async fetchPostInputProof(
    payload: RelayerInputProofPayload,
    options?: FhevmInstanceOptions,
  ): Promise<RelayerInputProofResult> {
    const json = await fetchRelayerJsonRpcPost(
      'INPUT_PROOF',
      this.inputProof,
      payload,
      options,
    );
    assertIsRelayerInputProofResult(json.response, 'fetchPostInputProof()');
    return json.response;
  }

  public override async fetchPostPublicDecrypt(
    payload: RelayerPublicDecryptPayload,
    options?: FhevmInstanceOptions,
  ): Promise<RelayerPublicDecryptResult> {
    const json = await fetchRelayerJsonRpcPost(
      'PUBLIC_DECRYPT',
      this.publicDecrypt,
      payload,
      options,
    );
    const response = json.response[0];
    const result = {
      signatures: response.signatures as BytesHexNo0x[],
      decryptedValue: response.decrypted_value as BytesHexNo0x,
      extraData: '0x' as BytesHex,
    };
    assertIsRelayerPublicDecryptResult(result, 'fetchPostPublicDecrypt()');
    return result;
  }

  public override async fetchPostUserDecrypt(
    payload: RelayerUserDecryptPayload,
    options?: FhevmInstanceOptions,
  ): Promise<RelayerUserDecryptResult> {
    const json = await fetchRelayerJsonRpcPost(
      'USER_DECRYPT',
      this.userDecrypt,
      payload,
      options,
    );
    assertIsRelayerUserDecryptResult(
      json.response,
      'RelayerUserDecryptResult()',
    );
    return json.response;
  }
}
