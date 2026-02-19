import type {
  FetchPublicDecryptResult,
  RelayerPublicDecryptOptions,
} from '../types/public-api';
import type { FetchPublicDecryptPayload } from '../types/private-api';
import { RelayerAsyncRequest } from './RelayerAsyncRequest';
import { removeSuffix } from '@base/string';

////////////////////////////////////////////////////////////////////////////////
// fetchPublicDecrypt
////////////////////////////////////////////////////////////////////////////////

export async function fetchPublicDecrypt(
  relayerUrl: string,
  payload: FetchPublicDecryptPayload,
  options?: RelayerPublicDecryptOptions,
): Promise<FetchPublicDecryptResult> {
  const request = new RelayerAsyncRequest({
    relayerOperation: 'PUBLIC_DECRYPT',
    url: `${removeSuffix(relayerUrl, '/')}/public-decrypt`,
    payload,
    options,
  });
  const result = await request.run();
  return result as FetchPublicDecryptResult;
}
