import type { BytesHex } from '@base/types/primitives';
import type { ZKProof } from '@sdk/types/public-api';
import type { FhevmConfig, InputProof } from '@fhevm-base/types/public-api';
import type { RelayerInputProofOptions } from './types/public-api';
import type { FetchInputProofResult } from './types/public-api';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import { fetchInputProofWithZKProof } from './fetch/inputProof';
import { createInputProofFromZKProof } from '@fhevm-base/coprocessor/InputProof';

export async function requestCiphertextWithZKProofVerification(
  fhevm: FhevmChainClient & { config: FhevmConfig; relayerUrl: string },
  args: {
    readonly zkProof: ZKProof;
    readonly extraData: BytesHex;
    readonly options?: RelayerInputProofOptions | undefined;
  },
): Promise<InputProof> {
  const { zkProof, extraData, options } = args;

  // 1. Request coprocessor signatures from the relayer for the given ZK proof
  const fetchResult: FetchInputProofResult = await fetchInputProofWithZKProof(
    fhevm.relayerUrl,
    {
      zkProof,
      extraData,
    },
    options,
  );

  // 2. Verify ZK proof and compute the final Input proof
  return createInputProofFromZKProof(fhevm, {
    zkProof,
    coprocessorSignatures: fetchResult.signatures,
    extraData,
  });
}
