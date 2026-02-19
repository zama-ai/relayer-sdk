import type {
  FetchUserDecryptResult,
  RelayerUserDecryptOptions,
} from '../types/public-api';
import type {
  FetchDelegatedUserDecryptPayload,
  RelayerClient,
} from '../types/private-api';
import { RelayerAsyncRequest } from './RelayerAsyncRequest';
import { ensure0x, removeSuffix } from '@base/string';
import type { KmsSigncryptedSharesMetadata } from '@sdk/types/private';
import type { KmsSigncryptedShares } from '@sdk/types/public-api';
import type { Bytes65Hex } from '@base/types/primitives';
import { fhevmHandleBytes32HexToFhevmHandle } from '@fhevm-base/FhevmHandle';
import { createKmsSigncryptedShares } from '@sdk/kms/KmsSigncryptedShares';

////////////////////////////////////////////////////////////////////////////////
// fetchDelegatedUserDecrypt
////////////////////////////////////////////////////////////////////////////////

export async function fetchDelegatedUserDecrypt(
  relayerClient: RelayerClient,
  payload: FetchDelegatedUserDecryptPayload,
  options?: RelayerUserDecryptOptions,
): Promise<KmsSigncryptedShares> {
  const request = new RelayerAsyncRequest({
    relayerOperation: 'DELEGATED_USER_DECRYPT',
    url: `${removeSuffix(relayerClient.relayerUrl, '/')}/delegated-user-decrypt`,
    payload,
    options,
  });
  const result = await request.run();

  const metadata: KmsSigncryptedSharesMetadata = {
    kmsVerifier: relayerClient.fhevmConfig.kmsVerifier,
    eip712Signature: ensure0x(payload.signature) as Bytes65Hex,
    eip712SignerAddress: payload.delegateAddress,
    fhevmHandles: payload.handleContractPairs.map((p) => {
      return fhevmHandleBytes32HexToFhevmHandle(p.handle);
    }),
  };

  return createKmsSigncryptedShares(metadata, result as FetchUserDecryptResult);
}
