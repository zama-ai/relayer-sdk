import { BytesHex, BytesHexNo0x } from '../../types/primitives';
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
    /*
    Expected v1 format:
    ===================
    {
      "response": {
        "handles": [
          "0xb0b1af7734450c2b7d944571af7e5b438cc62a2a26000000000000aa36a70400"
        ],
        "signatures": [
          "0x70dcb78534f05c4448d3441b4704d3ff4a8478af56a3464497533c2e3c476d77165b09028847f0c3ed4b342b1e8b4252a93b521a3d8d07b724bcff740383e1361b"
        ]
      }
    }
    */
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
