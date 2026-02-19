import type {
  FetchUserDecryptResult,
  RelayerUserDecryptOptions,
} from '../types/public-api';
import type { FetchUserDecryptPayload } from '../types/private-api';
import { RelayerAsyncRequest } from './RelayerAsyncRequest';
import { removeSuffix } from '@base/string';

////////////////////////////////////////////////////////////////////////////////
// fetchUserDecrypt
////////////////////////////////////////////////////////////////////////////////

// export async function fetchUserDecrypt(
//   fhevm: { relayerUrl: string; config: FhevmConfig },
//   payload: FetchUserDecryptPayload,
//   options?: RelayerUserDecryptOptions,
// ): Promise<KmsSigncryptedShares> {
//   const request = new RelayerAsyncRequest({
//     relayerOperation: 'USER_DECRYPT',
//     url: `${removeSuffix(fhevm.relayerUrl, '/')}/user-decrypt`,
//     payload,
//     options,
//   });
//   const result = await request.run();

//   const metadata: KmsSigncryptedSharesMetadata = {
//     kmsVerifier: fhevm.config.kmsVerifier,
//     eip712Signature: ensure0x(payload.signature) as Bytes65Hex,
//     eip712SignerAddress: payload.userAddress,
//     fhevmHandles: payload.handleContractPairs.map((p) => {
//       return fhevmHandleBytes32HexToFhevmHandle(p.handle);
//     }),
//   };

//   return createKmsSigncryptedShares(metadata, result as FetchUserDecryptResult);
// }

export async function fetchUserDecrypt(
  relayerUrl: string,
  payload: FetchUserDecryptPayload,
  options?: RelayerUserDecryptOptions,
): Promise<FetchUserDecryptResult> {
  const request = new RelayerAsyncRequest({
    relayerOperation: 'USER_DECRYPT',
    url: `${removeSuffix(relayerUrl, '/')}/user-decrypt`,
    payload,
    options,
  });
  const result = await request.run();
  return result as FetchUserDecryptResult;
}
