import type {
  FetchInputProofResult,
  RelayerInputProofOptions,
} from '../types/public-api';
import type { FetchInputProofPayload } from '../types/private-api';
import type { ZKProof } from '@sdk/types/public-api';
import type { BytesHex } from '@base/types/primitives';
import type { FhevmHandle } from '@fhevm-base/types/public-api';
import { RelayerAsyncRequest } from './RelayerAsyncRequest';
import { removeSuffix } from '@base/string';
import { bytesToHexNo0x } from '@base/bytes';
import { uintToHex } from '@base/uint';
import { assertFhevmHandleArrayEquals } from '@fhevm-base/FhevmHandle';

////////////////////////////////////////////////////////////////////////////////
// fetchInputProof
////////////////////////////////////////////////////////////////////////////////

export async function fetchInputProof(
  relayerUrl: string,
  payload: FetchInputProofPayload,
  options?: RelayerInputProofOptions,
): Promise<FetchInputProofResult> {
  const request = new RelayerAsyncRequest({
    relayerOperation: 'INPUT_PROOF',
    url: `${removeSuffix(relayerUrl, '/')}/input-proof`,
    payload,
    options,
  });
  const result = (await request.run()) as FetchInputProofResult;
  return result;
}

////////////////////////////////////////////////////////////////////////////////
// fetchInputProofWithZKProof
////////////////////////////////////////////////////////////////////////////////

export async function fetchInputProofWithZKProof(
  relayerUrl: string,
  payload: {
    zkProof: ZKProof;
    extraData: BytesHex;
  },
  options?: RelayerInputProofOptions,
): Promise<FetchInputProofResult> {
  // 1. Request coprocessor signatures from the relayer for the given ZK proof
  const fetchResult: FetchInputProofResult = await fetchInputProof(
    relayerUrl,
    {
      contractAddress: payload.zkProof.contractAddress,
      userAddress: payload.zkProof.userAddress,
      ciphertextWithInputVerification: bytesToHexNo0x(
        payload.zkProof.ciphertextWithZKProof,
      ),
      contractChainId: uintToHex(payload.zkProof.chainId),
      extraData: payload.extraData,
    },
    options,
  );

  // 2. extract FhevmHandles from the given ZK proof
  const fhevmHandles: FhevmHandle[] = payload.zkProof.getFhevmHandles();

  // 3. Check that the handles and the one in the fetch result
  // Note: this check is theoretically unecessary
  // We prefer to perform this test since we do not trust the relayer
  // The purpose is to check if the relayer is possibly malicious
  assertFhevmHandleArrayEquals(fhevmHandles, fetchResult.handles);

  return fetchResult;
}
