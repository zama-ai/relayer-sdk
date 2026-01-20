import type { BytesHex, BytesHexNo0x } from '@base/types/primitives';
import type { FhevmInstanceOptions } from '../../types/relayer';
import type {
  RelayerInputProofPayload,
  RelayerInputProofResult,
  RelayerPublicDecryptPayload,
  RelayerPublicDecryptResult,
  RelayerUserDecryptPayload,
  RelayerDelegatedUserDecryptPayload,
  RelayerUserDecryptResult,
} from '../types/public-api';
import { fetchRelayerV1Post } from './fetchRelayerV1';
import {
  AbstractRelayerProvider,
  assertIsRelayerInputProofResult,
  assertIsRelayerPublicDecryptResult,
  assertIsRelayerUserDecryptResult,
} from '../AbstractRelayerProvider';

export class RelayerV1Provider extends AbstractRelayerProvider {
  public override get version(): number {
    return 1;
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

    const json = await fetchRelayerV1Post(
      'INPUT_PROOF',
      this.inputProofUrl,
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
    const json = (await fetchRelayerV1Post(
      'PUBLIC_DECRYPT',
      this.publicDecryptUrl,
      payload,
      options,
    )) as {
      response: Array<{ signatures: unknown; decrypted_value: unknown }>;
    };

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
    const json = await fetchRelayerV1Post(
      'USER_DECRYPT',
      this.userDecryptUrl,
      payload,
      options,
    );
    assertIsRelayerUserDecryptResult(
      json.response,
      'RelayerUserDecryptResult()',
    );
    return json.response;
  }

  public override async fetchPostDelegatedUserDecrypt(
    payload: RelayerDelegatedUserDecryptPayload,
    options?: FhevmInstanceOptions,
  ): Promise<RelayerUserDecryptResult> {
    throw new Error('Delegated user decrypt is not supported in Relayer V1');
  }
}
